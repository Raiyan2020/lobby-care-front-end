'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchPrivacy } from '../api/general';
import { useLanguage } from '../contexts/LanguageContext';

export function usePrivacyQuery() {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['privacy', language],
    queryFn: () => fetchPrivacy(language),
  });

  return {
    privacy: query.data?.privacy ?? '',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
