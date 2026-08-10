import { apiGet } from './client';
import type { ApiProduct, ApiPagination, FavoriteToggleApiResponse, ProductDetailsApiResponse } from './types';
import { BASE_URL } from './config';

export interface PaginatedProductsData {
  products: ApiProduct[];
  pagination: ApiPagination;
}

export interface PaginatedProductsResponse {
  key: string;
  msg: string;
  code: number;
  data: PaginatedProductsData;
}

export async function fetchProductsList(
  type: 'featured-products' | 'latest-offers' | 'most-ordered',
  page = 1,
  language = 'ar',
  search?: string
): Promise<PaginatedProductsData> {
  let path = `/user/${type}?page=${page}`;
  if (search) {
    path += `&search=${encodeURIComponent(search)}`;
  }
  const res = await apiGet<PaginatedProductsResponse>(path, { language });
  return res.data;
}

export async function fetchCategoryProducts(
  categoryId: number | null,
  page = 1,
  brandId: number | null = null,
  language = 'ar',
  search?: string
): Promise<PaginatedProductsData> {
  let path = `/user/products?page=${page}`;
  if (categoryId !== null && categoryId !== undefined) {
    path += `&category_id=${categoryId}`;
  }
  if (brandId !== null && brandId !== undefined) {
    path += `&brand_id=${brandId}`;
  }
  if (search) {
    path += `&search=${encodeURIComponent(search)}`;
  }
  const res = await apiGet<PaginatedProductsResponse>(path, { language });
  return res.data;
}

export async function fetchFavoritesApi(
  page = 1,
  language = 'ar'
): Promise<PaginatedProductsResponse> {
  return apiGet<PaginatedProductsResponse>(`/user/favorites?page=${page}`, { language });
}

export async function toggleFavoriteApi(
  productId: string | number,
  language = 'ar'
): Promise<FavoriteToggleApiResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;

  const formData = new FormData();
  formData.append('product_id', String(productId));

  const res = await fetch(`${BASE_URL}/user/favorites/toggle`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': language,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle favorite: ${res.status}`);
  }

  return res.json() as Promise<FavoriteToggleApiResponse>;
}

export async function fetchProductDetails(
  productId: string | number,
  language = 'ar'
): Promise<ProductDetailsApiResponse> {
  return apiGet<ProductDetailsApiResponse>(`/user/products/${productId}/details`, { language });
}



