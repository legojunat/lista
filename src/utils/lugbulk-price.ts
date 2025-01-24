export function getLugbulkPrice(input?: string | number) {
  if (!input) {
    return input;
  }

  return Number(input) * 1.255 * 1.07;
}
