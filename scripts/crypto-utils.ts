const KEY = process.env.VITE_CRYPTO_KEY || "";

export function encodePrice(price: string): string {
  if (!price) return "";
  const encoded = Array.from(price)
    .map((char, i) => char.charCodeAt(0) ^ KEY.charCodeAt(i % KEY.length))
    .map((code) => code.toString(16).padStart(2, "0"))
    .join("");
  return encoded;
}

export function decodePrice(encoded: string): string {
  if (!encoded) return "";
  const bytes = encoded.match(/.{2}/g) || [];
  const decoded = bytes
    .map((hex, i) => parseInt(hex, 16) ^ KEY.charCodeAt(i % KEY.length))
    .map((code) => String.fromCharCode(code))
    .join("");
  return decoded;
}
