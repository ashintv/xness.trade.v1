import express, { Router } from "express";
export const userRouter: Router = express.Router();
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_COOKIE_SECRET, JWT_SECRET } from "@repo/backend-common/index";
import { sendEmail } from "@repo/backend-common/mail";
import { queueManager } from "..";
export const users: string[] = [];

//as of now only sign and signup
userRouter.post("/signin", async (req, res) => {
	console.log(JWT_SECRET);
	console.log('hit')
	const  email  = req.body.email;
	if (!email) {
		res.status(200).json({
			message: "Please Send A Valid email",
		});
		return
	}
	if (!users.includes(email)) {
		users.push(email);
	}
	const key = jwt.sign({ email }, JWT_SECRET as string);
	const message = `Please click the following link to Signin http://localhost:3000/api/v1/user/auth?token=${key}`;
	const success = await sendEmail(email, message, "Authentication");
	if(!success){
		res.status(500).json({message:"Serveice Unavialable please try again later"})
	}
	res.status(200).json({
		message: "An email has send your registerd email for authentication",
	});
});

userRouter.get("/auth",async (req, res) => {
	const { token } = req.query;
	if (!token) {
		res.status(401).json({ message: "No token provided" });
		return;
	}
	try {
		const verify = jwt.verify(token as string, JWT_SECRET!) as JwtPayload;
		const cookie = jwt.sign({ email: verify.email }, JWT_COOKIE_SECRET!);
		res.cookie("auth_cookie", cookie);
		res.redirect("https://www.google.com");
		const response = await queueManager.sendToEngine({
			req_type: "add_user",
			username: verify.email,
			request: cookie,
		});
		if (response) {
			res.json({ response });
			return;
		}
		res.status(404).send("Timeout");

	} catch (e) {
		res.status(403).json({ message: "Invalid token" });
	}
});
