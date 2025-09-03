import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { Latest_Price, OpenOrder, OpenOrders, TODO, UserBalance } from "@repo/types/types";

class Engine {
	private redisClient: RedisClientType;
	private latest_prices: Latest_Price = null;
	private openOrders: OpenOrders[] = [];
	private user_balances: UserBalance = {
		"ashintv":{
			usd_balance:999999,
		}
	};

	constructor() {
		this.redisClient = redisClient;
		this.init();
	}

	private async init() {
		try {
			if (!this.redisClient.isOpen) await this.redisClient.connect();
		} catch (e) {
			console.error("Redis connection failed:", e);
			return;
		}

		this.startPriceClient();
		this.startEngine();
	}

	private async openOrder(order: OpenOrder, username: string, id: string) {
		if (!this.latest_prices) return;
		const asset = order.asset;
		if (!this.user_balances[username]) return;
		const open_price = this.latest_prices[asset]?.price as number;
		const qty = (order.margin * order.leverage) / open_price;
		this.user_balances[username].usd_balance -= open_price;
		this.user_balances[username][asset] = qty;
		const order_id = crypto.randomUUID();
		this.openOrders.push({
			...order,
			open_price,
			username,
			order_id,
		});
		await this.sendResponse({
			req_id: id,
			response: order_id,
		});
	}

	private async startPriceClient() {
		while (true) {
			const stream = await this.redisClient.xRead([{ key: "price_data", id: "$" }], { BLOCK: 0, COUNT: 1 });
			if (stream && stream[0]) {
				this.latest_prices = JSON.parse(stream[0].messages[0]?.message.latest_prices as string);
			}
		}
	}

	private async sendResponse(data: { req_id: string; response: string }) {
		await this.redisClient.xAdd("engine_stream", "*", { data: JSON.stringify(data) });
		console.log("response sended", data);
	}

	private async startEngine() {
		while (true) {
			console.log("Starting Engine");
			try {
				const stream = await this.redisClient.xRead([{ key: "engine_jobs", id: "$" }], { BLOCK: 0, COUNT: 1 });
				if (stream && stream[0] && stream[0].messages[0] && stream[0].messages[0].id) {
					const id = stream[0].messages[0].id;
					const data = stream[0].messages[0].message.data;
					if (!data) {
						console.log("data not avl");
						await this.redisClient.xAdd("engine_stream", "*", { res_id: id });
						return;
					}
					const parsed = JSON.parse(data);
					if (parsed.type == "open_order") {
						console.log("open order");
						this.openOrder(parsed.data as OpenOrder, parsed.userId, id);
					}
				}
			} catch (e) {
				console.error("Engine loop error:", e);
				await new Promise((r) => setTimeout(r, 1000));
			}
		}
	}
}

const engine = new Engine();
