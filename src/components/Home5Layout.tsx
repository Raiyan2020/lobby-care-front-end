'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { HomeLayoutProps } from './HomeLayoutProps';
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Percent,
  ShieldCheck,
  Truck,
  Clock,
  Plus,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { StoreFooter } from './StoreFooter';
import { animateFlyToCart } from '../utils/cartAnimation';
import { useAddToCart } from '../hooks/useAddToCart';
import { BrandsSection } from './BrandsSection';

// Fallback placeholder for categories without images
const CategoryPlaceholder = ({ name }: { name: string }) => (
  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-end p-4">
    <span className="text-white font-black text-sm">{name}</span>
  </div>
);

// Format price nicely


export function Home5Layout({
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
  const { addToCart, loadingId } = useAddToCart();

  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const isArabic = language === 'ar';
  const displayStoreName = language === 'ar' ? settings.storeName : settings.storeNameEn;

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleFav = (e: React.MouseEvent, productId: number) => {
    e.stopPropagation();
    toggleFavorite(String(productId));
  };

  const ProductCard = ({ product, imgIdPrefix }: { product: (typeof featuredProducts)[0]; imgIdPrefix: string }) => {
    const isFav = favorites.includes(String(product.id));
    const hasDiscount = product.old_price && product.old_price > product.price;
    return (
      <div
        onClick={() => navigate(`/product/${product.id}`)}
        className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.98] flex flex-col group cursor-pointer"
      >
        <div className="relative aspect-square bg-gray-50 dark:bg-neutral-800 overflow-hidden">
          <img
            id={`${imgIdPrefix}-${product.id}`}
            src={product.image ?? ''}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          {hasDiscount && product.discount_percentage && (
            <span
              className="absolute top-2.5 ltr:left-2.5 rtl:right-2.5 text-[9px] font-black tracking-wider text-white px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'var(--store-secondary-color)' }}
            >
              {product.discount_percentage}% {isArabic ? 'خصم' : 'OFF'}
            </span>
          )}
          <button
            onClick={(e) => handleFav(e, product.id)}
            className="absolute top-2.5 ltr:right-2.5 rtl:left-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-neutral-900/80 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm active:scale-90 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
        </div>
        <div className={`p-3.5 flex flex-col flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
          <h4 className="text-[12px] font-black text-gray-800 dark:text-white line-clamp-2 leading-tight mb-2">
            {product.name}
          </h4>
          <div className="flex items-baseline gap-1.5 mb-3">
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
            className="mt-auto w-full py-2 rounded-xl text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-70"
            style={{ backgroundColor: 'var(--store-secondary-color)' }}
          >
            {loadingId === product.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ShoppingBag className="w-3.5 h-3.5" />}
            <span>{isArabic ? 'أضف للسلة' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ titleAr, titleEn, icon: Icon, onViewAll }: { titleAr: string; titleEn: string; icon?: React.ElementType; onViewAll?: () => void }) => (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} />}
        <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white">
          {isArabic ? titleAr : titleEn}
        </h2>
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--store-secondary-color)' }}
        >
          {isArabic ? 'عرض الكل' : 'View All'}
          {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-[20px] overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-100 dark:bg-neutral-800" />
      <div className="p-3.5 space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-1/2" />
        <div className="h-8 bg-gray-100 dark:bg-neutral-800 rounded mt-3" />
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col w-full bg-[#fafafa] dark:bg-[#121214] text-gray-900 dark:text-white min-h-screen overflow-x-hidden">

      {/* ── MOBILE (hidden on md+) ── */}
      <div className="md:hidden flex flex-col flex-1">

        {/* Banner Carousel */}
        <div className="container mx-auto px-4 mt-2 mb-6">
          <div className="relative w-full overflow-hidden rounded-[22px] shadow-sm">
            {isLoading ? (
              <div className="w-full aspect-[16/9] bg-gray-100 dark:bg-neutral-800 animate-pulse rounded-[22px]" />
            ) : banners.length > 0 ? (
              <>
                {banners.map((banner, idx) => (
                  <div key={banner.id} className={`transition-opacity duration-700 ${idx === activeBannerIndex ? 'block' : 'hidden'}`}>
                    <img
                      src={banner.image ?? ''}
                      alt={banner.title ?? ''}
                      className="w-full aspect-[16/9] object-cover"
                      fetchPriority={idx === 0 ? "high" : "low"}
                      loading={idx === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
                    <div className={`absolute bottom-4 ${dir === 'rtl' ? 'right-4 text-right' : 'left-4 text-left'} z-10`}>
                      <h2 className="text-white font-black text-base leading-tight">{banner.title}</h2>
                      {banner.description && (
                        <p className="text-gray-300 text-[11px] mt-0.5">{banner.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                {banners.length > 1 && (
                  <div className={`absolute bottom-3 flex gap-1 z-20 ${dir === 'rtl' ? 'left-3' : 'right-3'}`}>
                    {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveBannerIndex(idx)}
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: idx === activeBannerIndex ? '16px' : '6px',
                          backgroundColor: idx === activeBannerIndex ? 'var(--store-secondary-color)' : 'rgba(255,255,255,0.4)',
                        }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-[16/9] bg-neutral-100 dark:bg-neutral-900 rounded-[22px]" />
            )}
          </div>
        </div>

        {/* Categories */}
        {(isLoading || categories.length > 0) && (
          <section className="container mx-auto mb-6 pt-2">
            <div className="flex items-center justify-between px-5 mb-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white">
                {isArabic ? 'الأقسام' : 'Categories'}
              </h2>
              <button
                onClick={() => navigate('/categories')}
                className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity"
                style={{ color: 'var(--store-secondary-color)' }}
              >
                {isArabic ? 'عرض الكل' : 'View All'}
                {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="px-5 grid grid-cols-2 gap-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-[120px] bg-gray-100 dark:bg-neutral-800 rounded-[20px] animate-pulse" />
                ))
                : categories.slice(0, 4).map((cat) => {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => navigate('/categories?id=' + cat.id)}
                      className={`col-span-1 h-[120px] relative rounded-[20px] overflow-hidden group active:scale-[0.98] transition-all shadow-sm border border-gray-100/10`}
                    >
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <CategoryPlaceholder name={cat.name} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
                      <div className={`absolute inset-0 p-4 flex flex-col justify-end ${dir === 'rtl' ? 'text-right' : 'text-left'}_ z-10`}>
                        <span className="text-[10px] tracking-widest font-extrabold text-[var(--store-secondary-color)] uppercase mb-1 block">
                          {isArabic ? 'تصنيف' : 'Category'}
                        </span>
                        <h3 className="font-black text-white text-sm leading-tight truncate">{cat.name}</h3>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>
        )}

        {/* Brands Section (Mobile) */}
        {(isLoading || (brands && brands.length > 0)) && (
          <section className="container mx-auto px-4 mb-6">
            <BrandsSection brands={brands} isLoading={isLoading} />
          </section>
        )}

        {/* Featured Products */}
        {(isLoading || featuredProducts.length > 0) && (
          <section className="container mx-auto px-4 mb-6">
            <SectionHeader titleAr="منتجات مميزة" titleEn="Featured Products" icon={Sparkles} onViewAll={() => navigate('/products/featured-products')} />
            <div className="grid grid-cols-2 gap-3">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : featuredProducts.map((p) => <div key={p.id}><ProductCard product={p} imgIdPrefix="h5-mob-feat" /></div>)
              }
            </div>
          </section>
        )}

        {/* Latest Offers */}
        {(isLoading || latestOffers.length > 0) && (
          <section className="container mx-auto px-4 mb-6">
            <SectionHeader titleAr="أحدث العروض" titleEn="Latest Offers" icon={Percent} onViewAll={() => navigate('/products/latest-offers')} />
            <div className="flex flex-col gap-3">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white dark:bg-neutral-900 rounded-2xl animate-pulse" />
                ))
                : latestOffers.slice(0, 4).map((product) => {
                  const hasDiscount = product.old_price && product.old_price > product.price;
                  return (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                    >
                      {hasDiscount && product.discount_percentage && (
                        <span
                          className="absolute top-0 ltr:right-0 rtl:left-0 text-[9px] font-black text-white px-2 py-0.5 rounded-bl-xl tracking-wider"
                          style={{ backgroundColor: 'var(--store-secondary-color)' }}
                        >
                          -{product.discount_percentage}%
                        </span>
                      )}
                      <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-neutral-800 overflow-hidden shrink-0">
                        <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`flex-1 min-w-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                        <h4 className="text-xs font-black text-gray-800 dark:text-white line-clamp-1 mb-1">{product.name}</h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-1.5">
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
                            onClick={(e) => handleFav(e, product.id)}
                            className="w-7 h-7 rounded-full border border-gray-105 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 transition-all hover:bg-gray-105 dark:hover:bg-neutral-700 active:scale-90 shrink-0"
                          >
                            <Heart className={`w-3.5 h-3.5 ${favorites.includes(String(product.id)) ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </section>
        )}

        {/* Most Ordered */}
        {mostOrdered.length > 0 && (
          <section className="container mx-auto px-4 mb-6">
            <SectionHeader titleAr="الأكثر طلباً" titleEn="Most Ordered" icon={TrendingUp} onViewAll={() => navigate('/products/most-ordered')} />
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden divide-y divide-gray-50 dark:divide-white/5 shadow-sm">
              {mostOrdered.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                    style={{
                      color: index === 0 ? 'white' : 'var(--store-secondary-color)',
                      backgroundColor: index === 0 ? 'var(--store-secondary-color)' : 'color-mix(in srgb, var(--store-secondary-color) 10%, transparent)',
                    }}
                  >
                    #{index + 1}
                  </div>
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
          </section>
        )}

        {/* Mobile Footer */}
        <StoreFooter />
      </div>

      {/* ── DESKTOP (hidden below md) ── */}
      <div className="hidden md:flex flex-col flex-1 bg-[#fafafa] dark:bg-[#121214]">

        {/* Hero Banner */}
        <div className="relative w-full h-[420px] lg:h-[500px] overflow-hidden">
          {banners.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${idx === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img
                src={banner.image ?? ''}
                alt={banner.title ?? ''}
                className="w-full h-full object-cover"
                fetchPriority={idx === 0 ? "high" : "low"}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
          {isLoading && <div className="absolute inset-0 bg-gray-100 dark:bg-neutral-800 animate-pulse" />}
          <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
          <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/60 via-transparent to-black/20" />

          {banners.map((banner, idx) => (
            <div
              key={`dt-${banner.id}`}
              className={`absolute inset-0 z-30 flex flex-col justify-end pb-12 transition-all duration-700 ${idx === activeBannerIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
            >
              <div className={`px-10 max-w-2xl ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <h1 className="text-white font-black text-3xl lg:text-4xl xl:text-5xl leading-tight mb-3">{banner.title}</h1>
                {banner.description && <p className="text-gray-300 text-sm lg:text-base max-w-lg leading-relaxed mb-6">{banner.description}</p>}
                <button
                  onClick={() => navigate('/categories')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
                  style={{ backgroundColor: 'var(--store-secondary-color)' }}
                >
                  <span>{isArabic ? 'تسوق الآن' : 'Shop Now'}</span>
                  {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {banners.length > 1 && (
            <div className={`absolute bottom-6 ${dir === 'rtl' ? 'left-10' : 'right-10'} z-40 flex gap-1.5`}>
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: idx === activeBannerIndex ? '24px' : '7px',
                    backgroundColor: idx === activeBannerIndex ? 'var(--store-secondary-color)' : 'rgba(255,255,255,0.35)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="flex flex-1 gap-8 px-8 lg:px-12 py-10 max-w-[1440px] mx-auto w-full">

          {/* Sidebar: Categories */}
          <aside className="w-[220px] lg:w-[260px] shrink-0 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1 h-4 rounded-full" style={{ backgroundColor: 'var(--store-secondary-color)' }} />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                {isArabic ? 'الأقسام' : 'Categories'}
              </h2>
            </div>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[100px] bg-gray-100 dark:bg-neutral-800 rounded-2xl animate-pulse" />
              ))
              : categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate('/categories?id=' + cat.id)}
                  className="relative group rounded-2xl overflow-hidden h-[100px] lg:h-[115px] border border-gray-200/80 dark:border-white/5 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 bg-neutral-800" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/5" />
                  <div className={`absolute inset-0 p-3 flex flex-col justify-end ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-white font-black text-sm leading-tight truncate">{cat.name}</h3>
                  </div>
                </button>
              ))}
            <button
              onClick={() => navigate('/categories')}
              className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed text-xs font-bold transition-colors hover:opacity-70"
              style={{ borderColor: 'var(--store-secondary-color)', color: 'var(--store-secondary-color)' }}
            >
              {isArabic ? 'عرض كل الأقسام' : 'View All Categories'}
              {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </aside>

          {/* Main area */}
          <main className="flex-1 min-w-0 flex flex-col gap-10">

            {/* Brands Section (Desktop) */}
            {(isLoading || (brands && brands.length > 0)) && (
              <section>
                <BrandsSection brands={brands} isLoading={isLoading} />
              </section>
            )}

            {/* Featured Products */}
            {(isLoading || featuredProducts.length > 0) && (
              <section>
                <SectionHeader titleAr="منتجات مميزة" titleEn="Featured Products" icon={Sparkles} onViewAll={() => navigate('/products/featured-products')} />
                {isLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredProducts.map((p) => <div key={p.id}><ProductCard product={p} imgIdPrefix="h5-dt-feat" /></div>)}
                  </div>
                )}
              </section>
            )}

            {/* Two-column: Offers + Most Ordered */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Latest Offers */}
              {(isLoading || latestOffers.length > 0) && (
                <section>
                  <SectionHeader titleAr="أحدث العروض" titleEn="Latest Offers" icon={Percent} onViewAll={() => navigate('/products/latest-offers')} />
                  <div className="flex flex-col gap-3">
                    {(isLoading ? Array.from({ length: 3 }).map((_, i) => ({ id: i } as any)) : latestOffers.slice(0, 4)).map((product, i) =>
                      isLoading ? (
                        <div key={i} className="h-20 bg-white dark:bg-neutral-900 rounded-2xl animate-pulse" />
                      ) : (
                        <div
                          key={product.id}
                          onClick={() => navigate(`/product/${product.id}`)}
                          className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl p-3 flex items-center gap-3.5 relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.99]"
                        >
                          {product.discount_percentage && (
                            <span
                              className="absolute top-0 ltr:right-0 rtl:left-0 text-[9px] font-black text-white px-2.5 py-1 rounded-bl-xl tracking-wider"
                              style={{ backgroundColor: 'var(--store-secondary-color)' }}
                            >
                              -{product.discount_percentage}%
                            </span>
                          )}
                          <div className="w-[70px] h-[70px] rounded-xl bg-gray-50 dark:bg-neutral-800 overflow-hidden shrink-0">
                            <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className={`flex-1 min-w-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                            <h4 className="text-xs font-black text-gray-800 dark:text-white line-clamp-1 mb-1">{product.name}</h4>
                            <div className="flex items-center justify-between">
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
                              <button
                                onClick={(e) => handleFav(e, product.id)}
                                className="w-7 h-7 rounded-full border border-gray-105 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 transition-all hover:bg-gray-105 dark:hover:bg-neutral-700 active:scale-90 shrink-0"
                              >
                                <Heart className={`w-3.5 h-3.5 ${favorites.includes(String(product.id)) ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </section>
              )}

              {/* Most Ordered */}
              {mostOrdered.length > 0 && (
                <section>
                  <SectionHeader titleAr="الأكثر طلباً" titleEn="Most Ordered" icon={TrendingUp} onViewAll={() => navigate('/products/most-ordered')} />
                  <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl divide-y divide-gray-50 dark:divide-white/5 overflow-hidden shadow-sm">
                    {mostOrdered.map((product, index) => (
                      <div
                        key={product.id}
                        onClick={() => navigate(`/product/${product.id}`)}
                        className="flex items-center gap-3.5 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer active:scale-[0.99]"
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
                          style={{
                            color: index === 0 ? 'white' : 'var(--store-secondary-color)',
                            backgroundColor: index === 0 ? 'var(--store-secondary-color)' : 'color-mix(in srgb, var(--store-secondary-color) 10%, transparent)',
                          }}
                        >
                          #{index + 1}
                        </div>
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-800 shrink-0">
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
                </section>
              )}
            </div>

            {/* Trust Badges */}
            <section>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { Icon: ShieldCheck, titleAr: 'منتجات أصلية', titleEn: 'Authentic Products' },
                  { Icon: Truck, titleAr: 'توصيل سريع', titleEn: 'Fast Delivery' },
                  { Icon: ShoppingBag, titleAr: 'دفع آمن', titleEn: 'Secure Payment' },
                  { Icon: Clock, titleAr: 'دعم مستمر', titleEn: 'Ongoing Support' },
                ].map(({ Icon, titleAr, titleEn }, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex gap-3 items-center shadow-sm"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: 'color-mix(in srgb, var(--store-secondary-color) 8%, transparent)',
                        borderColor: 'color-mix(in srgb, var(--store-secondary-color) 20%, transparent)',
                      }}
                    >
                      <Icon className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} />
                    </div>
                    <h5 className="text-[11px] font-black text-gray-800 dark:text-white uppercase leading-tight">
                      {isArabic ? titleAr : titleEn}
                    </h5>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>

        {/* Desktop Footer */}
        <StoreFooter />
      </div>
    </div>
  );
}
