import express from "express";
import cors from "cors";
import { userRouter } from "./routes/user";
import { JWT_COOKIE_SECRET, JWT_SECRET } from "@repo/backend-common/index";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/v1/user", userRouter);

app.listen(3000 , ()=>{
    console.log(JWT_COOKIE_SECRET  , JWT_SECRET)
});
