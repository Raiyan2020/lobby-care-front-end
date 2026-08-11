'use client';
/**
 * Home6Layout — Dark editorial / magazine style
 * Full-bleed dark banner → horizontal categories pills → product masonry grid → offers → most-ordered
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { HomeLayoutProps } from './HomeLayoutProps';
import { Heart, ChevronLeft, ChevronRight, ShoppingBag, TrendingUp, Percent, Sparkles, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { StoreFooter } from './StoreFooter';
import { useAddToCart } from '../hooks/useAddToCart';
import { BrandsSection } from './BrandsSection';



export function Home6Layout({ banners, categories, brands, featuredProducts, latestOffers, mostOrdered, isLoading }: HomeLayoutProps) {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const { settings, favorites, toggleFavorite } = useStore();
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const isArabic = language === 'ar';
  const displayStoreName = isArabic ? settings.storeName : settings.storeNameEn;
  const { addToCart, loadingId } = useAddToCart();

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setHeroIndex(p => (p + 1) % banners.length), 5500);
    return () => clearInterval(id);
  }, [banners.length]);

  const handleFav = (e: React.MouseEvent, productId: number) => { e.stopPropagation(); toggleFavorite(String(productId)); };
  const isDark = settings.displayMode === 'dark';

  return (
    <div className={`flex-1 flex flex-col selection:bg-neutral-700 selection:text-white transition-colors duration-300 ${isDark ? 'bg-[#0a0a0a] text-white' : 'bg-[#f8f9fa] text-gray-805'}`}>

      {/* Full-bleed Banner */}
      <div className="relative w-full h-[360px] sm:h-[440px] overflow-hidden">
        {isLoading
          ? <div className="absolute inset-0 bg-neutral-900 animate-pulse" />
          : banners.map((b, idx) => (
            <div key={b.id} className={`absolute inset-0 transition-opacity duration-1000 ${idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <img
                src={b.image ?? ''}
                alt={b.title ?? ''}
                className="w-full h-full object-cover opacity-60"
                fetchPriority={idx === 0 ? "high" : "low"}
                loading={idx === 0 ? "eager" : "lazy"}
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#0a0a0a] via-[#0a0a0a]/60' : 'from-[#f8f9fa] via-[#f8f9fa]/60'} to-transparent`} />
            </div>
          ))
        }
        {!isLoading && (
          <div className={`absolute bottom-0 left-0 right-0 z-20 px-6 pb-10 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
            <span className="text-[10px] tracking-[0.25em] font-black uppercase mb-2 block" style={{ color: 'var(--store-secondary-color)' }}>
              {isArabic ? 'عرض مميز' : 'Featured Collection'}
            </span>
            <h1 className={`font-black text-3xl sm:text-4xl leading-tight mb-4 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {banners[heroIndex]?.title || ''}
            </h1>
            {banners[heroIndex]?.description && (
              <p className={`text-sm mb-6 max-w-xs transition-colors ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{banners[heroIndex].description}</p>
            )}
            <button
              onClick={() => navigate('/categories')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: 'var(--store-secondary-color)' }}
            >
              <span>{isArabic ? 'تسوق الآن' : 'Shop Now'}</span>
              {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        )}
        {banners.length > 1 && (
          <div className={`absolute bottom-4 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-30 flex gap-1.5`}>
            {banners.map((_, idx) => <button key={idx} onClick={() => setHeroIndex(idx)} className="h-1 rounded-full transition-all duration-300" style={{ width: idx === heroIndex ? '24px' : '6px', backgroundColor: idx === heroIndex ? 'var(--store-secondary-color)' : 'rgba(255,255,255,0.25)' }} />)}
          </div>
        )}
      </div>

      {/* Category Pills */}
      {categories.length > 0 && (
        <div className="container mx-auto pt-6 pb-4">
          <div className="flex items-center gap-3 px-5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setSelectedCat(null); navigate('/categories'); }}
              className="shrink-0 px-4 py-2 rounded-full text-xs font-black !text-white uppercase tracking-wider border transition-all"
              style={{
                backgroundColor: selectedCat === null ? 'var(--store-secondary-color)' : 'transparent',
                color: selectedCat === null ? '#000' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
                borderColor: selectedCat === null ? 'var(--store-secondary-color)' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
              }}
            >
              {isArabic ? 'الكل' : 'All'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCat(cat.id); navigate('/categories?id=' + cat.id); }}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-black  uppercase tracking-wider border transition-all whitespace-nowrap"
                style={{
                  backgroundColor: selectedCat === cat.id ? 'var(--store-secondary-color)' : 'transparent',
                  color: selectedCat === cat.id ? '#000' : (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'),
                  borderColor: selectedCat === cat.id ? 'var(--store-secondary-color)' : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'),
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brands Section */}
      {(isLoading || (brands && brands.length > 0)) && (
        <div className="container mx-auto px-5 mb-8">
          <BrandsSection brands={brands} isLoading={isLoading} />
        </div>
      )}

      {/* Featured Products */}
      {(isLoading || featuredProducts.length > 0) && (
        <div className="container mx-auto px-5 mt-4 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2"><h2 className={`text-sm font-black uppercase tracking-wider transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{isArabic ? 'منتجات مميزة' : 'Featured Products'}</h2></div>
            <button onClick={() => navigate('/products/featured-products')} className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--store-secondary-color)' }}>
              {isArabic ? 'عرض الكل' : 'View All'}
              {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {(isLoading ? Array.from({ length: 4 }).map((_, i) => ({ id: i } as any)) : featuredProducts).map((product, i) =>
              isLoading ? (
                <div key={i} className="aspect-[4/3] bg-neutral-900 rounded-2xl animate-pulse" />
              ) : (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className={`border rounded-2xl overflow-hidden flex flex-col cursor-pointer group hover:border-[var(--store-secondary-color)]/30 transition-all ${isDark ? 'bg-neutral-900 border-white/5' : 'bg-white border-gray-100 shadow-xs'}`}>
                  <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
                    <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className={`absolute inset-0 bg-gradient-to-t to-transparent ${isDark ? 'from-[#0a0a0a]/80' : 'from-black/10'}`} />
                    <button onClick={(e) => handleFav(e, product.id)} className={`absolute top-2.5 ${dir === 'rtl' ? 'left-2.5' : 'right-2.5'} w-7 h-7 bg-black/50 rounded-full flex items-center justify-center active:scale-90 z-10`}>
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(String(product.id)) ? 'fill-current text-red-400' : 'text-gray-400'}`} />
                    </button>
                    {product.discount_percentage && <span className={`absolute top-2.5 ${dir === 'rtl' ? 'right-2.5' : 'left-2.5'} text-[9px] font-black px-1.5 py-0.5 rounded-lg text-white z-10`} style={{ backgroundColor: 'var(--store-secondary-color)' }}>-{product.discount_percentage}%</span>}
                  </div>
                  <div className={`p-3 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <h4 className={`text-xs font-black line-clamp-2 mb-2 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h4>
                    <div className="flex items-baseline gap-1.5 mb-2">
                      <span className="font-black text-sm" style={{ color: 'var(--store-secondary-color)' }}>
                        {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                      </span>
                      {product.old_price && (
                        <span className={`text-[10px] line-through transition-colors ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          {Number(product.old_price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => addToCart(e, product.id, 1, undefined, product.stock)}
                      disabled={loadingId === product.id || product.stock === 0}
                      className="w-full py-2 rounded-xl text-white text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-70"
                      style={{ backgroundColor: 'var(--store-secondary-color)' }}
                    >
                      {loadingId === product.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <ShoppingBag className="w-3.5 h-3.5" />}
                      {isArabic ? 'أضف للسلة' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Latest Offers */}
      {latestOffers.length > 0 && (
        <div className="container mx-auto px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} />
              <h3 className={`text-sm font-black uppercase tracking-wider transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{isArabic ? 'أحدث العروض' : 'Latest Offers'}</h3>
            </div>
            <button onClick={() => navigate('/products/latest-offers')} className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--store-secondary-color)' }}>
              {isArabic ? 'عرض الكل' : 'View All'}
              {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {latestOffers.slice(0, 4).map((product) => {
              const hasDiscount = product.old_price && product.old_price > product.price;
              return (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className={`border rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden cursor-pointer hover:border-[var(--store-secondary-color)]/30 transition-all active:scale-[0.99] ${isDark ? 'bg-neutral-900 border-white/5' : 'bg-white border-gray-100 shadow-xs'}`}>
                  {product.discount_percentage && <span className="absolute top-0 ltr:right-0 rtl:left-0 text-[9px] font-black px-2 py-0.5 rounded-bl-xl text-white" style={{ backgroundColor: 'var(--store-secondary-color)' }}>-{product.discount_percentage}%</span>}
                  <div className={`w-16 h-16 rounded-xl overflow-hidden shrink-0 ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}><img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" /></div>
                  <div className={`flex-1 min-w-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <h4 className={`text-xs font-black line-clamp-1 mb-1 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-black text-sm" style={{ color: 'var(--store-secondary-color)' }}>
                          {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                        </span>
                        {hasDiscount && (
                          <span className={`text-[10px] line-through transition-colors ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                            {Number(product.old_price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleFav(e, product.id)}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all active:scale-90 shrink-0 ${isDark ? 'border-white/10 bg-neutral-800 hover:bg-neutral-700' : 'border-gray-250 bg-gray-50 hover:bg-gray-100'}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(String(product.id)) ? 'fill-current text-red-400' : 'text-gray-450'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Most Ordered */}
      {mostOrdered.length > 0 && (
        <div className="container mx-auto px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} />
              <h3 className={`text-sm font-black uppercase tracking-wider transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{isArabic ? 'الأكثر طلباً' : 'Most Ordered'}</h3>
            </div>
            <button onClick={() => navigate('/products/most-ordered')} className="text-[11px] font-black uppercase tracking-widest flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity" style={{ color: 'var(--store-secondary-color)' }}>
              {isArabic ? 'عرض الكل' : 'View All'}
              {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className={`border rounded-2xl overflow-hidden ${isDark ? 'bg-neutral-900 border-white/5 divide-y divide-white/[0.04]' : 'bg-white border-gray-100 divide-y divide-gray-100 shadow-xs'}`}>
            {mostOrdered.map((product, index) => (
              <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className={`flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50/50'}`}>
                <span className="w-6 text-[10px] font-black text-center shrink-0" style={{ color: 'var(--store-secondary-color)' }}>#{index + 1}</span>
                <div className={`w-10 h-10 rounded-xl overflow-hidden shrink-0 ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`}><img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" /></div>
                <div className={`flex-1 min-w-0 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <h4 className={`text-xs font-black line-clamp-1 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h4>
                  <span className="text-[11px] font-bold" style={{ color: 'var(--store-secondary-color)' }}>
                    {Number(product.price).toFixed(3)} {isArabic ? 'د.ك' : 'K.D'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <StoreFooter />
    </div>
  );
}
