import { config } from "dotenv";
config()
export const JWT_SECRET = process.env.JWT_SECRTET;
export const JWT_COOKIE_SECRET = process.env.JWT_COOKIE_SECRET;