'use client';
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface PriceProps {
  amount: number;
  className?: string;
  isOldPrice?: boolean;
}

export function Price({ amount, className = '', isOldPrice = false }: PriceProps) {
  const { language } = useLanguage();
  
  const formattedNum = (Math.round(amount * 1000) / 1000).toFixed(3).replace(/\.?0+$/, (match) => {
    // We can keep .000 or trim it if it's whole, but user said:
    // "Use 3 decimal places when needed because Kuwaiti Dinar uses fils."
    // "If the price is a whole number, it can still display professionally as: د.ك 12 or: د.ك 12.000, Choose one consistent style across the whole app."
    // Let's just stick to 3 decimals consistent everywhere as per the user's .toFixed(3) rule earlier.
    return match;
  });

  const decorationClass = isOldPrice ? "line-through decoration-current opacity-70" : "";
  const subDecorationClass = isOldPrice ? "line-through" : "";

  if (language === 'ar') {
    return (
      <span className={`inline-flex flex-row items-baseline whitespace-nowrap gap-1.5 ${decorationClass} ${className}`} style={{ direction: 'rtl' }}>
        <span className={`amount ${subDecorationClass}`}>{formattedNum}</span>
        <span className={`currency ${subDecorationClass}`}>د.ك</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-row items-baseline whitespace-nowrap gap-1.5 ${decorationClass} ${className}`} style={{ direction: 'ltr' }}>
      <span className={`amount ${subDecorationClass}`}>{formattedNum}</span>
      <span className={`currency ${subDecorationClass}`}>K.D</span>
    </span>
  );
}
