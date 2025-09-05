import { connectRedis } from "@repo/backend-common/redis";
import { EngineInput, Latest_Price } from "@repo/types/types";
import {toBigIntValue} from "@repo/utils/decimal-covert"
import Websocket from "ws";
const wss = new Websocket("wss://ws.backpack.exchange/");

let data__: Latest_Price = {
	ETH: null,
	BTC: null,
	SOL: null,
};
wss.on("open", () => {
	console.log("Connectes");
	wss.send(JSON.stringify({ method: "SUBSCRIBE", params: ["bookTicker.ETH_USDC"] }));
	wss.send(JSON.stringify({ method: "SUBSCRIBE", params: ["bookTicker.BTC_USDC"] }));
	wss.send(JSON.stringify({ method: "SUBSCRIBE", params: ["bookTicker.SOL_USDC"] }));
});

wss.on("message", (message) => {
	const data = message.toString();
	const parsed = JSON.parse(data);
	console.log(data__);
	data__[parsed.data.s.split("_")[0] as keyof typeof data__] = {
		price: toBigIntValue(parsed.data.a, 8),
		decimal: 8,
	};
});

async function startPublishing() {
	const Pub = await connectRedis();
	setInterval(async () => {
		const enginein: EngineInput = {
			verify_id: crypto.randomUUID(),
			type: "updated_price",
			data: data__,
		};
		await Pub.xAdd("engine_input", "*", { data: JSON.stringify(enginein) });
	}, 100);
}
startPublishing();
