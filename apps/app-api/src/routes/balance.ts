
import express from "express";

const balanceRouter = express.Router();

balanceRouter.get("/usd", async (req, res) => {
    //user id from middleware
	const userId = 'adfsjkjb'
	
	
	res.json({
		balance:"adsn" //  usd balance
	});
});

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
