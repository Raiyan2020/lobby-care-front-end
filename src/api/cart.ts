// ─── Cart API ─────────────────────────────────────────────────────────────────

import { BASE_URL } from './config';
import type { ApiDiscount } from './types';

export interface CartApiResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    /** Array when empty, keyed object when a field failed (e.g. `discount_code`). */
    validation_errors: string[] | Record<string, string[]>;
  };
  data: CartData | null;
}

export interface CartData {
  items: CartItem[];
  summary: CartSummary;
}

export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    image: string;
    price: number;
    old_price: number | null;
    discount_percentage: number | null;
  };
  quantity: number;
  selected_attributes: CartAttribute[];
  unit_price: number;
  line_total: number;
}

export interface CartAttribute {
  product_attribute_id: number;
  attribute_id: number;
  attribute_name: string;
  product_attribute_value_id: number;
  attribute_value_id: number;
  value_name: string;
  price: number;
}

export interface ExpectedDelivery {
  from: string;
  to: string;
  label: string;
}

export interface CartSummary {
  items_count: number;
  total_quantity: number;
  subtotal: number;
  delivery_fee: number;
  /** Always present. `code: null` / `value: 0` when no code is applied. */
  discount: ApiDiscount;
  /** subtotal + delivery_fee − discount.value, floored at 0. */
  total: number;
  expected_delivery?: ExpectedDelivery;
}

function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;
  return {
    Accept: 'application/json',
    "Accept-Language": "ar",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * POST /user/cart — Add a product to the server cart.
 * Returns the parsed CartApiResponse (including 401 responses without throwing).
 */
export async function addToCartApi(
  productId: number,
  quantity = 1,
  attributeValueIds?: number[]
): Promise<CartApiResponse> {
  const formData = new FormData();
  formData.append('product_id', String(productId));
  formData.append('quantity', String(quantity));

  if (attributeValueIds && attributeValueIds.length > 0) {
    attributeValueIds.forEach((id) => {
      formData.append('attribute_value_ids[]', String(id));
    });
  }

  const headers = getAuthHeaders();

  const res = await fetch(`${BASE_URL}/user/cart`, {
    method: 'POST',
    headers,
    body: formData,
  });

  // Parse JSON regardless of status (401 still returns a JSON body)
  const json: CartApiResponse = await res.json();
  return json;
}

/**
 * GET /user/cart — Fetch current cart.
 */
export async function fetchCart(): Promise<CartApiResponse> {
  const headers = getAuthHeaders();

  const res = await fetch(`${BASE_URL}/user/cart`, {
    method: 'GET',
    headers: { ...headers, 'Content-Type': 'application/json' },
  });

  const json: CartApiResponse = await res.json();
  return json;
}

/**
 * POST /user/cart/{cartItemId} — Update quantity of an item in the cart.
 */
export async function updateCartItemApi(
  cartItemId: string | number,
  quantity: number
): Promise<any> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;
  const formData = new FormData();
  formData.append('quantity', String(quantity));

  const res = await fetch(`${BASE_URL}/user/cart/${cartItemId}`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Failed to update cart item quantity: ${res.status}`);
  }

  return res.json();
}

/**
 * DELETE /user/cart/{cartItemId} — Remove an item from the cart.
 */
export async function removeCartItemApi(
  cartItemId: string | number
): Promise<any> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;

  const res = await fetch(`${BASE_URL}/user/cart/${cartItemId}`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to remove cart item: ${res.status}`);
  }

  return res.json();
}

/**
 * POST /user/cart/discount-code/preview — Validate a discount code against the
 * current cart and return the cart with the discount applied to `summary`.
 *
 * Preview does NOT reserve a slot on the code (`used_count` is unchanged) and
 * the code is NOT persisted on the cart — hold it in client state and resend it
 * with `POST /user/checkout`. Re-run the preview after any cart mutation.
 *
 * A rejected code comes back as 422 with the reason at
 * `response_status.validation_errors.discount_code[0]`.
 */
export async function previewDiscountCodeApi(discountCode: string): Promise<CartApiResponse> {
  const res = await fetch(`${BASE_URL}/user/cart/discount-code/preview`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ discount_code: discountCode }),
  });

  // 422 carries the rejection reason in its body — parse regardless of status.
  const json: CartApiResponse = await res.json();
  return json;
}

/**
 * Pull the first validation message for a field out of a response.
 * Returns null when the field has no error (or errors came back as an array).
 */
export function getFieldError(
  response: { response_status?: { validation_errors?: string[] | Record<string, string[]> } },
  field: string,
): string | null {
  const errors = response.response_status?.validation_errors;
  if (!errors || Array.isArray(errors)) return null;
  return errors[field]?.[0] ?? null;
}

/**
 * DELETE /user/cart/clear — Clear all items in the cart.
 */
export async function clearCartApi(): Promise<any> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;

  const res = await fetch(`${BASE_URL}/user/cart/clear`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to clear cart: ${res.status}`);
  }

  return res.json();
}
