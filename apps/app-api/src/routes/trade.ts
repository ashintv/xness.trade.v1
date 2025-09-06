import { OpenOrderRequest, UserBalance, UserRequest } from "@repo/types/types";
import { OpenTradeSchema } from "@repo/types/schemas";
import express, { Router } from "express";
import { queueManager } from "..";
import { ScaleToDecimal, ScaleToReal } from "@repo/utils/decimal-covert";

export const tradeRouter: Router = express.Router();

tradeRouter.post("/create", async (req, res) => {
	// asuusming user id will be this
	// TODO meiidleware
	const username = "ashintv";
	const parse = OpenTradeSchema.safeParse(req.body);
	if (!parse.success) {
		res.status(400).json({
			message: "invalid data",
		});
		return;
	}
	const order: OpenOrderRequest = {
		asset: parse.data.asset,
		type: parse.data.type,
		margin: ScaleToDecimal(parse.data.margin, 6),
		leverage: parse.data.leverage,
		slipage: ScaleToDecimal(parse.data.slipage, 6),
	};
	console.log(order);
	const input: UserRequest = {
		req_type: "open_order",
		username,
		request: order,
	};
	const response = await queueManager.sendToEngine(input);
	if (response) {
		res.status(response.status!).json({ data: response.response_data, message: response.response_message });
		return;
	}
	res.status(504).send("Timeout");
});

tradeRouter.post("/close", async (req, res) => {
	res.setTimeout(10 * 1000, () => {
		console.log("Timeout");
		res.status(504).send("Timeout");
	});
	const { orderId } = req.body;
	if (!orderId) {
		res.status(400).json({
			message: "No orderId provided",
		});
		return;
	}
	const response = await queueManager.sendToEngine({
		req_type: "close_order",
		username: "ashintv",
		request: orderId,
	});

	const userBalance = response?.response_data as UserBalance;
	if (response) {
		res.json({ balance: ScaleToReal(userBalance.usd_balance, 8), message: response.response_message });
		return;
	}
	res.status(404).send("Timeout");
});
