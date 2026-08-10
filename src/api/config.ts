// ─── API Configuration ──────────────────────────────────────────────────────────

const rawBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export const BASE_URL: string = rawBaseUrl.trim();

export type HomeLayoutName =
  | 'Home1' | 'Home2' | 'Home3' | 'Home4' | 'Home5' | 'Home6' | 'Home7'
  | 'LobbyCare';

export const getHomeLayoutByBaseUrl = (url: string): HomeLayoutName => {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('lobby-care') || lowerUrl.includes('lobbycare')) return 'LobbyCare';
  if (lowerUrl.includes('abaya')) return 'Home2';
  if (lowerUrl.includes('4gear')) return 'Home3';
  if (lowerUrl.includes('elasal')) return 'Home4';
  if (lowerUrl.includes('rathath')) return 'Home1';
  if (lowerUrl.includes('fresh')) return 'Home5';
  return 'LobbyCare';
};

/** True when this deployment is the LOBBY CARE storefront. */
export const IS_LOBBY_CARE = getHomeLayoutByBaseUrl(BASE_URL) === 'LobbyCare';

export const DEFAULT_HOME_LAYOUT = getHomeLayoutByBaseUrl(BASE_URL);
