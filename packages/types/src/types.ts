import { AssetScheam, TradeSchema } from "./schemas.js";
import { z } from "zod";

export type TODO = any;

export type Trade = z.infer<typeof TradeSchema>;
export type Assets = z.infer<typeof AssetScheam>;
