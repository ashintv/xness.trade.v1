// import { describe, it, expect, beforeEach } from "vitest";
// import { TradeManager } from "./tradeManager"; // adjust path if needed
// import { Latest_Price } from "@repo/types/types";

// const latestPrices: Latest_Price = {
// 	BTC: { price: "11232380000000", decimal: 8 },
// 	ETH: { price: "439876000000", decimal: 8 },
// 	SOL: { price: "20600000000", decimal: 8 },
// };

// describe("TradeManager", () => {
// 	let manager: TradeManager;

// 	beforeEach(() => {
// 		manager = new TradeManager(
// 			[],
// 			[
// 				{ username: "alice", usd_balance: "100000000000" },
// 				{ username: "bob", usd_balance: "50000000000" },
// 			]
// 		);
// 		manager.updateLatestPrice(latestPrices);
// 	});

// 	it("should create a new user", () => {
// 		const res = manager.createUser("charlie");
// 		expect(res.status).toBe(200);
// 		expect(res.response_data).toEqual({
// 			username: "charlie",
// 			usd_balance: "50000000",
// 		});
// 	});

// 	it("should not allow order if balance insufficient", () => {
// 		const res = manager.openOrder(
// 			{
// 				asset: "BTC",
// 				type: "long",
// 				margin: 999999999999999,
// 				leverage: 5000000,
// 				slipage: 1000,
	
// 			},
// 			"bob"
// 		);
// 		expect(res.status).toBe(400);
// 		expect(res.response_message).toBe("Insufficent balances");
// 	});

// 	it("should open an order successfully", () => {
// 		const res = manager.openOrder(
// 			{
// 				asset: "ETH",
// 				type: "long",
// 				margin: "10000000",
// 				leverage: "50000",
// 				slipage: "1000",
// 				username: "alice",
// 			},
// 			"alice"
// 		);
// 		expect(res.status).toBe(200);
// 		expect(manager["openOrders"].length).toBe(1);
// 	});

// 	it("should close an order and update balance", () => {
// 		const open = manager.openOrder(
// 			{
// 				asset: "SOL",
// 				type: "long",
// 				margin: "10000000",
// 				leverage: "100000",
// 				slipage: "500",
// 				username: "alice",
// 			},
// 			"alice"
// 		);
// 		const orderId = open.response_data as string;

// 		manager.updateLatestPrice({
// 			...latestPrices,
// 			SOL: { price: "30000000000", decimal: 8 }, // price goes up
// 		});
// 		const close = manager.closeOrder(orderId, "alice");
// 		expect(close.status).toBe(200);
// 		expect(close.response_message).toContain("Order closed successfully");
// 	});

// 	it("should liquidate when price crosses liquidation threshold", () => {
// 		manager.openOrder(
// 			{
// 				asset: "BTC",
// 				type: "long",
// 				margin: "5000000",
// 				leverage: "100000",
// 				slipage: "100",
// 				username: "bob",
// 			},
// 			"bob"
// 		);
// 		expect(manager["openOrders"].length).toBe(1);

// 		// Force liquidation by dropping BTC price massively
// 		manager.updateLatestPrice({
// 			...latestPrices,
// 			BTC: { price: "1000000000", decimal: 8 },
// 		});

// 		expect(manager["openOrders"].length).toBe(0);
// 	});
// });
