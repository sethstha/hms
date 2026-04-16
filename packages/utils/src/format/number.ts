export function formatNPR(amount: number, locale: "en" | "ne" = "en") {
  return new Intl.NumberFormat(locale === "ne" ? "ne-NP" : "en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number, locale: "en" | "ne" = "en") {
  return new Intl.NumberFormat(locale === "ne" ? "ne-NP" : "en-NP").format(value);
}
