import mongoose from "mongoose";

const tradeSnapshotSchema = new mongoose.Schema({
	openOrders: { type: Array, default: [] },
	latestPrices: { type: Object, default: {} },
	userBalances: { type: Array, default: [] },
});

const TradeSnapshot = mongoose.model("TradeSnapshot", tradeSnapshotSchema);

export { TradeSnapshot };
