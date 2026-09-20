export function formatPrice(price: string | number): string {
  const value = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(value)) return "Price on request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatMileage(mileage: number | null | undefined): string {
  if (mileage === null || mileage === undefined) return "—";
  return `${new Intl.NumberFormat("en-US").format(mileage)} mi`;
}
