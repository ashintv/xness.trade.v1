import { ASSET_DECIMAL, BALNCE_DECIMAL, toRealValue } from "@repo/utils/decimal-covert";
import { EngineResponse, Latest_Price, OpenOrder, OpenOrderRequest, OpenOrders, UserBalance } from "@repo/types/types";

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
	openOrder(order: OpenOrderRequest, username: string): EngineResponse {
		const DECIMAL_BASE = 100000000n; // 1e8

		// 1️⃣ Parse inputs
		const margin_int = BigInt(order.margin); // scaled margin
		const leverage_int = BigInt(order.leverage);
		const slipage_int = BigInt(order.slipage);
		const user = this.userBalances.find((u) => u.username == username)!;

		if (margin_int > BigInt(user.usd_balance)) {
			return {
				status: 400,
				response_data: user,
				response_message: "Insufficient balances",
			};
		}

		if (this.latest_prices == null || this.latest_prices[order.asset] == null) {
			return {
				status: 400,
				response_message: "Invalid asset or asset not available",
			};
		}

		// should confirm this calculation with some test cases for better understanding
		// little confused with the notional calculations because of scaling
		const price_int = BigInt(this.latest_prices[order.asset]!.price);

		const notional_scaled = margin_int * leverage_int;

		const qty_int = (notional_scaled * DECIMAL_BASE) / price_int;

		const actual_notional_int = (qty_int * price_int) / DECIMAL_BASE;
		const actual_margin_int = actual_notional_int / leverage_int;

		console.log("===== OPEN ORDER LOG =====");
		console.log("User:", username);
		console.log("Inputs:", {
			margin_int: margin_int.toString(),
			leverage_int: leverage_int.toString(),
			slipage_int: slipage_int.toString(),
			price_int: price_int.toString(),
		});
		console.log("Computed Values:", {
			notional_scaled: notional_scaled.toString(),
			qty_int: qty_int.toString(),
			actual_notional_int: actual_notional_int.toString(),
			actual_margin_int: actual_margin_int.toString(),
		});

		let min_price_int: bigint | null = null;
		let max_price_int: bigint | null = null;

		if (order.type === "long") {
			max_price_int = (price_int * (10000n + slipage_int)) / 10000n;
			console.log("Long order: max_price_int =", max_price_int.toString());
			if (max_price_int < price_int) return { status: 400, response_message: "Slippage effect" };
		} else {
			min_price_int = (price_int * (10000n - slipage_int)) / 10000n;
			console.log("Short order: min_price_int =", min_price_int.toString());
			if (min_price_int > price_int) return { status: 400, response_message: "Slippage effect" };
		}

		console.log("User balance before:", user.usd_balance);
		user.usd_balance = (BigInt(user.usd_balance) - actual_margin_int).toString();
		console.log("User balance after:", user.usd_balance);

		const order_id = crypto.randomUUID();
		this.openOrders.push({
			asset: order.asset,
			type: order.type,
			margin: actual_margin_int.toString(),
			leverage: leverage_int.toString(),
			slipage: slipage_int.toString(),
			username,
			open_price: price_int.toString(),
			order_id,
			quantity: qty_int.toString(),
		});

		console.log(`✅ Created order for ${username}: ${qty_int} units of ${order.asset}`);
		console.log("Order ID:", order_id);
		console.log("============================");

		return { status: 200, response_data: order_id, response_message: "Order opened successfully" };
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
		if (!this.latest_prices) {
			return { status: 400, response_message: "Market data not available" };
		}

		// 1️⃣ Find the order
		const order = this.openOrders.find((o) => o.order_id === order_id && o.username === username);
		if (!order) {
			return { status: 400, response_message: "Invalid order ID" };
		}

		const user = this.userBalances.find((u) => u.username === username)!;

		// 2️⃣ Get latest price
		const close_price = BigInt(this.latest_prices[order.asset]?.price!);

		// 3️⃣ Calculate PnL
		const pnl_int = this.calculatePnL(BigInt(order.open_price), close_price, BigInt(order.quantity), order.type);

		// 4️⃣ Update user balance
		const old_balance = BigInt(user.usd_balance);
		const new_balance = old_balance + BigInt(order.margin) + pnl_int;
		user.usd_balance = new_balance.toString();

		// 5️⃣ Remove order from openOrders
		this.openOrders = this.openOrders.filter((o) => o.order_id !== order_id);

		// 6️⃣ Log all details
		console.log("===== CLOSE ORDER LOG =====");
		console.log("User:", username);
		console.log("Order ID:", order_id);
		console.log("Asset:", order.asset);
		console.log("Order Type:", order.type);
		console.log("Open Price (scaled):", order.open_price);
		console.log("Close Price (scaled):", close_price.toString());
		console.log("Quantity (scaled):", order.quantity);
		console.log("Margin (scaled):", order.margin);
		console.log("User Balance Before:", old_balance.toString());
		console.log("PnL (scaled):", pnl_int.toString());
		console.log("PnL (real USD):", toRealValue(pnl_int, 8));
		console.log("User Balance After:", new_balance.toString());
		console.log("============================");

		return {
			status: 200,
			response_data: user,
			response_message: `Order closed successfully with PnL: ${toRealValue(pnl_int, 8)}`,
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
		return snapshot;
	}
}
