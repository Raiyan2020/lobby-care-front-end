import { apiGet } from './client';
import type { PrivacyApiResponse, PrivacyData, TermsApiResponse, TermsData, AboutApiResponse, AboutData, ConfigApiResponse, ConfigData, ContactApiResponse, ContactData, PaymentMethodsApiResponse, PaymentMethod, BrandsApiResponse, BrandsData } from './types';

export async function fetchPrivacy(language = 'ar'): Promise<PrivacyData> {
  const res = await apiGet<PrivacyApiResponse>('/general/privacy', { language });
  return res.data;
}

export async function fetchTerms(language = 'ar'): Promise<TermsData> {
  const res = await apiGet<TermsApiResponse>('/general/terms', { language });
  return res.data;
}

export async function fetchAbout(language = 'ar'): Promise<AboutData> {
  const res = await apiGet<AboutApiResponse>('/general/about', { language });
  return res.data;
}

export async function fetchConfig(language = 'ar'): Promise<ConfigData> {
  const res = await apiGet<ConfigApiResponse>('/general/config', { language });
  return res.data;
}

export async function fetchContact(language = 'ar'): Promise<ContactData> {
  const res = await apiGet<ContactApiResponse>('/general/contact', { language });
  return res.data;
}

export async function fetchPaymentMethods(language = 'ar'): Promise<PaymentMethod[]> {
  const res = await apiGet<PaymentMethodsApiResponse>('/general/payment-methods', { language });
  return res.data?.payment_methods || [];
}

export async function fetchBrands(page = 1, language = 'ar'): Promise<BrandsData> {
  const res = await apiGet<BrandsApiResponse>(`/general/brands?page=${page}`, { language });
  return res.data;
}
