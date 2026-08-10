'use client';
import React from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { ApiBrand } from '../api/types';

interface BrandsSectionProps {
  brands: ApiBrand[];
  isLoading?: boolean;
}

export function BrandsSection({ brands, isLoading }: BrandsSectionProps) {
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  if (!isLoading && (!brands || brands.length === 0)) return null;

  return (
    <div className="w-full">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm md:text-base font-black uppercase tracking-wider text-gray-800 dark:text-white">
          {isArabic ? 'العلامات التجارية' : 'Our Brands'}
        </h2>
        <button
          onClick={() => navigate('/brands')}
          className="text-[11px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: 'var(--store-secondary-color)' }}
        >
          {isArabic ? 'عرض الكل' : 'View All'}
          {dir === 'rtl' ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Brands Horizontal Scroll Container */}
      <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth -mx-5 px-5 md:mx-0 md:px-0 justify-center">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-2xl bg-gray-150 dark:bg-neutral-800 animate-pulse shrink-0"
            />
          ))
          : brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() =>
                navigate(`/products?brand_id=${brand.id}&brand_name=${encodeURIComponent(brand.name)}`)
              }
              className="group flex flex-col items-center shrink-0 active:scale-95 transition-transform cursor-pointer"
            >
              {/* Logo wrapper with micro-shadow and border adjustments for light/dark themes */}
              <div className="w-[72px] h-[72px] md:w-[88px] md:h-[88px] rounded-2xl bg-white dark:bg-neutral-900 border border-gray-100 dark:border-white/5 flex items-center justify-center p-2.5 shadow-sm group-hover:shadow-md dark:group-hover:border-white/10 transition-all duration-300 overflow-hidden">
                {brand.image ? (
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center rounded-xl bg-gray-50 dark:bg-neutral-800">
                    <span className="text-[10px] font-black text-gray-400 truncate max-w-full px-1">
                      {brand.name}
                    </span>
                  </div>
                )}
              </div>
              {/* Brand Name */}
              <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300 text-center mt-1.5 truncate max-w-[72px] md:max-w-[88px] transition-colors group-hover:text-[var(--store-secondary-color)]">
                {brand.name}
              </span>
            </button>
          ))}
      </div>
    </div>
  );
}
