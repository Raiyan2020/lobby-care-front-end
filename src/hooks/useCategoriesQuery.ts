'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '../api/categories';
import { useLanguage } from '../contexts/LanguageContext';

export function useCategoriesQuery(page = 1) {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['categories', language, page],
    queryFn: () => fetchCategories(page, language),
  });

  return {
    categories: query.data?.categories ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
