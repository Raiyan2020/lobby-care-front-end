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
  email: string;
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
  type: 'phone' | 'email';
  email?: string;
  country_code?: string;
  phone?: string;
  password?: string;
  device_id: string;
  device_type: 'web';
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
 * POST /user/login — Authenticate user with Form Data
 */
export async function loginApi(params: LoginParams, lang = 'ar'): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('type', params.type);

  if (params.type === 'email' && params.email) {
    formData.append('email', params.email);
  } else if (params.type === 'phone' && params.phone && params.country_code) {
    formData.append('phone', params.phone);
    formData.append('country_code', params.country_code);
  }

  if (params.password) {
    formData.append('password', params.password);
  }

  formData.append('device_id', params.device_id);
  formData.append('device_type', params.device_type);

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
  email: string;
  country_code: string;
  phone: string;
  password: string;
  password_confirmation: string;
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
    email: string;
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
  type: 'register' | 'forgot_password';
}

export interface ResendCodeParams {
  country_code: string;
  phone: string;
  type: 'register' | 'forgot_password';
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
 * POST /user/register — Register a new user
 */
export async function registerApi(params: RegisterParams, lang = 'ar'): Promise<RegisterResponse> {
  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('email', params.email);
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);
  formData.append('password', params.password);
  formData.append('password_confirmation', params.password_confirmation);

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
 * POST /user/verify-code — Verify user's phone activation code
 */
export async function verifyCodeApi(params: VerifyCodeParams, lang = 'ar'): Promise<LoginResponse> {
  const formData = new FormData();
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);
  formData.append('code', params.code);
  formData.append('type', params.type);

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
 * POST /user/resend-code — Resend verification OTP code
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

// ─── Forgot Password Flow ────────────────────────────────────────────────────

export interface ForgotPasswordParams {
  country_code: string;
  phone: string;
}

export interface ForgotPasswordResponse {
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
  };
}

export interface ResetPasswordParams {
  country_code: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
}

/**
 * POST /user/forgot-password — Send OTP to phone for password reset
 */
export async function forgotPasswordApi(
  params: ForgotPasswordParams,
  lang = 'ar'
): Promise<ForgotPasswordResponse> {
  const formData = new FormData();
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);

  const res = await fetch(`${BASE_URL}/user/forgot-password`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
    body: formData,
  });

  return res.json() as Promise<ForgotPasswordResponse>;
}

/**
 * POST /user/reset-password — Set a new password after OTP verification
 */
export async function resetPasswordApi(
  params: ResetPasswordParams,
  lang = 'ar'
): Promise<ResetPasswordResponse> {
  const formData = new FormData();
  formData.append('country_code', params.country_code);
  formData.append('phone', params.phone);
  formData.append('password', params.password);
  formData.append('password_confirmation', params.password_confirmation);

  const res = await fetch(`${BASE_URL}/user/reset-password`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
    },
    body: formData,
  });

  return res.json() as Promise<ResetPasswordResponse>;
}

// ─── Change Password (authenticated) ─────────────────────────────────────────

export interface ChangePasswordParams {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: null;
}

/**
 * POST /user/change-password — Change password for authenticated user
 */
export async function changePasswordApi(
  params: ChangePasswordParams,
  lang = 'ar'
): Promise<ChangePasswordResponse> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;
  const formData = new FormData();
  formData.append('current_password', params.current_password);
  formData.append('password', params.password);
  formData.append('password_confirmation', params.password_confirmation);

  const res = await fetch(
    `${BASE_URL}/user/change-password`,
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

  return res.json() as Promise<ChangePasswordResponse>;
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
  data: boolean | null;
}

/**
 * POST /user/check-phone-exists — Check if user's phone exists
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

