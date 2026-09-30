const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** The one place prices are formatted, e.g. 1450 -> "$1,450". */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
