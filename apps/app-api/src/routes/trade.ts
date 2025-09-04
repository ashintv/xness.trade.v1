import { OpenOrder, UserRequest } from "@repo/types/types";
import { OpenTradeSchema } from "@repo/types/schemas";
import express, { Router } from "express";
import { queueManager } from "..";

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
	}

	const input: UserRequest = {
		req_type: "open_order",
		username,
		request: parse.data as OpenOrder,
	};
	const response = await queueManager.sendToEngine(input);
	if (response) {
		res.json({ response });
		return;
	}
	res.status(404).send("Timeout");
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
	if (response) {
		res.json({ response });
		return;
	}
	res.status(404).send("Timeout");
});
