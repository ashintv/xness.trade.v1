import { AssetScheam, OpenTradeSchema, TradeSchema } from "./schemas.js";
import { z } from "zod";

export type TODO = any;

export type Trade = z.infer<typeof TradeSchema>;
export type Assets = z.infer<typeof AssetScheam>;

export type OpenOrder = z.infer<typeof OpenTradeSchema>;

export type OpenOrders = OpenOrder & {
	username: string;
	open_price: number;
	order_id: string;
};

export type Price = {
	price: number;
	decimal: number;
} | null;

export type Latest_Price = Record<Assets, Price> | null;

export type AssetBalance = Record<Assets, number>;

export type Balance = {
	usd_balance: number;
	BTC?: number;
	SOL?: number;
	ETH?: number;
};

// export type UserBalance = Record<string, Balance>;

export type UserBalance = {
	username: string;
	usd_balance: number;
	BTC?: number;
	SOL?: number;
	ETH?: number;
};

export type UserRequest = {
	req_type: "open_order" | "close_order" | "get_balance" | "add_user";
	request: OpenOrder | string;
	username: string;
}; 

export type EngineInput = {
	verify_id: string;
	type: "updated_price" | "user_request";
	data: Latest_Price | UserRequest;
};
