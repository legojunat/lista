const key = import.meta.env.VITE_CRYPTO_KEY || "";

export function decodePrice(encoded: string): string {
  if (!encoded) return "";
  const bytes = encoded.match(/.{2}/g) || [];
  const decoded = bytes
    .map((hex, i) => parseInt(hex, 16) ^ key.charCodeAt(i % key.length))
    .map((code) => String.fromCharCode(code))
    .join("");
  return decoded;
}
