export function formattedQuantity(input?: string) {
  if (!input) {
    return "";
  }

  const value = Number(input);
  if (value === 0) {
    return "";
  }

  if (value >= 1000000) {
    return `>1000k`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  return input;
}
