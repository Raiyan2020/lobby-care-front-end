'use client';
import { ViewState } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface ComingSoonProps {
  view?: ViewState;
}

export function ComingSoon({ view = 'OFFERS' }: ComingSoonProps) {
  const { t } = useLanguage();
  
  const titles = {
    CATEGORIES: t('categories'),
    OFFERS: t('offers'),
    ACCOUNT: t('account')
  };

  return (
    <div className="flex flex-col items-center justify-center flex-1 h-full min-h-[60vh]">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--store-secondary-color)" strokeWidth="1.5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M12 6v6l4 2" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{titles[view as keyof typeof titles]} {t('comingSoon')}</h2>
      <p className="text-gray-400 text-sm leading-relaxed max-w-[280px] text-center">
        {t('stayTuned')}
      </p>
    </div>
  );
}
