import { UserBalance, UserRequest } from "@repo/types/types";
import express, { Router } from "express";
import { queueManager } from "..";
import { ScaleToReal } from "@repo/utils/decimal-covert";
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

	const userBalance  = response?.response_data as UserBalance
	if (response) {
		res.json({ balance:ScaleToReal(userBalance.usd_balance,8), message: response.response_message });
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


