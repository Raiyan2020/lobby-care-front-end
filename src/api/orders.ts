import { OrdersListApiResponse, OrderDetailApiResponse } from './types';
import { BASE_URL } from './config';

function getAuthHeaders(language = 'ar'): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;
  return {
    Accept: 'application/json',
    'Accept-Language': language,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchOrdersList(
  page = 1,
  language = 'ar'
): Promise<OrdersListApiResponse> {
  const res = await fetch(`${BASE_URL}/user/orders?page=${page}`, {
    method: 'GET',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function fetchOrderDetail(
  orderId: number | string,
  language = 'ar'
): Promise<OrderDetailApiResponse> {
  const res = await fetch(`${BASE_URL}/user/orders/${orderId}`, {
    method: 'GET',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}
