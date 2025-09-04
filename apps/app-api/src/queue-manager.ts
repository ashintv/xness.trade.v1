import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { UserRequest } from "@repo/types/types";

export class QueueManager {
	private writer: RedisClientType;
	private reader: RedisClientType;
	private last_id: string = "0";
	constructor() {
		this.writer = redisClient;
		this.reader = redisClient.duplicate();
		this.init();
	}
	private async init() {
		try {
			await this.writer.connect();
			await this.reader.connect();
		} catch (e) {
			console.log(e);
		}
	}
	async sendToEngine(data: UserRequest): Promise<string | null> {
		const verify_id = crypto.randomUUID();
		this.writer.xAdd("engine_input", "*", { data: JSON.stringify({ verify_id, type: "user_request", data }) });
		const start_time = Date.now();
		const time_out = 3 * 1000;
		while (true) {
			if (Date.now() - start_time > time_out) {
				return null;
			}
			const stream = await this.reader.xRead([{ key: "engine_stream", id: "$" }], { BLOCK: 100, COUNT: 10 });
			if (stream && stream[0]) {
				const response = stream[0].messages[0]?.message.data;
				if (!response) continue;
				const parse = JSON.parse(response);
				console.log(parse);
				if (parse.verify_id == verify_id) {
					return parse.data;
				}
			}
		}
	}
}

// private testQueue() {
// 	setInterval(() => {
// 		this.addtoQueue("This is a test message from api-server");
// 	}, 2 * 1000);
// }
