'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useSearchParams } from 'next/navigation';
import { useProductsListQuery } from '../hooks/useProductsListQuery';
import { ProductCard } from '../components/ProductCard';
import { SearchInput } from '../components/SearchInput';
import { Sparkles, Percent, TrendingUp, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import type { ApiProduct } from '../api/types';
import type { Product } from '../types';

type ListType = 'featured-products' | 'latest-offers' | 'most-ordered';

const titles = {
  ar: {
    'featured-products': 'منتجات مميزة',
    'latest-offers': 'أحدث العروض',
    'most-ordered': 'الأكثر طلباً',
  },
  en: {
    'featured-products': 'Featured Products',
    'latest-offers': 'Latest Offers',
    'most-ordered': 'Most Ordered',
  },
};

const mapApiProductToProduct = (p: ApiProduct): Product => {
  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    originalPrice: p.old_price ?? undefined,
    image: p.image ?? '',
    badge: p.discount_percentage ? `-${p.discount_percentage}%` : undefined,
    stock: p.stock,
  };
};

export function ProductsList() {
  const { type } = useParams<{ type: string }>();

  const listType = (type || 'featured-products') as ListType;

  const { dir, language, t } = useLanguage();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const isArabic = language === 'ar';
  const displayTitle = titles[isArabic ? 'ar' : 'en'][listType] || '';

  // Handle pagination state
  const initialPage = Number(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initialPage);

  // Handle search query state
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Sync state if query params change externally
  useEffect(() => {
    const pageFromQuery = Number(searchParams.get('page')) || 1;
    setPage(pageFromQuery);

    const searchFromQuery = searchParams.get('search') || '';
    if (searchFromQuery !== searchInput) {
      setSearchInput(searchFromQuery);
      setDebouncedSearch(searchFromQuery);
    }
  }, [searchParams]);

  // Handle debouncing of search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchInput) {
        setDebouncedSearch(searchInput);
        setPage(1);

        const params = new URLSearchParams(window.location.search);
        if (searchInput) {
          params.set('search', searchInput);
        } else {
          params.delete('search');
        }
        params.set('page', '1');
        navigate(`/products/${listType}?${params.toString()}`, { replace: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { products, pagination, isLoading, isError } = useProductsListQuery(listType, page, debouncedSearch);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(newPage));
    navigate(`/products/${listType}?${params.toString()}`);
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Skeleton Card
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden animate-pulse p-3 space-y-3">
      <div className="aspect-square bg-gray-100 dark:bg-neutral-800 rounded-xl" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-1/2" />
        <div className="h-8 bg-gray-100 dark:bg-neutral-800 rounded mt-2" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col pb-24 pt-4 selection:bg-neutral-900 selection:text-white bg-[#fafafa] dark:bg-[#121214] min-h-screen" dir={dir}>

      {/* Dynamic Header */}
      <div className="sticky top-0 z-10 bg-white/85 dark:bg-[#121214]/85 backdrop-blur-md px-6 py-4 flex items-center border-b border-gray-105 dark:border-white/5 relative">
        <button
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors shrink-0 relative z-10 cursor-pointer"
        >
          {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-800 dark:text-gray-200" /> : <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />}
        </button>
        <h2 className="text-lg font-black text-[#1a1a1a] dark:text-white absolute left-1/2 -translate-x-1/2 w-[60%] text-center truncate">
          {displayTitle}
        </h2>
      </div>

      <div className="container mx-auto mt-6">

        {/* Search Bar */}
        <div className="mb-6">
          <SearchInput value={searchInput} onChange={setSearchInput} />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {isArabic ? 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة لاحقاً.' : 'Failed to load products. Please try again later.'}
            </p>
          </div>
        )}

        {/* Product Cards Grid */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {products.map((apiProduct) => {
              const product = mapApiProductToProduct(apiProduct);
              return <ProductCard key={product.id} product={product} />;
            })}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center select-none">
            <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6 border border-gray-105 dark:border-white/5">
              {listType === 'latest-offers' ? (
                <Percent className="w-8 h-8" style={{ color: 'var(--store-secondary-color)' }} />
              ) : listType === 'most-ordered' ? (
                <TrendingUp className="w-8 h-8" style={{ color: 'var(--store-secondary-color)' }} />
              ) : (
                <Sparkles className="w-8 h-8" style={{ color: 'var(--store-secondary-color)' }} />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              {debouncedSearch
                ? (isArabic ? 'لا توجد نتائج مطابقة لبحثك' : 'No matching results found')
                : (isArabic ? 'لا توجد منتجات حالياً' : 'No products available right now')}
            </h3>
            <p className="text-gray-400 text-sm mb-6 max-w-[280px]">
              {debouncedSearch
                ? (isArabic ? `لم نجد أي منتج يطابق "${debouncedSearch}". يرجى المحاولة بكلمات أخرى.` : `We couldn't find any products matching "${debouncedSearch}". Please try again.`)
                : (isArabic ? 'يرجى العودة في وقت لاحق لتصفح المنتجات.' : 'Please check back later to browse products.')}
            </p>
            <button
              onClick={() => {
                if (debouncedSearch) {
                  setSearchInput('');
                } else {
                  navigate('/home');
                }
              }}
              className="px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
              style={{ backgroundColor: 'var(--store-secondary-color)' }}
            >
              {debouncedSearch
                ? (isArabic ? 'مسح البحث' : 'Clear Search')
                : (isArabic ? 'العودة للرئيسية' : 'Back to Home')}
            </button>
          </div>
        )}

        {/* Pagination controls */}
        {!isLoading && !isError && pagination && pagination.last_page > 1 && (
          <div className="flex flex-col items-center mt-12 gap-3">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handlePageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-[var(--store-secondary-color)] transition-colors cursor-pointer"
              >
                {dir === 'rtl' ? <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.last_page }).map((_, idx) => {
                  const p = idx + 1;
                  const isActive = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className="w-8 h-8 rounded-full text-xs font-black transition-all cursor-pointer"
                      style={{
                        backgroundColor: isActive ? 'var(--store-secondary-color)' : 'transparent',
                        color: isActive ? '#000' : 'var(--store-secondary-color)',
                        border: `1.5px solid ${isActive ? 'var(--store-secondary-color)' : 'color-mix(in srgb, var(--store-secondary-color) 30%, transparent)'}`,
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(Math.min(pagination.last_page, page + 1))}
                disabled={page === pagination.last_page}
                className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-[var(--store-secondary-color)] transition-colors cursor-pointer"
              >
                {dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              {isArabic ? `صفحة ${page} من ${pagination.last_page}` : `Page ${page} of ${pagination.last_page}`}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
