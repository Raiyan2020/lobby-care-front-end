'use client';
/**
 * LOBBY CARE product card — Figma nodes 14:1715 / 20:3408.
 *
 * 302px card: square image well on `--lc-surface` with a favourite button
 * (top-start), a discount / best-seller badge stack (top-end) and a "quick
 * view" button that fades in on hover, then name · price · add-to-cart.
 */
import { useState } from 'react';
import { Heart, ShoppingCart, Eye, Loader2 } from 'lucide-react';
import type { ApiProduct } from '../../api/types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStore } from '../../contexts/StoreContext';
import { useNavigate } from '../../lib/navigation';
import { useAddToCart } from '../../hooks/useAddToCart';
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
      {/* Image well */}
      <div className="relative aspect-square w-full overflow-hidden bg-[var(--lc-surface)]">
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

        {/* Badges — reading-start corner (top-right in Arabic), per node 14:1732 */}
        <div className="absolute top-3 start-3 flex flex-col items-start gap-2">
          {discount != null && discount > 0 && (
            <span className="rounded-full bg-[var(--lc-green)] px-2.5 py-1 text-[12px] font-semibold leading-[20.4px] text-white">
              {isArabic ? `خصم ${discount}%` : `-${discount}%`}
            </span>
          )}
          {bestSeller && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[12px] font-medium leading-[20.4px] text-[var(--lc-ink)]">
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
          className="absolute top-3 end-3 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lc-border)] bg-white/95 transition-transform active:scale-90 cursor-pointer"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite ? 'fill-[var(--lc-green)] text-[var(--lc-green)]' : 'text-[var(--lc-ink)]'
            }`}
          />
        </button>

        {/* Quick view — reveals on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            openDetails();
          }}
          className="absolute bottom-4 left-1/2 flex h-11 w-[184px] -translate-x-1/2 translate-y-2 items-center justify-center gap-2 rounded-[10px] border border-[var(--lc-border)] bg-white opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 cursor-pointer"
        >
          <span className="text-[15px] font-semibold text-[var(--lc-ink)]">
            {isArabic ? 'عرض سريع' : 'Quick view'}
          </span>
          <Eye className="h-5 w-5 text-[var(--lc-ink)]" />
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <h3
          dir="auto"
          title={product.name}
          className="line-clamp-2 min-h-[44px] text-[16px] font-medium leading-[22px] text-[var(--lc-ink)] text-end"
        >
          {product.name}
        </h3>

        <div className="mt-2 flex flex-row-reverse items-baseline justify-start gap-3">
          <Price amount={product.price} className="text-[19px] font-bold text-[var(--lc-ink)]" />
          {hasOldPrice && (
            <Price
              amount={product.old_price!}
              isOldPrice
              className="text-[14px] text-[var(--lc-muted-soft)]"
            />
          )}
        </div>

        <button
          onClick={(e) => addToCart(e, product.id)}
          disabled={isAdding}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--lc-green)] text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer"
        >
          {isAdding ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <span>{isArabic ? 'أضف إلى السلة' : 'Add to cart'}</span>
              <ShoppingCart className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
