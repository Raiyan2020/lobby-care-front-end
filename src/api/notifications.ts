import { NotificationsListApiResponse, NotificationToggleResponse } from './types';
import { BASE_URL } from './config';

function getAuthHeaders(language = 'ar'): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;
  return {
    Accept: 'application/json',
    'Accept-Language': language,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchNotificationsList(
  page = 1,
  language = 'ar'
): Promise<NotificationsListApiResponse> {
  const res = await fetch(`${BASE_URL}/general/notifications?page=${page}`, {
    method: 'GET',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function markNotificationsAsRead(
  language = 'ar'
): Promise<{ key: string; msg: string; code: number }> {
  const res = await fetch(`${BASE_URL}/general/notifications/read`, {
    method: 'POST',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function deleteNotificationApi(
  id: string,
  language = 'ar'
): Promise<{ key: string; msg: string; code: number }> {
  const res = await fetch(`${BASE_URL}/general/notifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function clearAllNotificationsApi(
  language = 'ar'
): Promise<{ key: string; msg: string; code: number }> {
  const res = await fetch(`${BASE_URL}/general/notifications/clear-all`, {
    method: 'DELETE',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function toggleNotificationStatusApi(
  language = 'ar'
): Promise<NotificationToggleResponse> {
  const res = await fetch(`${BASE_URL}/general/notifications/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}
