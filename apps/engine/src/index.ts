import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { TODO } from "@repo/types/types";

class Engine {
	private priceClient: RedisClientType;
	private latest_prices: TODO = null;
	private queueClient: RedisClientType;
	constructor() {
		this.priceClient = redisClient;
		this.queueClient = redisClient.duplicate();
		this.init();
	}
	private async init() {
		try {
			await this.priceClient.connect();
			await this.queueClient.connect();
		} catch (e) {
			console.log(e);
		}
		await this.startPriceClient();
		this.startEngine();
	}
	private async startPriceClient() {
		await this.priceClient.subscribe("backpack", (message) => {
			this.latest_prices = JSON.parse(message as string);
		});
	}

	private async startEngine() {
		while (1) {
			const stream = await this.queueClient.xReadGroup("engine_group", "consumer", [{ key: "trades_data", id: ">" }], {
				BLOCK: 0,
				COUNT: 10,
			});
			if (stream && stream[0]) {
				for (const msg of stream[0].messages) {
					console.log("Processing:", msg);
                    console.log("data is .......:", this.latest_prices);
				}
			}
		}
	}
}

const engine = new Engine();
