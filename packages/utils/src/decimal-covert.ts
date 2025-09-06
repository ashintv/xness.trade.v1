
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





/**
 * Scales a real number to a decimal representation.
 * @param value The value to scale.
 * @param decimalPlaces The number of decimal places.
 * @returns The scaled value as a string.
 */
export function ScaleToDecimal(value: number, decimalPlaces: number): string {
  return BigInt(Math.round(value * Math.pow(10, decimalPlaces))).toString();
}

/**
 * Scales a decimal number to a real representation.
 * @param value The value to scale.
 * @param decimalPlaces The number of decimal places.
 * @returns The scaled value as a number.
 */

export function ScaleToReal(value: bigint | string, decimalPlaces: number): number {
  if (typeof value === "string") value = BigInt(value);
  return Number(value) / Math.pow(10, decimalPlaces);
}



// ---- Cross-scaling Test Cases ----
const crossScaleTests = [
  // Already in 2 decimals, scale to 8
  { symbol: "USD-2→8", value: 123.45, fromDecimals: 2, toDecimals: 8, expectedScaled: "12345000000", expectedReal: 123.45 },
  { symbol: "SMALL-2→8", value: 0.01, fromDecimals: 2, toDecimals: 8, expectedScaled: "1000000", expectedReal: 0.01 },

  // Already in 8 decimals, scale down to 2
  { symbol: "BTC-8→2", value: 109873.90000000, fromDecimals: 8, toDecimals: 2, expectedScaled: "10987390", expectedReal: 109873.9 },
  { symbol: "SMALL-8→2", value: 0.00000001, fromDecimals: 8, toDecimals: 2, expectedScaled: "0", expectedReal: 0 },

  // Already in 8 decimals, scale down to 4
  { symbol: "ETH-8→4", value: 4314.77000000, fromDecimals: 8, toDecimals: 4, expectedScaled: "43147700", expectedReal: 4314.77 },
  { symbol: "TEST-8→4", value: 0.12345678, fromDecimals: 8, toDecimals: 4, expectedScaled: "1234", expectedReal: 0.1234 },

  // Extra large value scaling down
  { symbol: "BIG-8→2", value: 123456789.12345678, fromDecimals: 8, toDecimals: 2, expectedScaled: "12345678912", expectedReal: 123456789.12 },
];

for (const t of crossScaleTests) {
  // First scale up using fromDecimals
  const big = ScaleToDecimal(t.value, t.fromDecimals);

  // Now rescale manually: adjust decimals difference
  const diff = t.toDecimals - t.fromDecimals;
  let rescaled: bigint;
  if (diff > 0) {
    rescaled = BigInt(big) * BigInt(10 ** diff);
  } else {
    rescaled = BigInt(big) / BigInt(10 ** Math.abs(diff));
  }

  const real = ScaleToReal(rescaled, t.toDecimals);

  console.log(`${t.symbol} =>`);
  console.log("  Input:", t.value);
  console.log("  Rescaled:", rescaled.toString(), "| Expected:", t.expectedScaled, 'status:', rescaled.toString() === t.expectedScaled ? 'PASS' : 'FAIL');
  console.log("  Back to Real:", real, "| Expected:", t.expectedReal, 'status:', real === t.expectedReal ? 'PASS' : 'FAIL');
  console.log("--------------------");
}