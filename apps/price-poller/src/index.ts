import { connectRedis } from "@repo/backend-common/redis";
import Websocket from "ws";
const wss = new Websocket("wss://ws.backpack.exchange/");

let data__: {
	ETH_USDC: any;
	BTC_USDC: any;
	SOL_USDC: any;
} = {
	ETH_USDC: null,
	BTC_USDC: null,
	SOL_USDC: null,
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
		asset: parsed.data.s.split("_")[0],
		price: parsed.data.a,
		decimal: 8,
	};
});

async function startPublishing() {
	const Pub = await connectRedis();
	setInterval(async () => {
		await Pub.publish("backpack", JSON.stringify({ updated_prices: data__ }));
		console.log("Data Updated");
	}, 100);
}
startPublishing()