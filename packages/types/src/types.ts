import { AssetScheam, OpenTradeSchema, TradeSchema } from "./schemas.js";
import { z } from "zod";

export type TODO = any;

export type Trade = z.infer<typeof TradeSchema>;
export type Assets = z.infer<typeof AssetScheam>;

export type OpenOrder = z.infer<typeof OpenTradeSchema>;

export type OpenOrders = {
    asset: Assets;
    type: "long" | "short";
	username: string;
	open_price: bigint;
	order_id: string;
	margin: bigint;
	leverage: bigint;
	slipage: bigint;
    quantity: bigint;
};

export type Price = {
	price: string
	decimal: number
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
	usd_balance: string;
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

export type EngineResponse ={
    status: 400 | 200
    response_data?: UserBalance | OpenOrders | string
    response_message: string 
}