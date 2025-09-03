import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { TODO } from "@repo/types/types";

export class QueueManager {
	private client: RedisClientType;
	constructor() {
		this.client = redisClient;
		this.init();
	}
	private async init() {
		try {
			await this.client.connect();
		} catch (e) {
			console.log(e);
		}
	}
	async addtoQueue(data: string): Promise<string> {
		const res = await this.client.xAdd("engine_jobs", "*", { data });
		console.log("ID is", res);
		return res;
	}

	async getQueueData(callback: (data: any, orderId: string) => void, id: string) {
		let msg_id: string | null = null;
		let orderId = null;
		while (msg_id !== id) {
			const stream = await this.client.xRead([{ key: "engine_stream", id: "$" }], { BLOCK: 0, COUNT: 1 });
			if (stream && stream[0]) {
				console.log(stream[0].messages[0]?.message);
				const response = stream[0].messages[0]?.message.data;
				if (!response) return;
				const parse = JSON.parse(response);
				console.log(response);
				console.log(parse);
				msg_id = parse.req_id;
				orderId = parse.response;
			}
			callback(stream, orderId);
		}
	}

	private testQueue() {
		setInterval(() => {
			this.addtoQueue("This is a test message from api-server");
		}, 2 * 1000);
	}
}
