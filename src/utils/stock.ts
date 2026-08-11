/**
 * Stock availability, enforced client-side.
 *
 * The backend stores a `stock` count on products but does not enforce it when
 * an item is added to the cart, so the storefront applies the rule itself.
 *
 * A missing value means "the API did not tell us", not "zero". Treating an
 * absent field as out of stock would hide every product on endpoints that do
 * not serialise `stock`, so unknown always means available.
 */

/** Shape shared by list items, detail payloads and cart lines. */
export interface StockBearing {
  stock?: number | null;
}

export function isOutOfStock(item: StockBearing | null | undefined): boolean {
  if (!item) return false;
  const { stock } = item;
  if (stock === null || stock === undefined) return false; // unknown → allow
  return stock <= 0;
}

/** True when stock is known, positive, and at or below `threshold`. */
export function isLowStock(item: StockBearing | null | undefined, threshold = 5): boolean {
  if (!item) return false;
  const { stock } = item;
  if (stock === null || stock === undefined) return false;
  return stock > 0 && stock <= threshold;
}

/** Caps a requested quantity to what is actually on hand, when known. */
export function clampToStock(quantity: number, item: StockBearing | null | undefined): number {
  const stock = item?.stock;
  if (stock === null || stock === undefined) return quantity;
  return Math.max(0, Math.min(quantity, stock));
}
