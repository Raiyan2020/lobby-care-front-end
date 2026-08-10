'use client';
import { ReactNode } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';

interface AppContainerProps {
  children: ReactNode;
}

export function AppContainer({ children }: AppContainerProps) {
  const { dir } = useLanguage();
  const { settings } = useStore();
  const isDark = settings.displayMode === 'dark';

  return (
    <div dir={dir} className={`w-full min-h-[100dvh] ${isDark ? 'bg-[#0b0b0d]' : 'bg-[#f4f4f7]'} font-sans flex justify-center transition-colors duration-300`}>
      <div className={`w-full h-[100dvh] ${isDark ? 'bg-[#121214] text-white dark' : 'bg-[#fafafa] text-gray-900'} relative flex flex-col overflow-hidden transition-colors duration-300`}>
        {children}
      </div>
    </div>
  );
}
