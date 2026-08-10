'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAddressesApi } from '../api/address';
import { useLanguage } from '../contexts/LanguageContext';
import type { BackendAddressResponse } from '../api/address';

export const ADDRESSES_QUERY_KEY = ['user-addresses'];

export function useAddressesQuery() {
  const { language } = useLanguage();
  const isLoggedIn =
    typeof window !== 'undefined' && !!localStorage.getItem('api_token');

  const query = useQuery<BackendAddressResponse>({
    queryKey: [...ADDRESSES_QUERY_KEY, language],
    queryFn: () => fetchAddressesApi(language),
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

export function useInvalidateAddresses() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ADDRESSES_QUERY_KEY });
}
