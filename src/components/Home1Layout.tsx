'use client';
/**
 * Home1Layout — Cinematic / Luxury Magazine style
 * Sections: full-width banner carousel → editorial categories grid → featured products → offers list → most-ordered
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { HomeLayoutProps } from './HomeLayoutProps';
import { Heart, ShoppingBag, Loader2, Percent } from 'lucide-react';
import { ShieldCheck, CreditCard, Truck, Sparkles, TrendingUp } from 'lucide-react';
import { StoreFooter } from './StoreFooter';
import { useAddToCart } from '../hooks/useAddToCart';
import { BrandsSection } from './BrandsSection';



export function Home1Layout({ banners, categories, brands, featuredProducts, latestOffers, mostOrdered, isLoading }: HomeLayoutProps) {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useStore();
  const [heroIndex, setHeroIndex] = useState(0);
  const isArabic = language === 'ar';
  const { addToCart, loadingId } = useAddToCart();

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setHeroIndex(p => (p + 1) % banners.length), 8000);
    return () => clearInterval(id);
  }, [banners.length]);

  const handleFav = (e: React.MouseEvent, productId: number) => { e.stopPropagation(); toggleFavorite(String(productId)); };

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-neutral-800" />
      <div className="p-3 space-y-2"><div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-3/4" /><div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-1/2" /></div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col w-full bg-[#fafafa] dark:bg-[#121214] selection:bg-neutral-900 selection:text-white">

      {/* ── Cinematic Hero Banner ── */}
      <div className="relative w-full h-[340px] sm:h-[420px] -mt-4 mb-8 overflow-hidden" style={{ WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)', maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
        {isLoading
          ? <div className="absolute inset-0 bg-gray-100 dark:bg-neutral-800 animate-pulse" />
          : banners.map((banner, idx) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className={`w-full h-full transform transition-transform duration-[12000ms] ${idx === heroIndex ? 'scale-110' : 'scale-100'}`}>
                <img
                  src={banner.image ?? ''}
                  alt={banner.title ?? ''}
                  className="w-full h-full object-cover"
                  fetchPriority={idx === 0 ? "high" : "low"}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
            </div>
          ))
        }
        {!isLoading && banners.map((banner, idx) => (
          <div key={`txt-${banner.id}`} className={`absolute inset-0 flex flex-col items-center justify-end pb-14 px-6 text-center z-20 transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100' : 'opacity-0'}`}>
            <h2 className="text-white font-black text-3xl sm:text-4xl mb-2 drop-shadow-lg">{banner.title}</h2>
            {banner.description && <p className="text-gray-200 text-sm font-medium max-w-xs drop-shadow-md">{banner.description}</p>}
          </div>
        ))}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-30">
            {banners.map((_, idx) => (
              <button key={idx} onClick={() => setHeroIndex(idx)} className="h-1.5 rounded-full transition-all duration-300" style={{ width: idx === heroIndex ? '16px' : '6px', backgroundColor: idx === heroIndex ? 'var(--store-secondary-color)' : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        )}
      </div>

      {/* ── Categories Grid ── */}
      {(isLoading || categories.length > 0) && (
        <div className="container mx-auto px-5 mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-gray-800 dark:text-white">{isArabic ? 'الأقسام' : 'Categories'}</h2>
            <button onClick={() => navigate('/categories')} className="text-xs font-bold hover:underline" style={{ color: 'var(--store-secondary-color)' }}>{isArabic ? 'عرض الكل' : 'View All'}</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[4/5] bg-gray-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />)
              : categories.slice(0, 5).map((cat, idx) => (
                <button
                  key={cat.id}
                  onClick={() => navigate('/categories?id=' + cat.id)}
                  className={`aspect-[4/5] relative rounded-2xl overflow-hidden group active:scale-[0.98] transition-all shadow-sm`}
                >
                  {cat.image ? <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <div className="absolute inset-0 bg-neutral-800" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10" />
                  <div className={`absolute inset-0 p-4 flex flex-col justify-end ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <span className="text-[9px] tracking-widest font-extrabold uppercase mb-1" style={{ color: 'var(--store-secondary-color)' }}>{isArabic ? 'تصنيف' : 'Collection'}</span>
                    <h4 className="font-black text-white text-base leading-tight truncate">{cat.name}</h4>
                  </div>
                </button>
              ))
            }
          </div>
        </div>
      )}

      {/* ── Brands Carousel Section ── */}
      {(isLoading || (brands && brands.length > 0)) && (
        <div className="container mx-auto px-5 mb-10">
          <BrandsSection brands={brands} isLoading={isLoading} />
        </div>
      )}

      {/* ── Featured Products ── */}
      {(isLoading || featuredProducts.length > 0) && (
        <div className="container mx-auto px-5 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-gray-800 dark:text-white">{isArabic ? 'منتجات مميزة' : 'Featured Products'}</h3>
            </div>
            <button onClick={() => navigate('/products/featured-products')} className="text-xs font-bold hover:underline" style={{ color: 'var(--store-secondary-color)' }}>{isArabic ? 'عرض الكل' : 'View All'}</button>
          </div>
          <div className="grid grid-cols-2  md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {isLoading ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featuredProducts.map((product) => {
                const isFav = favorites.includes(String(product.id));
                const hasDiscount = product.old_price && product.old_price > product.price;
                return (
                  <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col cursor-pointer group hover:shadow-md transition-shadow">
                    <div className="relative aspect-square rounded-xl bg-gray-50 dark:bg-neutral-800 mb-3 overflow-hidden">
                      <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <button onClick={(e) => handleFav(e, product.id)} className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} w-7 h-7 bg-white/90 dark:bg-black/50 rounded-full flex items-center justify-center shadow-sm z-10 active:scale-95 transition-transform`}>
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      </button>
                      {hasDiscount && product.discount_percentage && (
                        <div className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} px-2 py-0.5 text-white text-[10px] font-bold rounded-md z-10`} style={{ backgroundColor: 'var(--store-secondary-color)' }}>
                          -{product.discount_percentage}%
                        </div>
                      )}
                    </div>
                    <div className={`flex flex-col flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-white line-clamp-2 mb-2">{product.name}</h4>
                      <div className="flex flex-col mb-2">
                        <span className="font-black text-sm" style={{ color: 'var(--store-secondary-color)' }}>
                          {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] text-gray-400 line-through">
                            {Number(product.old_price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => addToCart(e, product.id)}
                        disabled={loadingId === product.id}
                        className="mt-auto w-full py-2 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-70"
                        style={{ backgroundColor: 'var(--store-secondary-color)' }}
                      >
                        {loadingId === product.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <ShoppingBag className="w-3.5 h-3.5" />}
                        {isArabic ? 'أضف للسلة' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Latest Offers ── */}
      {latestOffers.length > 0 && (
        <div className="container mx-auto px-5 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Percent className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} />
            <h3 className="text-lg font-black text-gray-800 dark:text-white">{isArabic ? 'أحدث العروض' : 'Latest Offers'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {latestOffers.slice(0, 6).map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.99] flex flex-col group"
              >
                {/* Image */}
                <div className="relative w-full aspect-[4/3] bg-gray-50 dark:bg-neutral-800 overflow-hidden">
                  <img
                    src={product.image ?? ''}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button onClick={(e) => handleFav(e, product.id)} className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} w-7 h-7 bg-white/90 dark:bg-black/50 rounded-full flex items-center justify-center shadow-sm z-10 active:scale-95 transition-transform`}>
                    <Heart className={`w-3.5 h-3.5 ${favorites.includes(String(product.id)) ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                  </button>
                  {product.discount_percentage && (
                    <span
                      className="absolute top-2 ltr:left-2 rtl:right-2 text-[9px] font-black text-white px-2 py-0.5 rounded-lg"
                      style={{ backgroundColor: 'var(--store-secondary-color)' }}
                    >
                      -{product.discount_percentage}%
                    </span>
                  )}
                </div>
                {/* Info */}
                <div className={`p-3 flex flex-col flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <h4 className="text-xs font-black text-gray-800 dark:text-white line-clamp-2 mb-1.5 flex-1">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-black text-sm" style={{ color: 'var(--store-secondary-color)' }}>
                      {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                    </span>
                    {product.old_price && (
                      <span className="text-[10px] text-gray-400 line-through">
                        {Number(product.old_price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── Most Ordered ── */}
      {mostOrdered.length > 0 && (
        <div className="container mx-auto px-5 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} />
            <h3 className="text-lg font-black text-gray-800 dark:text-white">{isArabic ? 'الأكثر طلباً' : 'Most Ordered'}</h3>
          </div>
          <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden divide-y divide-gray-50 dark:divide-white/5 shadow-sm">
            {mostOrdered.map((product, index) => (
              <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 text-white" style={{ backgroundColor: 'var(--store-secondary-color)' }}>#{index + 1}</span>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-800 shrink-0">
                  <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className={`flex-1 min-w-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <h4 className="text-xs font-black text-gray-800 dark:text-white line-clamp-1">{product.name}</h4>
                  <span className="text-[11px] font-bold" style={{ color: 'var(--store-secondary-color)' }}>
                    {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Trust Strip ── */}
      <div className="container mx-auto mt-7 mb-8 px-5">
        <div className="grid grid-cols-3 gap-3">
          {[{ Icon: ShieldCheck, labelAr: 'منتجات مختارة', labelEn: 'Curated Products' }, { Icon: CreditCard, labelAr: 'دفع آمن', labelEn: 'Secure Payment' }, { Icon: Truck, labelAr: 'توصيل سريع', labelEn: 'Fast Delivery' }].map(({ Icon, labelAr, labelEn }, i) => (
            <div key={i} className="flex flex-col items-center justify-center text-center py-4 px-2 bg-white dark:bg-[#111111] rounded-[20px] border shadow-sm" style={{ borderColor: 'color-mix(in srgb, var(--store-secondary-color) 25%, transparent)' }}>
              <Icon className="w-5 h-5 mb-2" style={{ color: 'var(--store-secondary-color)' }} />
              <span className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">{isArabic ? labelAr : labelEn}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <StoreFooter />
    </div>
  );
}
