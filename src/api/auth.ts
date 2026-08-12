// ─── Authentication API ─────────────────────────────────────────────────────────

import { BASE_URL } from './config';

export interface Country {
  code: string;
  iso: string;
  name: string;
  phone_start: string;
  phone_length: number;
}

export interface CountriesResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: Country[];
}

export interface LoginUserData {
  id: number;
  name: string;
  phone: string;
  country_code: string;
  image: string;
  is_active: boolean;
  is_blocked: boolean;
  is_notifiable: boolean;
  lang: string;
  token: string;
}

export interface LoginResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[] | Record<string, string[]>;
  };
  data?: LoginUserData | { country_code: string; phone: string } | null;
}

export function getApiErrorText(response: {
  msg?: string;
  response_status?: {
    error?: boolean;
    validation_errors?: string[] | Record<string, string[]>;
  };
} | null | undefined): string {
  if (!response) return '';
  const errors = response.response_status?.validation_errors;
  if (errors) {
    if (Array.isArray(errors)) {
      return errors.join(' ');
    }
    return Object.values(errors).flat().join(' ');
  }
  return response.msg || '';
}

interface LoginParams {
  country_code: string;
  phone: string;
}

/**
 * GET /general/countries — Fetch available countries metadata
 */
export async function fetchCountries(lang = 'ar'): Promise<CountriesResponse> {
  const res = await fetch(`${BASE_URL}/general/countries`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch countries: ${res.status}`);
  }

  return res.json() as Promise<CountriesResponse>;
}

/**
 * POST /user/login — Phone-only: looks up the account and sends a WhatsApp
 * OTP. Does not authenticate by itself; follow up with verifyCodeApi.
 */
export async function loginApi(params: LoginParams, lang = 'ar'): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);

  const res = await fetch(`${BASE_URL}/user/login`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
    body: formData,
  });

  // Since some error states might return 401/422 but still contain valid JSON error messages:
  return res.json() as Promise<LoginResponse>;
}

export interface RegisterParams {
  name: string;
  country_code: string;
  phone: string;
}

export interface RegisterResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data?: {
    id: number;
    name: string;
    phone: string;
    country_code: string;
    image: string;
    is_active: boolean;
    is_blocked: boolean;
    is_notifiable: boolean;
    lang: string;
    token: string | null;
  };
}

export interface VerifyCodeParams {
  country_code: string;
  phone: string;
  code: string;
  type: 'register' | 'login';
  device_id?: string;
  device_type?: 'web';
}

export interface ResendCodeParams {
  country_code: string;
  phone: string;
  type: 'register' | 'login';
}

export interface ResendCodeResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data?: {
    country_code: string;
    phone: string;
    type: string;
  };
}

/**
 * POST /user/register — Register a new phone number. Creates the account as
 * inactive and sends a WhatsApp OTP; the account only becomes active once
 * verifyCodeApi succeeds.
 */
export async function registerApi(params: RegisterParams, lang = 'ar'): Promise<RegisterResponse> {
  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);

  const res = await fetch(`${BASE_URL}/user/register`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
    body: formData,
  });

  return res.json() as Promise<RegisterResponse>;
}

/**
 * POST /user/verify-code — Verify the WhatsApp OTP for either the register
 * or login flow. On success returns a token and authenticates the user.
 */
export async function verifyCodeApi(params: VerifyCodeParams, lang = 'ar'): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);
  formData.append('code', params.code);
  formData.append('type', params.type);
  if (params.device_id) formData.append('device_id', params.device_id);
  if (params.device_type) formData.append('device_type', params.device_type);

  const res = await fetch(`${BASE_URL}/user/verify-code`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
    body: formData,
  });

  return res.json() as Promise<LoginResponse>;
}

/**
 * POST /user/resend-code — Resend the WhatsApp OTP. Invalidates any
 * previously issued code for this phone.
 */
export async function resendCodeApi(params: ResendCodeParams, lang = 'ar'): Promise<ResendCodeResponse> {
  const formData = new FormData();
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);
  formData.append('type', params.type);

  const res = await fetch(`${BASE_URL}/user/resend-code`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
    body: formData,
  });

  return res.json() as Promise<ResendCodeResponse>;
}

/**
 * POST /user/logout — Log out user and invalidate token
 */
export async function logoutApi(
  deviceId: string,
  lang = 'ar'
): Promise<{ key: string; msg: string; code: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;
  const formData = new FormData();
  formData.append('device_id', deviceId);

  const res = await fetch(
    `${BASE_URL}/user/logout`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    }
  );

  return res.json();
}

/**
 * DELETE /user/delete-account — Delete user account
 */
export async function deleteAccountApi(
  lang = 'ar'
): Promise<{ key: string; msg: string; code: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;

  const res = await fetch(
    `${BASE_URL}/user/delete-account`,
    {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Accept-Language': lang,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );

  return res.json();
}

export interface CheckPhoneResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[] | Record<string, string[]>;
  };
  data: { exists: boolean } | null;
}

/**
 * POST /user/check-phone-exists — Check whether an active account already
 * exists for this phone number. Always resolves with `data.exists`, even
 * for unknown numbers — it never validation-errors on a new phone.
 */
export async function checkPhoneExistsApi(
  params: { country_code: string; phone: string },
  lang = 'ar'
): Promise<CheckPhoneResponse> {
  const formData = new FormData();
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);

  const res = await fetch(`${BASE_URL}/user/check-phone-exists`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
    body: formData,
  });

  return res.json() as Promise<CheckPhoneResponse>;
}
