import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import { EngineInput, Latest_Price, OpenOrder, OpenOrders, UserBalance, UserRequest } from "@repo/types/types";
import { TradeManager } from "./tradeManager";

export class Engine_v2 {
	private redisClient: RedisClientType;
	private resposeClient: RedisClientType;
	private trademanager: TradeManager;
	private response_id: string = "";
	constructor(trademanager: TradeManager) {
		this.redisClient = redisClient;
		this.resposeClient = redisClient.duplicate();
		this.trademanager = trademanager;
		this.init();
	}
	private async init() {
		await this.redisClient.connect();
		console.log("Engine Connnectes");
		await this.resposeClient.connect();
		await this.StartEngine();
	}
	private async StartEngine() {
		while (true) {
			const stream = await this.redisClient.xRead([{ key: "engine_input", id: "$" }], { BLOCK: 0, COUNT: 1 });
			if (stream && stream[0]) {
				const parse: EngineInput = JSON.parse(stream[0].messages[0]?.message.data as string);
				if (parse.type == "updated_price") {
					this.trademanager.updateLatestPrice(parse.data as Latest_Price);
				} else {
					this.response_id = parse.verify_id;
					const request = parse.data as UserRequest;
					await this.handleUser(request);
				}
			}
		}
	}

	/**
	 * handles users_requests based on request type
	 * @param request
	 * @param id
	 */
	private async handleUser(request: UserRequest) {
		console.log(request);
		if (request.req_type == "open_order") {
			const order_id = this.trademanager.openOrder(request.request as OpenOrder, request.username);
			await this.sendResponse(order_id);
		} else if (request.req_type == "close_order") {
			const balance = this.trademanager.closeOrder(request.request as string, request.username);
			await this.sendResponse(JSON.stringify(balance));
		} else if (request.req_type == "get_balance") {
			const balance = this.trademanager.getBalance(request.username);
			await this.sendResponse(JSON.stringify(balance));
		} else if (request.req_type == "add_user") {
			const user = this.trademanager.createUser(request.username);
			await this.sendResponse(JSON.stringify(user));
		}
	}

	private async sendResponse(data: string) {
		await this.resposeClient.xAdd("engine_stream", "*", {
			data: JSON.stringify({
				verify_id: this.response_id,
				data,
			}),
		});
		console.log("response sended", data);
	}
}



const tradeManager = new TradeManager(
	[],
	[
		{
			username: "ashintv",
			usd_balance: 90909,
		},
	]
);
const enh = new Engine_v2(tradeManager);







// [
// 	{
// 		username: "ashintv",
// 		usd_balance: 90909,
// 	},
// ];

//   type: 'user_request',
//   data:
//     req_type: 'open_order',
//     username: 'ashintv',
//     request:
//       asset: 'BTC',
//       type: 'long',
//       margin: 1000,
//       leverage: 5,
//       slipage: 0.5

