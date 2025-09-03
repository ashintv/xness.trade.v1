import { z } from "zod";

export const AssetScheam = z.enum(["BTC", "SOL", "ETH"] ,  "Invalid Key");
export const TradeSchema = z.enum(['long' , 'short'])

export const OpenTradeSchema = z.object({
	asset: AssetScheam,
	type: TradeSchema,
	margin: z.number("Must be an number"),
	leverage: z.number("Must be an number"),
	slipage: z.number("Must be an number")
});
