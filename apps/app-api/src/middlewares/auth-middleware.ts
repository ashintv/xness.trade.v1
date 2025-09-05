import { JWT_COOKIE_SECRET } from "@repo/backend-common/index";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middleware(req: Request, res: Response, next: NextFunction) {
	const token = req.headers["authorization"];
	if (!token) {
		res.status(400).json({
			message: "Forbidden",
		});
		return;
	}
	try {
		const verify = jwt.verify(token, JWT_COOKIE_SECRET!) as JwtPayload;
		//@ts-ignore
        req.username = verify.username
        next()
	} catch (e) {
		res.status(400).json({
			message: "Forbidden",
		});
		return;
	}
}
