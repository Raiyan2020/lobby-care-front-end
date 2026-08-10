'use client';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import { usePrivacyQuery } from '../hooks/usePrivacyQuery';

export function ReturnExchangePolicy() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const { privacy, isLoading, isError } = usePrivacyQuery();

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa] dark:bg-[#121214]" dir={dir}>
      {/* Page Title Header */}
      <div className="px-5 mb-6 mt-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm shrink-0"
        >
          <ArrowRight className={`w-5 h-5 text-gray-800 dark:text-gray-200 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
        </button>
        <h2 className="text-[22px] font-black text-[#1a1a1a] dark:text-white font-sans tracking-tight leading-tight">
          {isArabic ? 'سياسة الإرجاع والتبديل' : 'Return & Exchange Policy'}
        </h2>
      </div>

      <div className="px-5 space-y-6">
        {/* Loading state */}
        {isLoading && (
          <div className="bg-white dark:bg-neutral-900 rounded-[20px] p-6 shadow-2xs border border-gray-100 dark:border-white/5 space-y-4 animate-pulse">
            <div className="h-4 bg-gray-100 dark:bg-neutral-800 rounded w-1/4" />
            <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-full" />
            <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-5/6" />
            <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-4/5" />
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="bg-white dark:bg-neutral-900 rounded-[20px] p-6 shadow-2xs border border-gray-100 dark:border-white/5 text-center">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {isArabic ? 'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة لاحقاً.' : 'Failed to load content. Please try again later.'}
            </p>
          </div>
        )}

        {/* Dynamic HTML Content */}
        {!isLoading && !isError && privacy && (
          <div
            className="bg-white dark:bg-neutral-900 rounded-[20px] p-6 shadow-2xs border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300
              [&_h3]:text-[15px] [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-6 [&_h3]:mb-2.5 [&_h3]:font-sans
              [&_p]:text-[13px] [&_p]:text-gray-600 [&_p]:dark:text-gray-400 [&_p]:leading-relaxed [&_p]:font-medium [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1.5 [&_ul]:mb-4
              [&_li]:text-[13px] [&_li]:text-gray-600 [&_li]:dark:text-gray-400"
            dangerouslySetInnerHTML={{ __html: privacy }}
          />
        )}
      </div>
    </div>
  );
}

