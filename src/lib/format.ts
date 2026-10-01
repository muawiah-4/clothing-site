// A Paris house, priced in euros. en-GB keeps the symbol in front and a
// comma for thousands, which reads cleanly beside English copy: "€1,980".
const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** The one place prices are formatted, e.g. 1450 -> "€1,450". */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}
