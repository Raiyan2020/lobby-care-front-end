import { apiGet } from './client';
import type { HomeApiResponse, HomeData } from './types';

export async function fetchHome(language = 'ar'): Promise<HomeData> {
  const res = await apiGet<HomeApiResponse>('/general/home', { language });
  return res.data;
}
