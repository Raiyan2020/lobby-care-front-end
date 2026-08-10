'use client';
/**
 * Home4Layout — Full-width card categories (2-col + featured card) + products
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { HomeLayoutProps } from './HomeLayoutProps';
import { Heart, ChevronLeft, ChevronRight, ShoppingBag, TrendingUp, Percent, Sparkles, Loader2 } from 'lucide-react';
import { StoreFooter } from './StoreFooter';
import { useAddToCart } from '../hooks/useAddToCart';
import { BrandsSection } from './BrandsSection';



export function Home4Layout({ banners, categories, brands, featuredProducts, latestOffers, mostOrdered, isLoading }: HomeLayoutProps) {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const { settings, favorites, toggleFavorite } = useStore();
  const [heroIndex, setHeroIndex] = useState(0);
  const isArabic = language === 'ar';
  const displayStoreName = isArabic ? settings.storeName : settings.storeNameEn;
  const { addToCart, loadingId } = useAddToCart();

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => setHeroIndex(p => (p + 1) % banners.length), 5000);
    return () => clearInterval(id);
  }, [banners.length]);

  const handleFav = (e: React.MouseEvent, productId: number) => { e.stopPropagation(); toggleFavorite(String(productId)); };

  return (
    <div className="flex-1 flex flex-col bg-[#f8f8f8] dark:bg-[#121214] selection:bg-neutral-900 selection:text-white">

      {/* Banner */}
      <div className="container mx-auto relative px-4 mt-4 mb-6">
        <div className="relative overflow-hidden rounded-3xl h-[200px] sm:h-[250px] shadow-md">
          {isLoading
            ? <div className="absolute inset-0 bg-gray-100 dark:bg-neutral-800 animate-pulse" />
            : banners.map((b, idx) => (
              <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                <img
                  src={b.image ?? ''}
                  alt={b.title ?? ''}
                  className="w-full h-full object-cover"
                  fetchPriority={idx === 0 ? "high" : "low"}
                  loading={idx === 0 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className={`absolute bottom-4 z-10 ${dir === 'rtl' ? 'right-5 text-right' : 'left-5 text-left'}`}>
                  <h2 className="text-white font-black text-xl">{b.title}</h2>
                  {b.description && <p className="text-gray-300 text-xs mt-0.5">{b.description}</p>}
                </div>
              </div>
            ))}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-20">
              {banners.map((_, idx) => <button key={idx} onClick={() => setHeroIndex(idx)} className="h-1.5 rounded-full transition-all" style={{ width: idx === heroIndex ? '16px' : '6px', backgroundColor: idx === heroIndex ? 'var(--store-secondary-color)' : 'rgba(255,255,255,0.4)' }} />)}
            </div>
          )}
        </div>
      </div>

      {/* Card Categories (2-col with featured 1st) */}
      {(isLoading || categories.length > 0) && (
        <div className="container mx-auto px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white">{isArabic ? 'الأقسام' : 'Categories'}</h2>
            <button onClick={() => navigate('/categories')} className="text-xs font-bold hover:underline" style={{ color: 'var(--store-secondary-color)' }}>{isArabic ? 'عرض الكل' : 'View All'}</button>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`col-span-1 h-[210px] bg-gray-100 dark:bg-neutral-800 rounded-[24px] animate-pulse`} />
              ))
              : categories.map((cat, index) => {
                const isFeatured = index === 0;
                const isFullWidth = isFeatured;
                return (
                  <button key={cat.id} onClick={() => navigate('/categories?id=' + cat.id)} className="col-span-1 h-[210px] bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800/60 shadow-sm rounded-[24px] p-3 flex flex-col justify-between transition-all duration-300 group active:scale-[0.98]">
                    <div className="w-full h-[110px] rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-neutral-800">
                      {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center bg-neutral-800"><span className="text-white font-black text-xl">{cat.name.charAt(0)}</span></div>}
                    </div>
                    <div className={`w-full ${dir === 'rtl' ? 'text-right' : 'text-left'} flex-1 flex flex-col justify-end mt-1`}>
                      <h3 className="font-black text-gray-900 dark:text-white text-xs sm:text-sm leading-tight truncate">{cat.name}</h3>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 leading-none block mt-0.5">{isArabic ? 'تصفح المنتجات' : 'Browse Products'}</span>
                    </div>
                  </button>
                );
              })
            }
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
        <div className="container mx-auto px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white">{isArabic ? 'منتجات مميزة' : 'Featured Products'}</h3></div>
            <button onClick={() => navigate('/products/featured-products')} className="text-xs font-bold hover:underline" style={{ color: 'var(--store-secondary-color)' }}>{isArabic ? 'عرض الكل' : 'View All'}</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {(isLoading ? Array.from({ length: 4 }).map((_, i) => ({ id: i } as any)) : featuredProducts).map((product, i) =>
              isLoading ? (
                <div key={i} className="h-[220px] bg-white dark:bg-neutral-900 rounded-2xl animate-pulse" />
              ) : (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-white dark:bg-neutral-900 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col cursor-pointer group hover:shadow-md transition-shadow">
                  <div className="relative aspect-square rounded-xl bg-gray-50 dark:bg-neutral-800 mb-3 overflow-hidden">
                    <img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button onClick={(e) => handleFav(e, product.id)} className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} w-7 h-7 bg-white/90 dark:bg-black/50 rounded-full flex items-center justify-center shadow-sm z-10 active:scale-95 transition-transform`}>
                      <Heart className={`w-3.5 h-3.5 ${favorites.includes(String(product.id)) ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                    </button>
                    {product.discount_percentage && <div className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} px-2 py-0.5 text-white text-[10px] font-bold rounded-md z-10`} style={{ backgroundColor: 'var(--store-secondary-color)' }}>-{product.discount_percentage}%</div>}
                  </div>
                  <div className={`flex flex-col flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-white line-clamp-2 mb-2">{product.name}</h4>
                    <div className="flex items-baseline gap-1.5 mb-2">
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
                      onClick={(e) => addToCart(e, product.id)}
                      disabled={loadingId === product.id}
                      className="mt-auto w-full py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all disabled:opacity-70"
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
      )
      }

      {/* Latest Offers */}
      {
        latestOffers.length > 0 && (
          <div className="container mx-auto px-5 mb-8">
            <div className="flex items-center gap-2 mb-4"><Percent className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} /><h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white">{isArabic ? 'أحدث العروض' : 'Latest Offers'}</h3></div>
            <div className="flex flex-col  md:grid md:grid-cols-2 lg:grid-cols-4 gap-3">
              {latestOffers.slice(0, 4).map((product) => (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden cursor-pointer hover:shadow-md transition-all active:scale-[0.99]">
                  {product.discount_percentage && <span className="absolute top-0 ltr:right-0 rtl:left-0 text-[9px] font-black text-white px-2 py-0.5 rounded-bl-xl" style={{ backgroundColor: 'var(--store-secondary-color)' }}>-{product.discount_percentage}%</span>}
                  <div className="w-16 h-16 rounded-xl bg-gray-50 dark:bg-neutral-800 overflow-hidden shrink-0"><img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" /></div>
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
                        className="w-7 h-7 rounded-full border border-gray-105 dark:border-white/10 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 transition-all hover:bg-gray-100 dark:hover:bg-neutral-700 active:scale-90 shrink-0"
                      >
                        <Heart className={`w-3.5 h-3.5 ${favorites.includes(String(product.id)) ? 'fill-current text-red-500' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Most Ordered */}
      {
        mostOrdered.length > 0 && (
          <div className="container mx-auto px-5 mb-8">
            <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4" style={{ color: 'var(--store-secondary-color)' }} /><h3 className="text-sm font-black uppercase tracking-wider text-gray-800 dark:text-white">{isArabic ? 'الأكثر طلباً' : 'Most Ordered'}</h3></div>
            <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl divide-y divide-gray-50 dark:divide-white/5 shadow-sm overflow-hidden">
              {mostOrdered.map((product, index) => (
                <div key={product.id} onClick={() => navigate(`/product/${product.id}`)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <span className="w-6 text-[10px] font-black text-center shrink-0" style={{ color: 'var(--store-secondary-color)' }}>#{index + 1}</span>
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 dark:bg-neutral-800 shrink-0"><img src={product.image ?? ''} alt={product.name} className="w-full h-full object-cover" /></div>
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
        )
      }

      {/* Footer */}
      <StoreFooter />
    </div >
  );
}
