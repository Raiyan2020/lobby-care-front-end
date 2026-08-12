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

const PRODUCTS_PER_PAGE = 30;

function buildProductsPath(
  page: number,
  categoryId: number | null,
  brandId: number | null,
  search?: string
): string {
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(PRODUCTS_PER_PAGE),
  });

  if (categoryId !== null && categoryId !== undefined) {
    params.set('category_id', String(categoryId));
  }
  if (brandId !== null && brandId !== undefined) {
    params.set('brand_id', String(brandId));
  }
  if (search) {
    params.set('search', search);
  }

  return `/user/products?${params.toString()}`;
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
  const fetchPage = (serverPage: number) => apiGet<PaginatedProductsResponse>(
    buildProductsPath(serverPage, categoryId, brandId, search),
    { language }
  );

  const initialResponse = await fetchPage(page);
  const initialData = initialResponse.data;
  const serverPerPage = Number(initialData.pagination.per_page);

  // Older API deployments always return 10 items even when per_page=30 is
  // requested. Combine the required server pages so the storefront still
  // presents a real 30-item page during a rolling frontend/backend deployment.
  if (!Number.isFinite(serverPerPage) || serverPerPage <= 0 || serverPerPage === PRODUCTS_PER_PAGE) {
    return initialData;
  }

  const total = initialData.pagination.total;
  const startIndex = (page - 1) * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, total);
  const firstServerPage = Math.floor(startIndex / serverPerPage) + 1;
  const lastServerPage = Math.ceil(endIndex / serverPerPage);
  const serverPages = Array.from(
    { length: Math.max(0, lastServerPage - firstServerPage + 1) },
    (_, index) => firstServerPage + index
  );

  const pageResponses = await Promise.all(serverPages.map(serverPage => (
    serverPage === page ? Promise.resolve(initialResponse) : fetchPage(serverPage)
  )));
  const combinedProducts = pageResponses.flatMap(response => response.data.products);
  const sliceStart = startIndex - ((firstServerPage - 1) * serverPerPage);

  return {
    products: combinedProducts.slice(sliceStart, sliceStart + PRODUCTS_PER_PAGE),
    pagination: {
      current_page: page,
      last_page: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
      per_page: PRODUCTS_PER_PAGE,
      total,
    },
  };
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

