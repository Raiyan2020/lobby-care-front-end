'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '../lib/navigation';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { HomeLayoutProps } from './HomeLayoutProps';
import type { ApiProduct } from '../api/types';
import { ChevronLeft, ChevronRight, Heart, ShoppingCart, Tag, TrendingUp, Flame, Star } from 'lucide-react';
import { StoreFooter } from './StoreFooter';
import { BrandsSection } from './BrandsSection';

// ── Horizontal scrollable product shelf ──────────────────────────────────────
function ProductShelf({
  products,
  isLoading,
  onNavigate,
  isArabic,
  dir,
  favorites,
  onToggleFav,
}: {
  products: ApiProduct[];
  isLoading?: boolean;
  onNavigate: (id: number) => void;
  isArabic: boolean;
  dir: string;
  favorites: string[];
  onToggleFav: (id: number) => void;
}) {
  const skeletons = Array.from({ length: 5 });

  return (
    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 px-4">
      {isLoading
        ? skeletons.map((_, i) => (
          <div
            key={i}
            className="shrink-0 w-[145px] bg-white rounded-2xl overflow-hidden animate-pulse border border-gray-100"
          >
            <div className="w-full h-[145px] bg-gray-100" />
            <div className="p-2.5 space-y-1.5">
              <div className="h-3 bg-gray-100 rounded w-4/5" />
              <div className="h-3 bg-gray-100 rounded w-3/5" />
              <div className="h-2.5 bg-gray-100 rounded w-2/5 mt-1" />
            </div>
          </div>
        ))
        : products.map((product) => {
          const hasDiscount = product.old_price && product.old_price > product.price;
          const isFav = favorites.includes(String(product.id));
          const savings = hasDiscount ? product.old_price! - product.price : 0;

          return (
            <div
              key={product.id}
              onClick={() => onNavigate(product.id)}
              className="shrink-0 w-[148px] bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-[0.97] transition-all cursor-pointer flex flex-col"
            >
              {/* Image + badges */}
              <div className="relative w-full h-[145px] bg-gray-50 overflow-hidden">
                <img
                  src={product.image ?? ''}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                {/* Discount corner badge */}
                {hasDiscount && product.discount_percentage && (
                  <div className="absolute top-0 right-0 bg-[#1a73e8] text-white text-[9px] font-black leading-tight px-1.5 py-1 text-center">
                    <div>{product.discount_percentage}%</div>
                    <div>OFF</div>
                  </div>
                )}
                {/* Fav button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggleFav(product.id); }}
                  className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/90 border border-gray-100 flex items-center justify-center shadow-sm"
                >
                  <Heart className={`w-3 h-3 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                </button>
              </div>

              {/* Info */}
              <div className="p-2.5 flex flex-col flex-1">
                <p className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight mb-1.5">
                  {product.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-[13px] font-black text-gray-900">
                    {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-gray-400 line-through">
                      {Number(product.old_price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <p className="text-[10px] font-bold text-green-600 mt-0.5">
                    {isArabic ? `وفر ${Number(savings).toFixed(3)} د.ك` : `Save - ${Number(savings).toFixed(3)} K.D`}
                  </p>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

// ── Section header (marketplace style) ───────────────────────────────────────
function SectionTitle({
  labelAr,
  labelEn,
  accentAr,
  accentEn,
  onViewAll,
  isArabic,
  dir,
}: {
  labelAr: string;
  labelEn: string;
  accentAr?: string;
  accentEn?: string;
  onViewAll?: () => void;
  isArabic: boolean;
  dir: string;
}) {
  return (
    <div className={`flex items-center justify-between px-4 mb-3 ${dir === 'rtl' ? 'flex-row-reverse' : ''}`}>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-0.5 text-[11px] font-bold text-gray-500 hover:text-gray-800 transition-colors"
        >
          {isArabic ? 'عرض الكل' : 'View All'}
          {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      )}
      <h2 className="text-[14px] font-black text-gray-900">
        {isArabic ? labelAr : labelEn}{' '}
        {(accentAr || accentEn) && (
          <span style={{ color: 'var(--store-secondary-color)' }}>
            {isArabic ? accentAr : accentEn}
          </span>
        )}
      </h2>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function Home7Layout({
  banners,
  categories,
  brands,
  featuredProducts,
  latestOffers,
  mostOrdered,
  isLoading,
}: HomeLayoutProps) {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const { settings, favorites, toggleFavorite } = useStore();
  const isArabic = language === 'ar';

  const [activeBanner, setActiveBanner] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance banner
  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [banners.length]);

  const prevBanner = () => setActiveBanner((p) => (p - 1 + banners.length) % banners.length);
  const nextBanner = () => setActiveBanner((p) => (p + 1) % banners.length);

  const handleFav = (id: number) => toggleFavorite(String(id));
  const handleNav = (id: number) => navigate(`/product/${id}`);

  const shelfProps = { isArabic, dir, favorites, onToggleFav: handleFav, onNavigate: handleNav, isLoading };

  return (
    <div className="flex-1 flex flex-col w-full bg-[#f5f5f5] text-gray-900 min-h-screen overflow-x-hidden ">
      <div className="container mx-auto">

        {/* ── Hero Banner ───────────────────────────────────────────────────────── */}
        <div className="relative mx-4 mt-3 mb-5 rounded-[20px] overflow-hidden shadow-md bg-[#1b223c]" style={{ minHeight: 220 }}>
          {isLoading ? (
            <div className="w-full h-[200px] bg-gray-200 animate-pulse rounded-[20px]" />
          ) : banners.length > 0 ? (
            <>
              {/* Slides */}
              {banners.map((b, idx) => (
                <div
                  key={b.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${idx === activeBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'} flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between px-6 sm:px-12 py-4 gap-4`}
                >
                  {/* Text section */}
                  <div className={`flex flex-col justify-center flex-1 z-10 w-full sm:max-w-[60%] ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      {isArabic ? 'أفضل صفقة أونلاين' : 'Best Deal Online'}
                    </p>
                    <h1 className="text-white font-black text-lg sm:text-2xl leading-tight mb-1 uppercase tracking-tight">
                      {b.title}
                    </h1>
                    {b.description ? (
                      <p className="text-gray-300 text-[10px] sm:text-xs font-medium mb-3 leading-snug">
                        {b.description}
                      </p>
                    ) : (
                      <p className="text-gray-300 text-[10px] sm:text-xs font-medium mb-3 leading-snug">
                        {isArabic ? 'خصم يصل إلى 80%' : 'UP to 80% OFF'}
                      </p>
                    )}
                    <div>
                      <button
                        onClick={() => navigate('/categories')}
                        className="px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#1a2340] bg-white hover:bg-gray-100 transition-colors shadow-sm"
                      >
                        {isArabic ? 'تسوق الآن' : 'Shop Now'}
                      </button>
                    </div>
                  </div>

                  {/* Product Image section */}
                  <div className="absolute inset-0 w-full h-full sm:relative sm:inset-auto sm:w-[35%] sm:h-[90%] flex items-center justify-center shrink-0 select-none overflow-hidden sm:overflow-visible z-0 sm:z-10">
                    {/* Decorative background shapes (desktop only) */}
                    <div className="hidden sm:block absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/5 -z-10" />
                    <div className="hidden sm:block absolute w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-white/10 -z-10" />

                    {/* Mobile dark overlay */}
                    <div className="absolute inset-0 bg-black/45 sm:hidden -z-10" />

                    <img
                      src={b.image ?? ''}
                      alt={b.title ?? ''}
                      className="w-full rounded-2xl h-full sm:w-auto sm:h-auto max-w-full max-h-full object-cover sm:object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-transform duration-500 opacity-40 sm:opacity-100 -z-20 sm:z-10"
                      fetchPriority={idx === 0 ? "high" : "low"}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
              ))}

              {/* Arrows */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevBanner}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={nextBanner}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-white" />
                  </button>
                </>
              )}

              {/* Dots */}
              {banners.length > 1 && (
                <div className={`absolute bottom-3 ${dir === 'rtl' ? 'right-5' : 'left-5'} z-20 flex gap-1.5`}>
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveBanner(idx)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: idx === activeBanner ? 20 : 6,
                        height: 6,
                        backgroundColor: idx === activeBanner ? 'white' : 'rgba(255,255,255,0.35)',
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-[200px] bg-[#1a2340] rounded-[20px]" />
          )}
        </div>

        {/* ── Categories ────────────────────────────────────────────────────────── */}
        {(isLoading || categories.length > 0) && (
          <section className="mb-5">
            <SectionTitle
              labelAr="تسوق من" accentAr="أهم الأقسام"
              labelEn="Shop From" accentEn="Top Categories"
              onViewAll={() => navigate('/categories')}
              isArabic={isArabic}
              dir={dir}
            />
            <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 pb-1">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 flex flex-col items-center gap-2">
                    <div className="w-[64px] h-[64px] rounded-full bg-gray-200 animate-pulse" />
                    <div className="w-14 h-2.5 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))
                : categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate('/categories?id=' + cat.id)}
                    className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <div
                      className="w-[64px] h-[64px] rounded-full border-2 border-gray-200 bg-white overflow-hidden shadow-sm flex items-center justify-center"
                      style={{ borderColor: 'var(--store-secondary-color)' }}
                    >
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[18px] font-black text-gray-400">{cat.name.charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-700 text-center max-w-[72px] truncate">
                      {cat.name}
                    </span>
                  </button>
                ))}
            </div>
          </section>
        )}

        {/* ── Brands Section ────────────────────────────────────────────────────── */}
        {(isLoading || (brands && brands.length > 0)) && (
          <section className="mb-5 bg-white py-4 rounded-2xl mx-4 shadow-sm border border-gray-100">
            <div className="px-4">
              <BrandsSection brands={brands} isLoading={isLoading} />
            </div>
          </section>
        )}

        {/* ── Featured Products ─────────────────────────────────────────────────── */}
        {(isLoading || featuredProducts.length > 0) && (
          <section className="mb-5 bg-white py-4 rounded-2xl mx-4 shadow-sm border border-gray-100">
            <SectionTitle
              labelAr="اشتري من" accentAr="المنتجات المميزة"
              labelEn="Grab the best deal on" accentEn="Featured Products"
              onViewAll={() => navigate('/products/featured-products')}
              isArabic={isArabic}
              dir={dir}
            />
            <ProductShelf products={featuredProducts} {...shelfProps} />
          </section>
        )}

        {/* ── Latest Offers ─────────────────────────────────────────────────────── */}
        {(isLoading || latestOffers.length > 0) && (
          <section className="mb-5 bg-white py-4 rounded-2xl mx-4 shadow-sm border border-gray-100">
            <SectionTitle
              labelAr="أحدث" accentAr="العروض"
              labelEn="Latest" accentEn="Offers"
              onViewAll={() => navigate('/products/latest-offers')}
              isArabic={isArabic}
              dir={dir}
            />
            <ProductShelf products={latestOffers} {...shelfProps} />
          </section>
        )}

        {/* ── Most Ordered ──────────────────────────────────────────────────────── */}
        {(isLoading || mostOrdered.length > 0) && (
          <section className="mb-5 bg-white py-4 rounded-2xl mx-4 shadow-sm border border-gray-100">
            <SectionTitle
              labelAr="الأكثر" accentAr="طلباً"
              labelEn="Most" accentEn="Ordered"
              onViewAll={() => navigate('/products/most-ordered')}
              isArabic={isArabic}
              dir={dir}
            />

            {/* Grid cards */}
            <div className="px-4 grid grid-cols-2 gap-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[75px] bg-gray-100 rounded-xl animate-pulse" />
                ))
                : mostOrdered.slice(0, 6).map((product, index) => {
                  const hasDiscount = product.old_price && product.old_price > product.price;
                  const savings = hasDiscount ? product.old_price! - product.price : 0;
                  return (
                    <div
                      key={product.id}
                      onClick={() => handleNav(product.id)}
                      className="flex items-center gap-2.5 bg-gray-50 border border-gray-100 rounded-xl p-2 cursor-pointer hover:shadow-sm active:scale-[0.98] transition-all"
                    >
                      {/* Rank */}
                      <span
                        className="text-[10px] font-black shrink-0 w-5 h-5 flex items-center justify-center rounded-full"
                        style={{
                          color: index === 0 ? 'white' : 'var(--store-secondary-color)',
                          backgroundColor: index === 0 ? 'var(--store-secondary-color)' : 'color-mix(in srgb, var(--store-secondary-color) 12%, transparent)',
                        }}
                      >
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                        <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`flex-1 min-w-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <p className="text-[10px] font-bold text-gray-800 line-clamp-1 leading-tight">{product.name}</p>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-black" style={{ color: 'var(--store-secondary-color)' }}>
                              {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                            </p>
                            {savings > 0 && (
                              <p className="text-[9px] font-bold text-green-600">
                                {isArabic ? `وفر ${Number(savings).toFixed(3)} د.ك` : `Save ${Number(savings).toFixed(3)} K.D`}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleFavorite(String(product.id)); }}
                            className="w-6 h-6 rounded-full border border-gray-200/60 dark:border-white/10 flex items-center justify-center bg-white dark:bg-neutral-800 transition-all hover:bg-gray-105 active:scale-90 shrink-0"
                          >
                            <Heart className={`w-3 h-3 ${favorites.includes(String(product.id)) ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* ── Bottom promo strip ────────────────────────────────────────────────── */}
        <div
          className="mx-4 rounded-2xl p-5 flex items-center justify-between shadow-sm"
          style={{ background: 'linear-gradient(135deg, var(--store-primary-color) 0%, color-mix(in srgb, var(--store-primary-color) 70%, #1a73e8) 100%)' }}
        >
          <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">
              {isArabic ? 'عروض حصرية' : 'Exclusive Deals'}
            </p>
            <p className="text-white font-black text-base leading-tight">
              {isArabic ? 'تصفح الكل والاستمتع' : 'Explore Everything'}
            </p>
            <p className="text-white/80 text-[11px] mt-0.5">
              {isArabic ? 'خصومات تصل إلى 80%' : 'Up to 80% OFF'}
            </p>
          </div>
          <button
            onClick={() => navigate('/categories')}
            className="shrink-0 bg-white px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-wider shadow hover:scale-105 active:scale-95 transition-transform"
            style={{ color: 'var(--store-primary-color)' }}
          >
            {isArabic ? 'تسوق الآن' : 'Shop Now'}
          </button>
        </div>

        {/* ── Spacer ────────────────────────────────────────────────────────────── */}
        <div className="h-4" />

        {/* Footer */}
        <StoreFooter />
      </div>
    </div>
  );
}
