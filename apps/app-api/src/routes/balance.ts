import { UserRequest } from "@repo/types/types";
import express, { Router } from "express";
import { queueManager } from "..";
export const balanceRouter: Router = express.Router();

balanceRouter.get("/", async (req, res) => {
	// asuusming user id will be this
	// TODO meiidleware
	const verify_id = crypto.randomUUID();
	const input: UserRequest = {
		req_type: "get_balance",
		username: "ashintv",
		request: "",
	};
	const response = await queueManager.sendToEngine(input);
	if (response) {
		res.json({ response });
		return;
	}
});

// same workflow just parse ans send
balanceRouter.post("/usd", (req, res) => {
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


