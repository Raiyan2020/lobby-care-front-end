'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchContact } from '../api/general';
import { useLanguage } from '../contexts/LanguageContext';
import type { ContactData } from '../api/types';

export function useContactQuery() {
  const { language } = useLanguage();

  const query = useQuery<ContactData>({
    queryKey: ['contact', language],
    queryFn: () => fetchContact(language),
  });

  return {
    contact: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
