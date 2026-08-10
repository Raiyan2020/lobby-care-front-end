'use client';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from '../lib/navigation';

export function Splash() {
  const { t, language } = useLanguage();
  const { settings } = useStore();
  const navigate = useNavigate();

  const displayStoreName = language === 'ar' ? settings.storeName : settings.storeNameEn;
  const displayTagline = language === 'ar' ? settings.tagline : settings.taglineEn;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-[#121214] transition-colors duration-300"
    >
      <motion.img
        onClick={() => navigate('/')}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', damping: 20 }}
        src={settings.logoUrl}
        alt={displayStoreName}
        className="w-24 h-24 object-contain mb-4 cursor-pointer"
      />
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-1"
      >
        {displayStoreName}
      </motion.h1>
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-sm text-neutral-500 dark:text-neutral-400 tracking-wide mb-12"
      >
        {displayTagline}
      </motion.p>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <div className="w-10 h-10 border-4 border-gray-100 dark:border-neutral-800 border-t-[var(--store-secondary-color)] rounded-full animate-spin"></div>
      </motion.div>
    </motion.div>
  );
}
