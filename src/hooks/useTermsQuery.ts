'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchTerms } from '../api/general';
import { useLanguage } from '../contexts/LanguageContext';

export function useTermsQuery() {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['terms', language],
    queryFn: () => fetchTerms(language),
  });

  return {
    terms: query.data?.terms ?? '',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
