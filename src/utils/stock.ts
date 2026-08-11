/**
 * Stock availability, enforced client-side.
 *
 * The storefront uses the backend's `stock` count for immediate feedback.
 * CartService independently enforces the same limit as the authority.
 *
 * A missing value means "the API did not tell us", not "zero". Treating an
 * Unknown still means available for compatibility with cached older payloads.
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
