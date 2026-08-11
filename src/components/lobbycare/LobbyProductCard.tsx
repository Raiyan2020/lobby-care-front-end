'use client';
/**
 * LOBBY CARE product card — Figma nodes 14:1715 / 20:3408.
 *
 * Measured from the node tree — the whole card is 302×457:
 *   frame   302×457, radius 16, 1.2px #e8e8e8 border, white
 *   image   301×293 well on #f7f9f4 (very slightly wider than tall)
 *   badges  top-start, 8px apart — discount pill #80b446, best-seller white
 *   heart   36×36 white circle, 1.2px #e8e8e8, top-end
 *   body    162 tall, 16px padding
 *   title   16/22 @500, end-aligned, single line
 *   price   44px row — current 19/32 @700 at the reading edge, struck-through
 *           original 14/24 #8a8a8a about 15px to its left
 *   button  268×44, #80b446, radius 10, 1.2px white border, 15/26 @600
 *
 * Figma has no hover state on this card, so there is no quick-view overlay.
 */
import { useState } from 'react';
import { Heart, ShoppingBag, Loader2 } from 'lucide-react';
import type { ApiProduct } from '../../api/types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStore } from '../../contexts/StoreContext';
import { useNavigate } from '../../lib/navigation';
import { useAddToCart } from '../../hooks/useAddToCart';
import { isOutOfStock, isLowStock } from '../../utils/stock';
import { Price } from '../Price';

interface LobbyProductCardProps {
  product: ApiProduct;
  /** Renders the "الأكثر مبيعًا" pill under the discount badge. */
  bestSeller?: boolean;
}

export function LobbyProductCard({ product, bestSeller = false }: LobbyProductCardProps) {
  const { language } = useLanguage();
  const { favorites, toggleFavorite } = useStore();
  const navigate = useNavigate();
  const { addToCart, loadingId } = useAddToCart();

  const isArabic = language === 'ar';
  const [imageFailed, setImageFailed] = useState(false);

  const isFavorite = favorites.includes(String(product.id)) || product.is_favorite;
  const isAdding = loadingId === product.id;
  const soldOut = isOutOfStock(product);
  const lowStock = isLowStock(product);

  const hasOldPrice = product.old_price != null && product.old_price > product.price;
  const discount =
    product.discount_percentage ??
    (hasOldPrice ? Math.round(((product.old_price! - product.price) / product.old_price!) * 100) : null);

  const openDetails = () => navigate(`/product/${product.id}`);

  return (
    <div
      onClick={openDetails}
      className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-[16px] border border-[var(--lc-border)] bg-white transition-shadow hover:shadow-[0_8px_24px_rgba(31,31,31,0.08)]"
    >
      {/* Image well — 301×293 on a 302 card, so very slightly wider than tall */}
      <div className="relative aspect-[301/293] w-full overflow-hidden bg-[var(--lc-surface)]">
        {product.image && !imageFailed ? (
          <img
            id={`product-image-${product.id}`}
            src={product.image}
            alt={product.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // The API currently returns `image: null` for every product.
          <div className="flex h-full w-full items-center justify-center">
            <span className="px-4 text-center text-[13px] text-[var(--lc-muted-soft)]">
              {isArabic ? 'لا توجد صورة' : 'No image'}
            </span>
          </div>
        )}

        {/* Dim the artwork so a sold-out card reads as unavailable at a glance. */}
        {soldOut && <div className="absolute inset-0 bg-white/60" aria-hidden />}

        {/* Badges — reading-start corner (top-right in Arabic), per node 14:1732 */}
        <div className="absolute top-3 start-3 flex flex-col items-start gap-2">
          {soldOut && (
            <span className="rounded-full bg-[var(--lc-ink)] px-2.5 py-1 text-[12px] font-semibold leading-[20px] text-white">
              {isArabic ? 'نفدت الكمية' : 'Out of stock'}
            </span>
          )}
          {!soldOut && lowStock && (
            <span className="rounded-full bg-[#d93a3a] px-2.5 py-1 text-[12px] font-semibold leading-[20px] text-white">
              {isArabic ? 'كمية محدودة' : 'Low stock'}
            </span>
          )}
          {discount != null && discount > 0 && (
            <span className="rounded-full bg-[var(--lc-green)] px-2.5 py-1 text-[12px] font-semibold leading-[20px] text-white">
              {isArabic ? `خصم ${discount}%` : `-${discount}%`}
            </span>
          )}
          {bestSeller && (
            <span className="rounded-full bg-white px-2.5 py-1 text-[12px] font-medium leading-[20px] text-[var(--lc-ink)]">
              {isArabic ? 'الأكثر مبيعًا' : 'Best seller'}
            </span>
          )}
        </div>

        {/* Favourite — opposite corner from the badges, per node 14:1737 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(String(product.id));
          }}
          aria-label={isArabic ? 'أضيفي إلى المفضلة' : 'Add to favourites'}
          className="absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full border-[1.2px] border-[var(--lc-border)] bg-white transition-transform active:scale-90 cursor-pointer"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'fill-[var(--lc-green)] text-[var(--lc-green)]' : 'text-[var(--lc-muted)]'
            }`}
          />
        </button>

      </div>

      {/* Body — 162px tall on a 302 card: 16px padding, a 26px title block,
          a 44px price row and the 44px button sitting 16px below it. */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          dir="auto"
          title={product.name}
          className="truncate pt-1 text-end text-[16px] font-medium leading-[22px] text-[var(--lc-ink)]"
        >
          {product.name}
        </h3>

        {/* Figma puts the current price at the reading-start edge (x185 of 302,
            i.e. right under RTL) with the struck-through original ~15px to its
            left. Under dir="rtl" the first flex child renders rightmost and
            `justify-start` anchors the pair to that edge — `justify-end` would
            mirror the row to the left. */}
        <div className="flex h-11 flex-row items-end justify-start gap-[15px]">
          <Price
            amount={product.price}
            className="text-[19px] font-bold leading-[32px] text-[var(--lc-ink)]"
          />
          {hasOldPrice && (
            <Price
              amount={product.old_price!}
              isOldPrice
              className="text-[14px] leading-[24px] text-[var(--lc-muted-soft)] line-through"
            />
          )}
        </div>

        <button
          onClick={(e) => addToCart(e, product.id, 1, undefined, product.stock)}
          disabled={isAdding || soldOut}
          aria-disabled={soldOut}
          className={`mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border-[1.2px] border-white text-[15px] font-semibold leading-[26px] transition-opacity ${
            soldOut
              ? 'cursor-not-allowed bg-[var(--lc-border)] text-[var(--lc-muted)]'
              : 'cursor-pointer bg-[var(--lc-green)] text-white hover:opacity-90 disabled:opacity-60'
          }`}
        >
          {isAdding ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : soldOut ? (
            <span>{isArabic ? 'نفدت الكمية' : 'Out of stock'}</span>
          ) : (
            <>
              <span>{isArabic ? 'أضف إلى السلة' : 'Add to cart'}</span>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.2} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
