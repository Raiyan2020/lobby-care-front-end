'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Loader2, Star, ShoppingBag, Heart } from 'lucide-react';
import { useNavigate } from '../lib/navigation';
import { useSearchParams } from 'next/navigation';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';
import { useCategoryProductsQuery } from '../hooks/useCategoryProductsQuery';
import { ProductCard } from '../components/ProductCard';
import { SearchInput } from '../components/SearchInput';
import type { ApiCategory, ApiProduct } from '../api/types';
import type { Product } from '../types';

const mapApiProductToProduct = (p: ApiProduct): Product => {
  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    originalPrice: p.old_price ?? undefined,
    image: p.image ?? '',
    badge: p.discount_percentage ? `-${p.discount_percentage}%` : undefined,
  };
};

export function Categories() {
  const { dir, language } = useLanguage();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<ApiCategory | null>(() => {
    const passedId = searchParams.get('id');
    return passedId ? { id: Number(passedId), name: '', image: null } : null;
  });

  // Add search state
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Sync state if query params change externally
  useEffect(() => {
    const searchFromQuery = searchParams.get('search') || '';
    if (searchFromQuery !== searchInput) {
      setSearchInput(searchFromQuery);
      setDebouncedSearch(searchFromQuery);
    }
  }, [searchParams]);

  const { categories, pagination, isLoading, isError } = useCategoriesQuery(page);

  // If we land with ?id=X, resolve the full category once the list loads
  const resolvedSelected: ApiCategory | null = selectedCategory
    ? (categories.find(c => c.id === selectedCategory.id) ?? selectedCategory)
    : null;

  // Handle debouncing of search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== searchInput) {
        setDebouncedSearch(searchInput);
        setProductPage(1);

        if (resolvedSelected) {
          const params = new URLSearchParams(window.location.search);
          if (searchInput) {
            params.set('search', searchInput);
          } else {
            params.delete('search');
          }
          navigate(`/categories?${params.toString()}`, { replace: true });
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, resolvedSelected]);

  const {
    products,
    pagination: productPagination,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useCategoryProductsQuery(resolvedSelected ? resolvedSelected.id : null, productPage, null, debouncedSearch);

  const isArabic = language === 'ar';

  const handleBack = () => {
    setSelectedCategory(null);
    setProductPage(1);
    setSearchInput('');
    setDebouncedSearch('');
    navigate('/categories', { replace: true });
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

  // ── Category Product View ──
  if (resolvedSelected && resolvedSelected.name) {
    return (
      <div className="flex flex-col pb-12 bg-[#fafafa] dark:bg-[#121214]" dir={dir}>
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#121214]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
          <div className="container mx-auto py-4 flex items-center justify-between relative">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors shrink-0 relative z-10 cursor-pointer"
            >
              {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-800 dark:text-gray-200" /> : <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />}
            </button>
            <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white absolute left-1/2 -translate-x-1/2 w-[60%] text-center truncate">
              {resolvedSelected.name}
            </h2>
            <div className="w-10 h-10 shrink-0 opacity-0 pointer-events-none" />
          </div>
        </div>

        <div className="container mx-auto mt-6">
          {/* Search Bar */}
          <div className="mb-6">
            <SearchInput value={searchInput} onChange={setSearchInput} />
          </div>
          {/* Loading state */}
          {isProductsLoading && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Error state */}
          {isProductsError && !isProductsLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                {isArabic ? 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة لاحقاً.' : 'Failed to load products. Please try again later.'}
              </p>
            </div>
          )}

          {/* Product Cards Grid */}
          {!isProductsLoading && !isProductsError && products.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {products.map((apiProduct) => {
                const product = mapApiProductToProduct(apiProduct);
                return <ProductCard key={product.id} product={product} />;
              })}
            </div>
          )}

          {/* Empty state */}
          {!isProductsLoading && !isProductsError && products.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center select-none">
              <div className="w-20 h-20 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5" style={{ color: 'var(--store-secondary-color)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
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
                    handleBack();
                  }
                }}
                className="px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer"
                style={{ backgroundColor: 'var(--store-secondary-color)' }}
              >
                {debouncedSearch
                  ? (isArabic ? 'مسح البحث' : 'Clear Search')
                  : (isArabic ? 'العودة للأقسام' : 'Back to Categories')}
              </button>
            </div>
          )}

          {/* Pagination controls */}
          {!isProductsLoading && !isProductsError && productPagination && productPagination.last_page > 1 && (
            <div className="flex flex-col items-center mt-12 gap-3">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setProductPage(p => Math.max(1, p - 1))}
                  disabled={productPage === 1}
                  className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-[var(--store-secondary-color)] transition-colors cursor-pointer"
                >
                  {dir === 'rtl' ? <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: productPagination.last_page }).map((_, idx) => {
                    const p = idx + 1;
                    const isActive = p === productPage;
                    return (
                      <button
                        key={p}
                        onClick={() => setProductPage(p)}
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
                  onClick={() => setProductPage(p => Math.min(productPagination.last_page, p + 1))}
                  disabled={productPage === productPagination.last_page}
                  className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-[var(--store-secondary-color)] transition-colors cursor-pointer"
                >
                  {dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                {isArabic ? `صفحة ${productPage} من ${productPagination.last_page}` : `Page ${productPage} of ${productPagination.last_page}`}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Category List View ──
  return (
    <div className="flex flex-col pb-12 pt-4 selection:bg-neutral-900 selection:text-white bg-[#fafafa] dark:bg-[#121214] min-h-screen">
      <div className="container mx-auto ">
        <div className="mb-6 mt-2 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white text-center">
            {isArabic ? 'الأقسام' : 'Categories'}
          </h2>
          {pagination && (
            <p className="text-xs text-gray-400 mt-0.5">
              {isArabic ? `${pagination.total} قسم` : `${pagination.total} categories`}
            </p>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full h-[88px] bg-white dark:bg-neutral-900 rounded-2xl animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {isArabic ? 'تعذر تحميل الأقسام، يرجى المحاولة مجدداً' : 'Failed to load categories. Please try again.'}
            </p>
          </div>
        )}

        {/* Category List */}
        {!isLoading && !isError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setProductPage(1);
                  setSearchInput('');
                  setDebouncedSearch('');
                  navigate('/categories?id=' + cat.id);
                }}
                className="w-full bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex items-center gap-5 hover:shadow-md dark:hover:border-white/10 transition-all group active:scale-[0.98]"
              >
                {/* Category Image / Placeholder */}
                <div className="w-[72px] h-[72px] shrink-0 bg-gray-50 dark:bg-neutral-800 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100/60 dark:border-white/5">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--store-secondary-color) 12%, transparent)' }}
                    >
                      <span className="text-xl font-black" style={{ color: 'var(--store-secondary-color)' }}>
                        {cat.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <div className={`flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  <h3 className="font-bold text-[#1a1a1a] dark:text-white text-base mb-1">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{isArabic ? 'تصفح المنتجات' : 'Browse Products'}</p>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center group-hover:bg-[var(--store-secondary-color)] transition-colors shadow-sm shrink-0">
                  {dir === 'rtl' ? (
                    <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-white" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white dark:group-hover:text-white" />
                  )}
                </div>
              </button>
            ))}

            {categories.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400 flex flex-col items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <p>{isArabic ? 'لا توجد أقسام حالياً' : 'No categories available'}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ── */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-[var(--store-secondary-color)] transition-colors cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : dir === 'rtl' ? <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: pagination.last_page }).map((_, idx) => {
                const p = idx + 1;
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
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
              onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
              disabled={page === pagination.last_page || isLoading}
              className="w-10 h-10 rounded-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-[var(--store-secondary-color)] transition-colors cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-400" /> : dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
            </button>
          </div>
        )}

        {/* Page info */}
        {pagination && pagination.last_page > 1 && (
          <p className="text-center text-xs text-gray-400 mt-3 mb-4">
            {isArabic ? `صفحة ${page} من ${pagination.last_page}` : `Page ${page} of ${pagination.last_page}`}
          </p>
        )}
      </div>
    </div>
  );
}
