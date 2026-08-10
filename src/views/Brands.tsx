'use client';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from '../lib/navigation';
import { useBrandsQuery } from '../hooks/useBrandsQuery';

export function Brands() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const { brands, pagination, isLoading, isError } = useBrandsQuery(page);

  const isArabic = language === 'ar';

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="flex flex-col pb-12 pt-4 selection:bg-neutral-900 selection:text-white bg-[#fafafa] dark:bg-[#121214] min-h-screen" dir={dir}>
      <div className="container mx-auto ">

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/85 dark:bg-[#121214]/85 backdrop-blur-md py-4 flex items-center border-b border-gray-105 dark:border-white/5 relative mb-6">
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors shrink-0 relative z-10 cursor-pointer"
          >
            {dir === 'rtl' ? <ArrowRight className="w-5 h-5 text-gray-800 dark:text-gray-200" /> : <ArrowLeft className="w-5 h-5 text-gray-800 dark:text-gray-200" />}
          </button>
          <div className={`absolute left-1/2 -translate-x-1/2 text-center w-[60%] truncate`}>
            <h2 className="text-lg font-black text-[#1a1a1a] dark:text-white">
              {isArabic ? 'العلامات التجارية' : 'Brands'}
            </h2>
            {pagination && (
              <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-wider">
                {isArabic ? `${pagination.total} ماركة` : `${pagination.total} brands`}
              </p>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[140px] aspect-square bg-white dark:bg-neutral-900 rounded-2xl animate-pulse border border-gray-100 dark:border-white/5" />
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {isArabic ? 'تعذر تحميل العلامات التجارية، يرجى المحاولة مجدداً' : 'Failed to load brands. Please try again.'}
            </p>
          </div>
        )}

        {/* Brands Catalog Grid */}
        {!isLoading && !isError && (
          <div className="flex flex-wrap justify-center gap-4">
            {brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => {
                  navigate(`/products?brand_id=${brand.id}&brand_name=${encodeURIComponent(brand.name)}`);
                }}
                className="w-[140px] bg-white dark:bg-neutral-900 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center gap-3 hover:shadow-md dark:hover:border-white/10 transition-all group active:scale-[0.98] aspect-square cursor-pointer"
              >
                {/* Brand logo container */}
                <div className="w-20 h-20 bg-gray-50 dark:bg-neutral-800 rounded-2xl overflow-hidden flex items-center justify-center p-2.5 border border-gray-100/60 dark:border-white/5 shrink-0">
                  {brand.image ? (
                    <img
                      src={brand.image}
                      alt={brand.name}
                      className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'color-mix(in srgb, var(--store-secondary-color) 12%, transparent)' }}
                    >
                      <span className="text-2xl font-black" style={{ color: 'var(--store-secondary-color)' }}>
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Name */}
                <h3 className="font-black text-[#1a1a1a] dark:text-white text-xs text-center truncate w-full group-hover:text-[var(--store-secondary-color)] transition-colors leading-tight">
                  {brand.name}
                </h3>
              </button>
            ))}

            {brands.length === 0 && (
              <div className="col-span-full text-center py-20 text-gray-400 flex flex-col items-center justify-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                </svg>
                <p>{isArabic ? 'لا توجد علامات تجارية حالياً' : 'No brands available'}</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination Controls */}
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

        {/* Page Info */}
        {pagination && pagination.last_page > 1 && (
          <p className="text-center text-xs text-gray-400 mt-3 mb-4">
            {isArabic ? `صفحة ${page} من ${pagination.last_page}` : `Page ${page} of ${pagination.last_page}`}
          </p>
        )}
      </div>
    </div>
  );
}
