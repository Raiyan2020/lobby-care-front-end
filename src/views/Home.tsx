'use client';
import { useState, useEffect } from 'react';
import { useStore } from '../contexts/StoreContext';
import { DEFAULT_HOME_LAYOUT } from '../api/config';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from '../lib/navigation';
import { useHomeQuery } from '../hooks/useHomeQuery';
import type { HomeData } from '../api/types';
import { Home1Layout } from '../components/Home1Layout';
import { Home2Layout } from '../components/Home2Layout';
import { Home3Layout } from '../components/Home3Layout';
import { Home4Layout } from '../components/Home4Layout';
import { Home5Layout } from '../components/Home5Layout';
import { Home6Layout } from '../components/Home6Layout';
import { Home7Layout } from '../components/Home7Layout';
import { LobbyCareHomeLayout } from '../components/LobbyCareHomeLayout';

interface HomeProps {
  initialHomeData?: HomeData;
}

export function Home({ initialHomeData }: HomeProps) {
  const { settings } = useStore();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [previewLayout, setPreviewLayout] = useState<string | null>(
    sessionStorage.getItem('temporaryHomeLayoutPreview')
  );

  useEffect(() => {
    const handleLayoutChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setPreviewLayout(customEvent.detail);
    };
    window.addEventListener('layoutPreviewChange', handleLayoutChange);
    return () => window.removeEventListener('layoutPreviewChange', handleLayoutChange);
  }, []);

  const currentLayout = previewLayout || settings.homeLayout || DEFAULT_HOME_LAYOUT;

  // ── Fetch home data from API ──
  const { data, isLoading } = useHomeQuery(initialHomeData);

  const layoutProps = {
    banners: data.banners,
    categories: data.categories,
    brands: data.brands || [],
    featuredProducts: data.featured_products,
    latestOffers: data.latest_offers,
    mostOrdered: data.most_ordered,
    isLoading,
    navigate,
    language,
  };

  return (
    <div
      className={`flex-1 flex flex-col ${['Home2', 'Home3', 'Home4', 'Home5', 'Home6', 'Home7', 'LobbyCare'].includes(currentLayout) ? 'pt-0' : 'pt-4'
        } selection:bg-neutral-900 selection:text-white`}
    >
      {currentLayout === 'LobbyCare' ? (
        <LobbyCareHomeLayout {...layoutProps} />
      ) : currentLayout === 'Home1' ? (
        <Home1Layout {...layoutProps} />
      ) : currentLayout === 'Home2' ? (
        <Home2Layout {...layoutProps} />
      ) : currentLayout === 'Home3' ? (
        <Home3Layout {...layoutProps} />
      ) : currentLayout === 'Home4' ? (
        <Home4Layout {...layoutProps} />
      ) : currentLayout === 'Home5' ? (
        <Home5Layout {...layoutProps} />
      ) : currentLayout === 'Home6' ? (
        <Home6Layout {...layoutProps} />
      ) : currentLayout === 'Home7' ? (
        <Home7Layout {...layoutProps} />
      ) : (
        <LobbyCareHomeLayout {...layoutProps} />
      )}
    </div>
  );
}
