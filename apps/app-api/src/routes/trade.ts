import { OpenTradeSchema } from "@repo/types/schemas";
import express, { Router } from "express";
import { queueManager } from "..";

export const tradeRouter: Router = express.Router();

tradeRouter.post("/create", async (req, res) => {
	// asuusming user id will be this
	// TODO meiidleware

	res.setTimeout(10 * 1000, () => {
		console.log("Timeout");
		res.status(504).send("Timeout");
	});

	const userId = "ashintv";
	const parse = OpenTradeSchema.safeParse(req.body);
	if (!parse.success) {
		res.status(400).json({
			message: "invalid data",
		});
	}

	const id = await queueManager.addtoQueue(
		JSON.stringify({
			userId,
			type: "open_order",
			data: parse.data,
		})
	);

	await queueManager.getQueueData((data , orderId) => {
		res.status(200).json({orderId});
	}, id);
});

tradeRouter.post("/close", (req, res) => {
	const { orderId } = req.body;
	if (!orderId) {
		res.status(400).json({
			message: "No orderId provided",
		});
	}
	//again push to que
	//how does api know updated balce after engin process

	res.json({
		balance: 999,
	});
});
