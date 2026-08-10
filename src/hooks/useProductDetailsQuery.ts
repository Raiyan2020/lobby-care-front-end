'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchProductDetails } from '../api/products';
import { useLanguage } from '../contexts/LanguageContext';

export function useProductDetailsQuery(productId: string | number | null | undefined) {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['product-details', productId, language],
    queryFn: () => fetchProductDetails(productId!, language),
    enabled: !!productId,
  });

  return {
    productDetail: query.data?.data?.product ?? null,
    similarProducts: query.data?.data?.similar_products ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
