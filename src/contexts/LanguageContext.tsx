'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from '../i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations['ar']) => string;
  dir: 'rtl' | 'ltr';
  setStoreDetails: (name: string, tagline: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');
  const [storeName, setStoreName] = useState<string | null>(null);
  const [storeTagline, setStoreTagline] = useState<string | null>(null);

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as Language | null;
      if (stored === 'ar' || stored === 'en') {
        setLanguage(stored);
      }
    }
  }, []);

  // Update document attributes to prevent mismatch and support full page translation styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const setStoreDetails = (name: string, tagline: string) => {
    setStoreName(name);
    setStoreTagline(tagline);
  };

  const t = (key: keyof typeof translations['ar']) => {
    if (key === 'appName' && storeName) {
      return storeName;
    }
    if (key === 'tagline' && storeTagline) {
      return storeTagline;
    }
    if (key === 'premium' && storeName) {
      const baseName = storeName.replace(/^(متجر\s+|Store\s+)/i, '').replace(/(\s+Store)/i, '');
      return language === 'ar' ? `${baseName} بريميوم` : `${baseName} Premium`;
    }
    if (key === 'footerText' && storeName) {
      return `v1.0.4 © 2026 ${storeName}`;
    }
    return translations[language][key] || key;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir, setStoreDetails }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
