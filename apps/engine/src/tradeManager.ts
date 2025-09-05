import { ASSET_DECIMAL, BALNCE_DECIMAL, toRealValue } from "@repo/utils/decimal-covert";
import { EngineResponse, Latest_Price, OpenOrder, OpenOrders, UserBalance } from "@repo/types/types";

const DECIMAL_BASE = 100000000n; // 10^8 for precision in calculations
export class TradeManager {
	private openOrders: OpenOrders[];
	private latest_prices: Latest_Price = null;
	private userBalances: UserBalance[];

	constructor(open_orders: OpenOrders[], user_balance: UserBalance[]) {
		((this.openOrders = open_orders), (this.userBalances = user_balance));
	}

	/**
	 * open a new order in engine
	 * @param order
	 * @returns
	 */
	openOrder(order: OpenOrder, username: string): EngineResponse {
		const margin_int = BigInt(order.margin);
		const user = this.userBalances.find((u) => u.username == username)!;
		if (margin_int > BigInt(user.usd_balance)) {
			return {
				status: 400,
				response_message: "Insufficent balances",
			};
		}
		const leverage_int = BigInt(order.leverage);
		if (this.latest_prices == null || this.latest_prices[order.asset] == null) {
			return {
				status: 400,
				response_message: "Invalid asset or asset not available",
			};
		}
		const price_int = BigInt(this.latest_prices[order.asset]!.price);
		const slipage_int = BigInt(order.slipage);
		let min_price_int: bigint | null = null;
		let max_price_int: bigint | null = null;

		const notional_int = (margin_int * leverage_int) / DECIMAL_BASE;
		const qty_int = (notional_int * DECIMAL_BASE) / price_int;
		const actual_notional_int = (qty_int * price_int) / DECIMAL_BASE;
		const actual_margin_int = (actual_notional_int * DECIMAL_BASE) / leverage_int;

		if (order.type === "long") {
			max_price_int = (price_int * (10000n + slipage_int)) / 10000n;
			if (max_price_int < price_int) {
				return {
					status: 400,
					response_message: "Slippage effect",
				};
			}
		} else {
			min_price_int = (price_int * (10000n - slipage_int)) / 10000n;
			if (min_price_int > price_int) {
				return {
					status: 400,
					response_message: "Slippage effect",
				};
			}
		}
		console.log(user, actual_margin_int.toString());
		user.usd_balance = (BigInt(user.usd_balance) - actual_margin_int).toString();
		console.log(user);
		const order_id = crypto.randomUUID();
		this.openOrders.push({
			asset: order.asset,
			type: order.type,
			margin: actual_margin_int.toString(),
			leverage: leverage_int.toString(),
			slipage: slipage_int.toString(),
			username,
			open_price: price_int.toString()	,
			order_id,
			quantity: qty_int.toString(),
		});
		console.log(`Created order ${qty_int} for user ${username}`);

		// add logic here
		return {
			status: 200,
			response_data: order_id,
			response_message: "Order opened successfully",
		};
	}

	/**
	 * create a user in the engine with initial balance
	 * returs user object
	 * create a new only if no old one exists
	 * @param username
	 * @returns
	 */
	createUser(username: string): EngineResponse {
		let user = this.userBalances.find((u) => u.username == username);
		if (user) {
			console.log("user alerady exist");
			return {
				status: 400,
				response_message: "User already exists",
			};
		}
		user = {
			username,
			usd_balance: "50000000",
		};
		this.userBalances.push(user);
		return {
			status: 200,
			response_data: user,
			response_message: "User created successfully",
		};
	}

	/**
	 * to get balnce of user
	 * @param username
	 * @returns
	 */
	getBalance(username: string): EngineResponse {
		let user = this.userBalances.find((u) => u.username == username);
		if (!user) {
			return {
				status: 400,
				response_message: "User not found",
			};
		}
		return {
			status: 200,
			response_data: user,
			response_message: "User balance retrieved successfully",
		};
	}

	/**
	 * update latest prices
	 * @param username
	 * @returns
	 */
	updateLatestPrice(latest_Price: Latest_Price) {
		this.latest_prices = latest_Price;
		this.checkLiquidation();
	}

	/**
	 * close an order in engine
	 * @param order_id
	 * @returns
	 */
	closeOrder(order_id: string, username: string): EngineResponse {
		const order = this.openOrders.find((o) => o.order_id === order_id && o.username === username);
		if (!order || !this.latest_prices) {
			return {
				status: 400,
				response_message: "Invalid order Id or Market not available",
			};
		}
		const close_price = BigInt(this.latest_prices[order.asset]?.price!);
		const pnl_int = this.calculatePnL(BigInt(order.open_price), close_price, BigInt(order.quantity), order.type);
		const user = this.userBalances.find((u) => u.username === username)!;
		const new_balance = BigInt(user.usd_balance) + BigInt(order.margin) + pnl_int;
		user.usd_balance = new_balance.toString();
		this.openOrders = this.openOrders.filter((o) => o.order_id !== order_id);

		return {
			status: 200,
			response_data: user,
			response_message: `Order closed successfully with PnL: ${toRealValue(pnl_int, 4)}`,
		};
	}

	/**
	 * return pnl based of currernt price
	 * @param open_price
	 * @param close_price
	 * @param qty_int
	 * @param type
	 * @returns
	 */

	private calculatePnL(open_price: bigint, close_price: bigint, qty_int: bigint, type: "long" | "short"): bigint {
		let pnl_int: bigint;

		if (type === "long") {
			pnl_int = ((close_price - open_price) * qty_int) / DECIMAL_BASE;
		} else {
			pnl_int = ((open_price - close_price) * qty_int) / DECIMAL_BASE;
		}
		return pnl_int;
	}

	private getLiquidationPrice(
		price_int: bigint,
		leverage_int: bigint,
		type: "long" | "short",
		maintMargin: bigint = 50n
	): bigint {
		let liq_price_int: bigint;
		if (type === "long") {
			// Entry * (Leverage - 10000 + maintMargin) / Leverage
			liq_price_int = (price_int * (leverage_int - 10000n + maintMargin)) / leverage_int;
		} else {
			// Entry * (Leverage + 10000 - maintMargin) / Leverage
			liq_price_int = (price_int * (leverage_int + 10000n - maintMargin)) / leverage_int;
		}
		return liq_price_int;
	}

	private checkLiquidation() {
		this.openOrders.forEach((order) => {
			if (!this.latest_prices) return false;
			const liq_price = this.getLiquidationPrice(BigInt(order.open_price), BigInt(order.leverage), order.type);
			const current_price = BigInt(this.latest_prices[order.asset]?.price!);
			if (
				(order.type === "long" && current_price < liq_price) ||
				(order.type === "short" && current_price > liq_price)
			) {
				this.closeOrder(order.order_id, order.username);
			}
		});
	}

	getSnapshot() {
		
		const snapshot = {
			openOrders: this.openOrders,
			userBalances: this.userBalances,
			latestPrices: this.latest_prices,
		};
		console.log("Snapshot taken", snapshot);
		return snapshot;
	}
}
