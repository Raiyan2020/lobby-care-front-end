'use client';
import { useQuery } from '@tanstack/react-query';
import { fetchCategoryProducts } from '../api/products';
import { useLanguage } from '../contexts/LanguageContext';

export function useCategoryProductsQuery(
  categoryId: number | null,
  page = 1,
  brandId: number | null = null,
  search?: string
) {
  const { language } = useLanguage();

  const query = useQuery({
    queryKey: ['category-products', categoryId, brandId, language, page, search],
    queryFn: () => fetchCategoryProducts(categoryId, page, brandId, language, search),
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
