const key = import.meta.env.VITE_CRYPTO_KEY || "";

export function decodePrice(encoded: string): string {
  console.log("Decoding price with key:", key, encoded);
  if (!encoded) return "";
  const bytes = encoded.match(/.{2}/g) || [];
  const decoded = bytes
    .map((hex, i) => parseInt(hex, 16) ^ key.charCodeAt(i % key.length))
    .map((code) => String.fromCharCode(code))
    .join("");
  console.log("Decoded price:", { encoded, decoded, key });
  return decoded;
}
