'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchFavoritesApi } from '../api/products';
import type { PaginatedProductsResponse } from '../api/products';
import { useLanguage } from '../contexts/LanguageContext';

export const FAVORITES_QUERY_KEY = ['favorites'];

export function useFavoritesQuery(page = 1) {
  const { language } = useLanguage();
  const isLoggedIn =
    typeof window !== 'undefined' && !!localStorage.getItem('api_token');

  const query = useQuery<PaginatedProductsResponse>({
    queryKey: [...FAVORITES_QUERY_KEY, page, language],
    queryFn: () => fetchFavoritesApi(page, language),
    enabled: isLoggedIn,
    staleTime: 1000 * 60, // Cache for 1 minute
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading && !query.data,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useInvalidateFavorites() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: FAVORITES_QUERY_KEY });
}
