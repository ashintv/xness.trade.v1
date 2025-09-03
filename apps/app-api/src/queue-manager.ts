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
	async addtoQueue(message: string): Promise<string> {
		const res = await this.client.xAdd("engine_jobs", "*", { message });
		console.log('mesasdasd')
		return res;
	}

	async getQueueData(callback: (data: any) => void ,  id:string) {
		let msg_id:string | null = null
		while (msg_id!==id) {
			const stream = await this.client.xRead([{ key: "engin_stream", id: "$" } ], { BLOCK: 0, COUNT: 1 });
			if (stream && stream[0]) {
				const data = stream[0].messages[0]?.message;
				msg_id = data?.res_id!
			}
			callback(stream);
		}
	}

	private testQueue() {
		setInterval(() => {
			this.addtoQueue("This is a test message from api-server");
		}, 2 * 1000);
	}
}
