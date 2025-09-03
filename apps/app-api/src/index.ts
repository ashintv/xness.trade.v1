import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { JWT_COOKIE_SECRET, JWT_SECRET } from "@repo/backend-common/index";
import { QueueManager } from "./queue-manager";
const queueManager = new QueueManager();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);

app.get("/health", (req, res) => {
	res.send("Helth check");
	queueManager.addtoQueue("Hy health check message");
});

app.listen(3000, () => {
	console.log(JWT_COOKIE_SECRET, JWT_SECRET);
});
