export function euroCents(input?: string | number) {
  if (!input) {
    return "";
  }

  const value = Number(input);
  const roundedValue = Math.round(value * 100) / 100;
  return `${roundedValue.toString().replace(".", ",")}€`;
}
