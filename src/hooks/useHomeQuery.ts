'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchHome } from '../api/home';
import { useLanguage } from '../contexts/LanguageContext';
import type { HomeData } from '../api/types';

const EMPTY_HOME: HomeData = {
  banners: [],
  categories: [],
  featured_products: [],
  latest_offers: [],
  most_ordered: [],
  brands: [],
};

export function useHomeQuery(initialData?: HomeData) {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['home', language],
    queryFn: () => fetchHome(language),
    initialData: language === 'ar' ? initialData : undefined,
    staleTime: 1000 * 60 * 5,
  });

  return {
    data: query.data ?? EMPTY_HOME,
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
