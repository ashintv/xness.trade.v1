import { connectRedis } from "@repo/backend-common/redis";
import { Latest_Price } from "@repo/types/types";
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
	console.log(parsed.data);
	data__[parsed.data.s as keyof typeof data__] = {
		price: parsed.data.a,
		decimal: 8,
	};
});

async function startPublishing() {
	const Pub = await connectRedis();
	setInterval(async () => {
		await Pub.xAdd("price_data", "*", { latest_prices: JSON.stringify(data__) });
	}, 100);
}
startPublishing();
