'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Banner } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { getImageSrc } from '../utils/imageUtils';

interface CarouselProps {
  banners: Banner[];
}

export function Carousel({ banners }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { dir, language } = useLanguage();

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="relative w-full h-[160px] bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-sm group">
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          src={getImageSrc(banners[currentIndex].image)}
          alt={banners[currentIndex].title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col justify-end p-6">
        <motion.div
          key={`text-${currentIndex}`}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="text-white font-bold text-xl mb-1">
            {language === 'ar' ? banners[currentIndex].title : (banners[currentIndex].titleEn || banners[currentIndex].title)}
          </h2>
          <p className="text-white/80 text-xs font-medium">
            {language === 'ar' ? banners[currentIndex].subtitle : (banners[currentIndex].subtitleEn || banners[currentIndex].subtitle)}
          </p>
        </motion.div>
      </div>
      
      <div className={`absolute bottom-6 ${dir === 'rtl' ? 'left-6' : 'right-6'} flex gap-1.5`}>
        {banners.map((_, idx) => (
          <div 
            key={idx} 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
