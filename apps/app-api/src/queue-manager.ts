import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { TODO } from "@repo/types/types";

export class QueueManager {
	private client: RedisClientType;
	constructor() {
		this.client = redisClient;
		this.init();
	}
	private async init() {
		if (!this.client.isOpen) {
			await this.client.connect();
		}
		try {
			await this.client.xGroupCreate("trades_data", "engine_group", "0", { MKSTREAM: true });
		} catch (err: any) {
			if (err?.message?.includes("BUSYGROUP")) {
				console.log("Group already exists, skipping creation");
			} else {
				throw err;
			}
		}
		this.testQueue();
	}
	async addtoQueue(message: string) {
		const res = await this.client.xAdd("trades_data", "*", { message });
		console.log(res);
	}

	private testQueue() {
		setInterval(() => {
			this.addtoQueue("This is a test message from api-server");
		}, 2 * 1000);
	}
}
