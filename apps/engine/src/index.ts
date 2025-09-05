import { redisClient, RedisClientType } from "@repo/backend-common/redis";
import mongoose from "mongoose";
import {
	EngineInput,
	EngineResponse,
	Latest_Price,
	OpenOrder,
	OpenOrders,
	UserBalance,
	UserRequest,
} from "@repo/types/types";
import { TradeManager } from "./tradeManager";
import { mongo } from "mongoose";
import { TradeSnapshot } from "./db";

export const fixed_latestPrices: Latest_Price = {
	BTC: { price: "11232380000000", decimal: 8 },
	ETH: { price: "439876000000", decimal: 8 },
	SOL: { price: "20600000000", decimal: 8 },
};

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
		console.log("Engine Connnectes");
		await this.resposeClient.connect();
		await this.redisClient.connect();
		await mongoose.connect("mongodb://localhost:27017/xnessengine");
		console.log("MongoDB Connected");
		this.saveSnapshot();
		await this.StartEngine();

	}
	private async StartEngine() {
		while (true) {
			const stream = await this.redisClient.xRead([{ key: "engine_input", id: "$" }], { BLOCK: 0, COUNT: 1 });
			if (stream && stream[0]) {
				const parse: EngineInput = JSON.parse(stream[0].messages[0]?.message.data as string);
				if (parse.type == "updated_price") {
					this.trademanager.updateLatestPrice(parse.data as Latest_Price);
					// this.trademanager.updateLatestPrice(fixed_latestPrices);
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
			await this.sendResponse(balance);
		} else if (request.req_type == "get_balance") {
			const balance = this.trademanager.getBalance(request.username);
			await this.sendResponse(balance);
		} else if (request.req_type == "add_user") {
			const user = this.trademanager.createUser(request.username);
			await this.sendResponse(user);
		}
	}

	private async sendResponse(data: EngineResponse) {
		await this.resposeClient.xAdd("engine_stream", "*", {
			data: JSON.stringify({
				verify_id: this.response_id,
				data,
			}),
		});
		console.log("response sended", data);
	}

	/**
	 * Get the current state snapshot of the trade manager and  save to redis and mongoose
	 */

	private async saveSnapshot() {
		setInterval(async () => {
			const snapshot = this.trademanager.getSnapshot();
			//optional: save to mongoose
			// await this.redisClient.set("engine_snapshot", JSON.stringify(snapshot));
			// await TradeSnapshot.create(snapshot);
			console.log("Snapshot saved");
		}, 1000);
	}
}

export const test_userBalances: UserBalance[] = [
	{ username: "ashintv", usd_balance: "500000000000" },
	{ username: "bob", usd_balance: "300000000000" },
	{ username: "charlie", usd_balance: "150000000000" },
	{ username: "diana", usd_balance: "1000000000000" },
	{ username: "eve", usd_balance: "200000000000" },
];

const tradeManager = new TradeManager([], test_userBalances);
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
