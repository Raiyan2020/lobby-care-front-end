'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchBrands } from '../api/general';
import { useLanguage } from '../contexts/LanguageContext';

export function useBrandsQuery(page = 1) {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['brands', language, page],
    queryFn: () => fetchBrands(page, language),
  });

  return {
    brands: query.data?.brands ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
