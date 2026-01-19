import { decodePrice } from "./crypto";

export function getLugbulkPrice(input: string): number | undefined {
  if (!input) {
    return undefined;
  }

  const decodedPrice = typeof input === "string" ? decodePrice(input) : input;
  return Number(decodedPrice);
}
