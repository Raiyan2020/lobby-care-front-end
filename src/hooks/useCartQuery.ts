'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCart } from '../api/cart';
import type { CartData } from '../api/cart';
import { EMPTY_DISCOUNT } from '../api/types';

export const CART_QUERY_KEY = ['user-cart'];

const EMPTY_CART: CartData = {
  items: [],
  summary: {
    items_count: 0,
    total_quantity: 0,
    subtotal: 0,
    delivery_fee: 0,
    discount: EMPTY_DISCOUNT,
    total: 0,
  },
};

/**
 * React Query hook for fetching the server-side cart.
 * Only runs when the user has an api_token in localStorage.
 */
export function useCartQuery() {
  const isLoggedIn =
    typeof localStorage !== 'undefined' && !!localStorage.getItem('api_token');

  const query = useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await fetchCart();
      if (res.code === 401 || res.key === 'unauthenticated') return EMPTY_CART;
      return res.data ?? EMPTY_CART;
    },
    enabled: isLoggedIn,
    staleTime: 0, // always re-fetch after mutations
  });

  return {
    cartData: query.data ?? EMPTY_CART,
    cartCount: query.data?.summary.total_quantity ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}

/**
 * Returns a function to imperatively invalidate (re-fetch) the cart query.
 */
export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
}
