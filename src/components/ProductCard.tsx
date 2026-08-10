'use client';
import React from 'react';
import { Product } from '../types';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore, StoreProduct } from '../contexts/StoreContext';
import { Price } from './Price';
import { animateFlyToCart } from '../utils/cartAnimation';
import { useNavigate } from '../lib/navigation';
import { getTranslatedProduct } from '../utils/translationUtils';

interface ProductCardProps {
  product: Product;
  compact?: boolean;
}

export function ProductCard({ product, compact = false }: ProductCardProps) {
  const { dir, t, language } = useLanguage();
  const { addToCart, favorites, toggleFavorite } = useStore();
  const navigate = useNavigate();

  const translatedProduct = getTranslatedProduct(product, language);

  const [isHeartAnimating, setIsHeartAnimating] = React.useState(false);
  const isFavorite = favorites.includes(translatedProduct.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsHeartAnimating(true);
    toggleFavorite(translatedProduct.id);
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    // If it has options, open product details
    if (translatedProduct.optionType === 'size' || translatedProduct.optionType === 'color') {
      navigate(`/product/${translatedProduct.id}`);
      return;
    }

    addToCart(translatedProduct as StoreProduct);
    const img = document.getElementById(`product-image-${translatedProduct.id}`) as HTMLImageElement;
    animateFlyToCart(img);
  };

  const handleCardClick = () => {
    navigate(`/product/${translatedProduct.id}`);
  };

  const isOffer = translatedProduct.isOffer;
  const originalPrice = translatedProduct.originalPrice;
  const price = translatedProduct.price;
  let computedBadge = '';

  if (isOffer && originalPrice && originalPrice > price) {
    const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    computedBadge = language === 'ar' ? `خصم ${discountPercent}%` : `-${discountPercent}%`;
  } else if (translatedProduct.isTrending) {
    computedBadge = language === 'ar' ? 'الهبة' : 'Trending';
  } else if (translatedProduct.isMostOrdered) {
    computedBadge = language === 'ar' ? 'الأكثر طلباً' : 'Best Seller';
  }

  return (
    <div onClick={handleCardClick} className={`cursor-pointer flex flex-col bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group shrink-0 ${compact ? 'w-[140px]' : 'w-full'}`}>
      <div className="relative aspect-square bg-[#f5f5f5] rounded-xl mb-3 flex items-center justify-center overflow-hidden">
        <img
          id={`product-image-${translatedProduct.id}`}
          src={translatedProduct.image}
          alt={translatedProduct.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {computedBadge && (
          <div className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded-md z-10 w-fit`}>
            {computedBadge}
          </div>
        )}
        <button
          onClick={handleFavoriteToggle}
          className={`absolute top-1.5 ${dir === 'rtl' ? 'left-1.5' : 'right-1.5'} w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm z-10 transition-all duration-300 ${isHeartAnimating ? 'scale-125' : 'scale-100'} text-[var(--store-secondary-color)]`}
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <h4 className="text-xs font-bold text-gray-800 line-clamp-1 leading-tight">
          {translatedProduct.name}
        </h4>

        {translatedProduct.rating && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[10px] text-gray-400 font-medium tracking-wide">
              {translatedProduct.rating} <span className="opacity-60">({translatedProduct.reviews})</span>
            </span>
          </div>
        )}

        <div className="flex flex-col gap-0.5 mt-auto w-full overflow-hidden">
          <span className="text-sm font-black text-[var(--store-secondary-color)] whitespace-nowrap overflow-hidden text-ellipsis">
            <Price amount={translatedProduct.price} />
          </span>
          {translatedProduct.originalPrice ? (
            <span className="text-[10px] sm:text-[11px] text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              <Price amount={translatedProduct.originalPrice} isOldPrice={true} />
            </span>
          ) : (
            <span className="text-[10px] sm:text-[11px] text-transparent select-none whitespace-nowrap overflow-hidden" aria-hidden="true">-</span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          className="mt-2 w-full py-2 bg-gray-50 text-[#1a1a1a] active:scale-95 transition-all rounded-lg flex items-center justify-center gap-2 text-xs font-bold"
        >
          <ShoppingCart className="w-3 h-3" />
          <span>{t('addToCart')}</span>
        </button>
      </div>
    </div>
  );
}
