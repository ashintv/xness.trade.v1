
export const  BALNCE_DECIMAL = 10000n
export const ASSET_DECIMAL = 100000000n;


/**
 * Converts a real number to a decimal number.
 * @param value The value to convert.
 * @returns The decimal representation of the value.
 */
export function toBigIntValue(value: number | string, decimalPlaces: number): string {
	if (typeof value === "string") value = parseFloat(value);
	return BigInt(Math.round(value * Math.pow(10, decimalPlaces))).toString();
}

/**
 * Converts a decimal number to a real number.
 * @param value The value to convert.
 * @param decimalPlaces The number of decimal places.
 * @returns The real representation of the value.
 */

export function toRealValue(value: bigint | string, decimalPlaces: number): number {
    if (typeof value === "string") value = BigInt(value);
	return Number(value) / Math.pow(10, decimalPlaces);
}

// ---- Hardcoded Test Cases ----
const tests = [
  { symbol: "ETH", price: "4314.77", decimals: 8, expectedBig: "431477000000", expectedReal: "4314.77000000" },
  { symbol: "BTC", price: "109873.9", decimals: 8, expectedBig: "10987390000000", expectedReal: "109873.90000000" },
  { symbol: "SOL", price: "204.48", decimals: 8, expectedBig: "20448000000", expectedReal: "204.48000000" },
  // Extra edge cases
  { symbol: "MIN", price: "0.00000001", decimals: 8, expectedBig: "1", expectedReal: "0.00000001" },
  { symbol: "ZERO", price: "0", decimals: 8, expectedBig: "0", expectedReal: "0.00000000" },
  { symbol: "BIG", price: "123456789.12345678", decimals: 8, expectedBig: "12345678912345678", expectedReal: "123456789.12345678" },
];

for (const t of tests) {
  const big = toBigIntValue(t.price, t.decimals);
  const real = toRealValue(big, t.decimals);

  console.log(`${t.symbol} =>`);
  console.log("  Price:", t.price);
  console.log("  BigInt:", big.toString(), "| Expected:", t.expectedBig , 'status:', big.toString() === t.expectedBig ? 'PASS' : 'FAIL');
  console.log("  Real  :", real, "| Expected:", t.expectedReal);
  console.log("--------------------");
}

