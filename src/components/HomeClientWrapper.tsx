'use client';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Splash } from '../views/Splash';
import { Home } from '../views/Home';
import type { HomeData } from '../api/types';

interface HomeClientWrapperProps {
  initialHomeData?: HomeData;
  initialShowSplash?: boolean;
}

export function HomeClientWrapper({ initialHomeData, initialShowSplash = true }: HomeClientWrapperProps) {
  const [showSplash, setShowSplash] = useState(initialShowSplash);

  useEffect(() => {
    if (!initialShowSplash) return;

    // Set session cookie to ensure the splash screen is only shown once per session
    document.cookie = 'ez_shop_has_seen_splash=true; path=/; SameSite=Lax';

    const timer = setTimeout(() => setShowSplash(false), 800);
    return () => clearTimeout(timer);
  }, [initialShowSplash]);

  return (
    <div className="relative flex-1 flex flex-col w-full h-full min-h-screen">
      {/* Splash overlay on top of the rendered homepage */}
      <AnimatePresence>
        {showSplash && <Splash key="splash" />}
      </AnimatePresence>

      {/* Render Home page layout immediately in the DOM to start resource preloading */}
      <Home initialHomeData={initialHomeData} />
    </div>
  );
}
