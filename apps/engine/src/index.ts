import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { TODO } from "@repo/types/types";

class Engine {
	private redisClient: RedisClientType;
	private latest_prices: TODO = null;

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

		// Run consumers in parallel
		this.startPriceClient();
		this.startEngine();
	}

	private async startPriceClient() {
		while (true) {
			const stream = await this.redisClient.xRead([{ key: "price_data", id: "$" }], { BLOCK: 0, COUNT: 1 });

			if (stream && stream[0]) {
				this.latest_prices = JSON.parse(stream[0].messages[0]?.message.latest_prices as string);
			}
		}
	}

	private async startEngine() {
		while (true) {
			const stream = await this.redisClient.xRead([{ key: "engine_jobs", id: "$" }], { BLOCK: 0, COUNT: 1 });
			if (stream && stream[0]) {
				const id = stream[0].messages[0]?.id;
				console.log(id);
				if (id) {
					await this.redisClient.xAdd("engin_stream", "*", { res_id:id });
				}
			}
		}
	}
}

const engine = new Engine();
