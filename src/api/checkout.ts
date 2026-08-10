import { CheckoutApiResponse } from './types';
import { BASE_URL } from './config';

function getAuthHeaders(): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * POST /user/checkout
 *
 * `discountCode` is optional — omitting it (or passing null) checks out without
 * a discount. This is where the code is actually reserved, so a code that
 * previewed fine can still be rejected here (422 on `discount_code`); read it
 * with `getFieldError(response, 'discount_code')`.
 */
export async function checkoutApi(
  addressId: number | string,
  paymentMethodId: number | string,
  idempotencyKey: string,
  discountCode?: string | null
): Promise<CheckoutApiResponse> {
  const formData = new FormData();
  formData.append('address_id', String(addressId));
  formData.append('payment_method_id', String(paymentMethodId));
  formData.append('idempotency_key', idempotencyKey);
  formData.append('terms_accepted', '1');

  const trimmedCode = discountCode?.trim();
  if (trimmedCode) {
    formData.append('discount_code', trimmedCode);
  }

  const res = await fetch(`${BASE_URL}/user/checkout`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  // Backend will return standard JSON response for both success (200) and client errors (400/422/etc.)
  const json: CheckoutApiResponse = await res.json();
  return json;
}
