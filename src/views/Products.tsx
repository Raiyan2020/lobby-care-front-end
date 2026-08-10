'use client';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Loader2, Sparkles, BoxIcon } from 'lucide-react';
import { useNavigate } from '../lib/navigation';
import { useSearchParams } from 'next/navigation';
import { useCategoryProductsQuery } from '../hooks/useCategoryProductsQuery';
import { useCategoriesQuery } from '../hooks/useCategoriesQuery';
import { ProductCard } from '../components/ProductCard';
import { SearchInput } from '../components/SearchInput';
import type { ApiProduct } from '../api/types';
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

export function Products() {
  const { dir, language } = useLanguage();
  const searchParams = useSearchParams();
  const navigate = useNavigate();

  const isArabic = language === 'ar';

  // Parse filters from search params
  const brandIdStr = searchParams.get('brand_id');
  const brandId = brandIdStr ? Number(brandIdStr) : null;
  const brandName = searchParams.get('brand_name') || '';

  const categoryIdStr = searchParams.get('category_id');
  const initialCategoryId = categoryIdStr ? Number(categoryIdStr) : null;
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(initialCategoryId);

  const initialPage = Number(searchParams.get('page')) || 1;
  const [page, setPage] = useState(initialPage);

  // Add search state
  const initialSearch = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Sync category state and page from query params if changed externally
  useEffect(() => {
    const catId = searchParams.get('category_id');
    setSelectedCategoryId(catId ? Number(catId) : null);

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
        navigate(`/products?${params.toString()}`, { replace: true });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch category list for the horizontal filter bar
  const { categories, isLoading: isCategoriesLoading } = useCategoriesQuery(1);

  // Fetch matching products
  const {
    products,
    pagination,
    isLoading: isProductsLoading,
    isError: isProductsError,
  } = useCategoryProductsQuery(selectedCategoryId, page, brandId, debouncedSearch);

  const handleBack = () => {
    // Navigate back to brands if brand_id exists, otherwise to home
    if (brandId) {
      navigate('/brands');
    } else {
      navigate('/home');
    }
  };

  const handleCategorySelect = (id: number | null) => {
    setSelectedCategoryId(id);
    setPage(1);

    // Update URL search parameters
    const params = new URLSearchParams(window.location.search);
    if (id !== null) {
      params.set('category_id', String(id));
    } else {
      params.delete('category_id');
    }
    params.set('page', '1');
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(newPage));
    navigate(`/products?${params.toString()}`);
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

  // Determine page header title
  const displayTitle = brandName || (isArabic ? 'المنتجات' : 'Products');

  return (
    <div className="flex flex-col pb-12 pt-4 selection:bg-neutral-900 selection:text-white bg-[#fafafa] dark:bg-[#121214] min-h-screen" dir={dir}>

      {/* Header */}
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

      <div className="container mx-auto px-5 mt-4">

        {/* Search Bar */}
        <div className="mb-4">
          <SearchInput value={searchInput} onChange={setSearchInput} />
        </div>

        {/* Categories Horizontal Filter Pills Bar */}
        {(isCategoriesLoading || categories.length > 0) && (
          <div className="mb-6 pt-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {/* "All" Pill */}
              <button
                onClick={() => handleCategorySelect(null)}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all cursor-pointer ${selectedCategoryId === null
                  ? 'bg-[var(--store-secondary-color)] text-white border-[var(--store-secondary-color)]'
                  : 'bg-white dark:bg-neutral-900 text-gray-650 dark:text-gray-400 border-gray-100 dark:border-white/5'
                  }`}
              >
                {isArabic ? 'الكل' : 'All'}
              </button>

              {/* Categories Pills */}
              {categories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider border transition-all whitespace-nowrap cursor-pointer ${isSelected
                      ? 'bg-[var(--store-secondary-color)] text-white border-[var(--store-secondary-color)]'
                      : 'bg-white dark:bg-neutral-900 text-gray-650 dark:text-gray-400 border-gray-100 dark:border-white/5'
                      }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Products Loading Grid */}
        {isProductsLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
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

        {/* Empty State */}
        {!isProductsLoading && !isProductsError && products.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center select-none">
            <div className="w-20 h-20 bg-white dark:bg-neutral-900 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100 dark:border-white/5" style={{ color: 'var(--store-secondary-color)' }}>
              <BoxIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
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
                : (isArabic ? 'العودة للخلف' : 'Go Back')}
            </button>
          </div>
        )}

        {/* Pagination controls */}
        {!isProductsLoading && !isProductsError && pagination && pagination.last_page > 1 && (
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
