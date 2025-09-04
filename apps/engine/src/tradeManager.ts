import { Latest_Price, OpenOrder, OpenOrders, UserBalance } from "@repo/types/types";

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
	openOrder(order: OpenOrder, username: string): string {
		const order_id = crypto.randomUUID();
		console.log(`Created order ${JSON.stringify(order)} for user ${username}`);

		// add logic here
		return order_id;
	}

	/**
	 * close an order in engine
	 * @param order_id
	 * @returns
	 */
	closeOrder(order_id: string , username: string): UserBalance {
		// close the order
		// reduce balance
		const balance = this.getBalance(username);
		return balance;
	}

	/**
	 * create a user in the engine with initial balance
	 * returs user object
	 * create a new only if no old one exists
	 * @param username
	 * @returns
	 */
	createUser(username: string): UserBalance {
		let user = this.userBalances.find((u) => u.username == username);
		if (user) {
			console.log("user alerady exist");
			return user;
		}
		this.userBalances.push();
		user = {
			username,
			usd_balance: 500000,
		};
		this.userBalances.push(user);
		return user;
	}

	/**
	 * to get balnce of user
	 * @param username
	 * @returns
	 */

	getBalance(username: string): UserBalance {
		let user = this.userBalances.find((u) => u.username == username);
		return user!;
	}
	/**
	 * udapte latest prices
	 * @param username
	 * @returns
	 */
	updateLatestPrice(latest_Price: Latest_Price) {
		this.latest_prices = latest_Price;
	}
}
