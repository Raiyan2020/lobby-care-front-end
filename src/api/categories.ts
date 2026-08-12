import { apiGet } from './client';
import type { CategoriesApiResponse, CategoriesData } from './types';

export async function fetchCategories(page = 1, language = 'ar'): Promise<CategoriesData> {
  const res = await apiGet<CategoriesApiResponse>(`/general/categories?page=${page}&per_page=100`, { language });
  return res.data;
}
