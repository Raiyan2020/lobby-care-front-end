import { isSafeInternalPath } from './internalPath';

// ─── Cookie helpers ──────────────────────────────────────────────────────────
// The Edge middleware reads `auth_token` cookie to decide auth state.
// These helpers keep the cookie in sync with localStorage.

/** Write the auth token into a browser cookie (client-side only). */
function setAuthCookie(token: string) {
  if (typeof document === 'undefined') return;
  // Max-Age: 30 days; SameSite=Strict prevents CSRF; Path=/ ensures global access.
  document.cookie = `auth_token=${encodeURIComponent(token)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Strict`;
}

/** Remove the auth token cookie (client-side only). */
function deleteAuthCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'auth_token=; Path=/; Max-Age=0; SameSite=Strict';
}

/**
 * Sync an existing localStorage api_token into the cookie.
 * Call this once on app mount for returning users whose session
 * predates the middleware cookie requirement.
 */
export function syncAuthCookieFromStorage() {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('api_token');
  if (token) {
    setAuthCookie(token);
  } else {
    deleteAuthCookie();
  }
}

// ─────────────────────────────────────────────────────────────────────────────

export interface UserSession {
  id?: number;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber: string; // for compatibility
  country_code?: string;
  image?: string;
  is_active?: boolean;
  is_blocked?: boolean;
  is_notifiable?: boolean;
  lang?: string;
  token?: string;
  isLoggedIn: boolean;
  createdAt: string;
}

/**
 * Generates a random alphanumeric string of 20 characters and stores it in localStorage.
 * If it already exists, retrieves and returns it.
 */
export function getOrGenerateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 20; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    deviceId = result;
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

/**
 * Returns the current user session from localStorage, if valid.
 */
export const getSession = (): UserSession | null => {
  const sessionStr = localStorage.getItem('user_session');
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    if (session && session.isLoggedIn && (session.phone || session.phoneNumber)) {
      // Return valid session
      return session;
    }
  } catch (e) {
    localStorage.removeItem('user_session');
  }
  return null;
};

/**
 * Saves a new user session to localStorage.
 */
export const startSession = (userData: Partial<UserSession> & { phone?: string; phoneNumber?: string }): UserSession => {
  const phoneVal = userData.phone || userData.phoneNumber || '';
  const session: UserSession = {
    ...userData,
    phoneNumber: phoneVal,
    isLoggedIn: true,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem('user_session', JSON.stringify(session));
  if (userData.token) {
    localStorage.setItem('api_token', userData.token);
    // Sync to cookie so the Edge middleware can guard protected routes
    setAuthCookie(userData.token);
  }
  return session;
};

/**
 * Resolves where to send the user after a successful sign-in / verification.
 *
 * Two mechanisms feed this and they previously did not talk to each other:
 *  1. `?redirect=` — set by the auth middleware when it intercepts a protected
 *     route, and forwarded through /welcome → /login | /register.
 *  2. `auth_redirect` in localStorage — set by Cart and Checkout before they
 *     send a guest off to authenticate.
 *
 * The query parameter wins because it reflects the destination the user asked
 * for most recently. Consumed values are cleared so a stale localStorage entry
 * cannot hijack a later sign-in.
 *
 * Only same-origin absolute paths are accepted; anything else (protocol-relative
 * "//evil.com", absolute URLs, or a missing leading slash) falls back to "/" so
 * a crafted link cannot turn sign-in into an open redirect.
 */
export const resolvePostAuthRedirect = (): string => {
  let fromQuery: string | null = null;
  if (typeof window !== 'undefined') {
    fromQuery = new URLSearchParams(window.location.search).get('redirect');
  }

  const fromStorage =
    typeof localStorage !== 'undefined' ? localStorage.getItem('auth_redirect') : null;

  // Always clear the stored value, whichever source ends up being used.
  if (typeof localStorage !== 'undefined') localStorage.removeItem('auth_redirect');

  if (isSafeInternalPath(fromQuery)) return fromQuery;
  if (isSafeInternalPath(fromStorage)) return fromStorage;
  return '/';
};

/**
 * Carries the pending `?redirect=` across a navigation that drops the query
 * string — notably login/register → /verify, where the OTP step is a fresh URL.
 * Stores it under the same key Cart/Checkout use, so resolvePostAuthRedirect
 * picks it up on the other side.
 */
export const persistPostAuthRedirect = (): void => {
  if (typeof window === 'undefined') return;
  const target = new URLSearchParams(window.location.search).get('redirect');
  if (isSafeInternalPath(target)) {
    localStorage.setItem('auth_redirect', target);
  }
};

/**
 * Removes the session and token from localStorage (Logout).
 */
export const clearSession = () => {
  localStorage.removeItem('user_session');
  localStorage.removeItem('api_token');
  // Remove cookie so middleware immediately denies access
  deleteAuthCookie();
};

/**
 * Clears session, custom addresses, points, and orders from localStorage (Delete Account).
 */
export const deleteAccountData = () => {
  localStorage.removeItem('user_session');
  localStorage.removeItem('user_addresses');
  localStorage.removeItem('user_orders');
  localStorage.removeItem('user_points_history');
};

/**
 * Simulates OTP verification, ready to be linked to a real SMS API (e.g. Twilio or Firebase).
 */
export const verifySMSCode = async (phoneNumber: string, verificationCode: string): Promise<boolean> => {
  // Real integration placeholder:
  // const response = await fetch('/api/verify-otp', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phoneNumber, code: verificationCode })
  // });
  // return response.ok;

  // Demo implementation: Any 4-digit code is accepted, with a recommendation for "1234"
  return /^\d{4}$/.test(verificationCode);
};
