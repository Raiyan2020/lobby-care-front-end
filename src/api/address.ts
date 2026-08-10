import { BASE_URL } from './config';


export interface BackendAddress {
  id: number;
  title: string;
  lat: number;
  lng: number;
  map_desc: string;
  notes: string;
  created_at: string;
}

export interface BackendAddressResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: {
    addresses: BackendAddress[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface AddAddressResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: BackendAddress;
}

function getAuthHeaders(language = 'ar'): HeadersInit {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('api_token') : null;
  return {
    Accept: 'application/json',
    'Accept-Language': language,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchAddressesApi(language = 'ar'): Promise<BackendAddressResponse> {
  const res = await fetch(`${BASE_URL}/user/addresses`, {
    method: 'GET',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function addAddressApi(
  params: { title: string; lat: number; lng: number; map_desc: string; notes: string },
  language = 'ar'
): Promise<AddAddressResponse> {
  const formData = new FormData();
  formData.append('title', params.title);
  formData.append('lat', String(params.lat));
  formData.append('lng', String(params.lng));
  formData.append('map_desc', params.map_desc);
  formData.append('notes', params.notes);

  const res = await fetch(`${BASE_URL}/user/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(language),
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function updateAddressApi(
  id: number | string,
  params: { title: string; lat: number; lng: number; map_desc: string; notes: string },
  language = 'ar'
): Promise<AddAddressResponse> {
  const formData = new FormData();
  formData.append('title', params.title);
  formData.append('lat', String(params.lat));
  formData.append('lng', String(params.lng));
  formData.append('map_desc', params.map_desc);
  formData.append('notes', params.notes);

  const res = await fetch(`${BASE_URL}/user/addresses/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(language),
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}

export async function deleteAddressApi(
  id: number | string,
  language = 'ar'
): Promise<any> {
  const res = await fetch(`${BASE_URL}/user/addresses/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(language),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}
