'use client';
import React from 'react';
import { Search, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, className = '' }: SearchInputProps) {
  const { dir, language } = useLanguage();
  const isArabic = language === 'ar';
  const defaultPlaceholder = isArabic ? 'بحث عن المنتجات...' : 'Search products...';

  return (
    <div className={`relative flex items-center w-full transition-all ${className}`} dir={dir}>
      <Search className={`absolute ${dir === 'rtl' ? 'right-4' : 'left-4'} w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none transition-colors duration-200`} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || defaultPlaceholder}
        className={`w-full h-12 ${dir === 'rtl' ? 'pr-11 pl-10' : 'pl-11 pr-10'} bg-white dark:bg-neutral-900 border border-gray-200 dark:border-white/5 rounded-2xl outline-none text-sm font-semibold text-[#1a1a1a] dark:text-white placeholder:text-gray-450 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-[var(--store-secondary-color)] focus:border-transparent transition-all shadow-sm duration-200`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-neutral-850 hover:bg-gray-200 dark:hover:bg-neutral-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all active:scale-90 cursor-pointer`}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
