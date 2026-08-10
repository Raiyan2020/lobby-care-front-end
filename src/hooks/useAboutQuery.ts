'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchAbout } from '../api/general';
import { useLanguage } from '../contexts/LanguageContext';

export function useAboutQuery() {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['about', language],
    queryFn: () => fetchAbout(language),
  });

  return {
    about: query.data?.about ?? '',
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
