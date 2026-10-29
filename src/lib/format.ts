export const money = (cents: number | null | undefined) =>
  "$" + ((cents ?? 0) / 100).toFixed(2);

export const toCents = (v: string | number) =>
  Math.round(parseFloat(String(v ?? "0").replace(",", ".")) * 100) || 0;

export const marginPct = (priceCents: number, costCents: number) =>
  priceCents > 0 ? Math.round(((priceCents - costCents) / priceCents) * 100) : 0;

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
