import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { JWT_COOKIE_SECRET, JWT_SECRET } from "@repo/backend-common/index";
import { QueueManager } from "./queue-manager";

import { tradeRouter } from "./routes/trade";
export const queueManager = new QueueManager();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/trade", tradeRouter);

app.get("/health", async (req, res) => {
	await queueManager.addtoQueue("Hy health check message");
	res.send("Helth check");
});

app.listen(3000,() => {
	console.log(JWT_COOKIE_SECRET, JWT_SECRET);
	setTimeout(async () => {
		// const id = await queueManager.addtoQueue("Server started started");
		// await queueManager.getQueueData((data) => {
		// 	console.log(data);
		// }, id);
	}, 5 * 1000);
});
