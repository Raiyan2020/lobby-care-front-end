'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchProductsList } from '../api/products';
import { useLanguage } from '../contexts/LanguageContext';

export function useProductsListQuery(
  type: 'featured-products' | 'latest-offers' | 'most-ordered',
  page = 1,
  search?: string
) {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['products-list', type, language, page, search],
    queryFn: () => fetchProductsList(type, page, language, search),
    enabled: !!type,
  });

  return {
    products: query.data?.products ?? [],
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
