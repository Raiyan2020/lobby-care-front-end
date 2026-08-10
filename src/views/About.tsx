'use client';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { ArrowRight, Info } from 'lucide-react';
import { useAboutQuery } from '../hooks/useAboutQuery';

export function About() {
  const { dir, language } = useLanguage();
  const { settings } = useStore();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const { about, isLoading, isError } = useAboutQuery();

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa] dark:bg-[#121214]" dir={dir}>
      <div className="container mx-auto px-5 md:px-6 ">
        {/* Page Title Header */}
        <div className="mb-6 mt-2 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-neutral-900 rounded-full hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors shadow-sm shrink-0"
          >
            <ArrowRight className={`w-5 h-5 text-gray-800 dark:text-gray-200 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
          </button>
          <h2 className="text-[22px] font-black text-[#1a1a1a] dark:text-white font-sans tracking-tight leading-tight">
            {isArabic ? 'من نحن' : 'About Us'}
          </h2>
        </div>

        <div className="space-y-6">

          {/* Intro Hero */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            {settings.logoUrl ? (
              <div className="w-16 h-16 bg-white rounded-full overflow-hidden flex items-center justify-center mb-3 shadow-md border border-white/20">
                <img
                  src={settings.logoUrl}
                  alt={isArabic ? settings.storeName : settings.storeNameEn}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3">
                <Info className="w-6 h-6 text-white" />
              </div>
            )}
            <h3 className="text-lg font-black mb-1">{isArabic ? settings.storeName : settings.storeNameEn}</h3>
            <p className="text-[13px]  font-medium text-center">
              {isArabic ? settings.tagline : settings.taglineEn}
            </p>
          </div>

          <div className="bg-white dark:bg-neutral-900 rounded-[20px] p-5 shadow-2xs border border-gray-100 dark:border-white/5">
            <section>
              {isLoading && (
                <div className="space-y-2 animate-pulse mt-2">
                  <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-full" />
                  <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 dark:bg-neutral-800 rounded w-4/5" />
                </div>
              )}

              {isError && (
                <p className="text-[13px] text-gray-400">
                  {isArabic ? 'حدث خطأ أثناء تحميل البيانات.' : 'Failed to load content.'}
                </p>
              )}

              {!isLoading && !isError && about && (
                <div
                  className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed font-medium
                        [&_p]:mb-3 [&_p]:leading-relaxed
                        [&_strong]:text-gray-900 [&_strong]:dark:text-white [&_strong]:font-black"
                  dangerouslySetInnerHTML={{ __html: about }}
                />
              )}
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}

