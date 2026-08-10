import { apiGet } from './client';
import type { CategoriesApiResponse, CategoriesData } from './types';

export async function fetchCategories(page = 1, language = 'ar'): Promise<CategoriesData> {
  const res = await apiGet<CategoriesApiResponse>(`/general/categories?page=${page}`, { language });
  return res.data;
}
