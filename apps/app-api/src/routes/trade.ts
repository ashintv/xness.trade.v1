import { OpenTradeSchema } from "@repo/types/schemas";
import express from "express";

const tradeRouter = express.Router();

tradeRouter.post("create", async (req, res) => {
	const parse = OpenTradeSchema.safeParse(req.body);
	if (!parse.success) {
		res.status(400).json({
			message: "invalid data",
		});
	}
	// add to queue
	// is it dequeue?
	// how does api can confirm
	//
    /**
     * if we are using full duplex queue: suppose n*1000 users are in the platform (creating orders) 
     * doed thid duplex quee arch teacture effect the performance ( fast )
     */
	// or just add to que and send response??

	res.json({
		orderId: "this should be an orderId",
	});
});

tradeRouter.post("close", (req, res) => {
    const {orderId } = req.body
    if(!orderId){
        res.status(400).json({
            message:"No orderId provided"
        })
    }
    //again push to que 
    //how does api know updated balce after engin process



    res.json({
        balance:999
    })

 });
