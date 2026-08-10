import type { StaticImageData } from 'next/image';

export type ViewState = 'SPLASH' | 'HOME' | 'CATEGORIES' | 'OFFERS' | 'ACCOUNT' | 'CART' | 'FAVORITES';

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  variantId?: string;
  selectedOptionType?: 'size' | 'color' | null;
  selectedOptionLabelAr?: string;
  selectedOptionLabelEn?: string;
  selectedOptionValueAr?: string;
  selectedOptionValueEn?: string;
}

export interface ProductOption {
  id: string;
  nameAr: string;
  nameEn: string;
  extraPrice: number;
  stock: number;
  sku?: string;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku?: string;
  price?: number;
  costPrice?: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  originalPrice?: number;
  costPrice?: number;
  image: string | StaticImageData;
  badge?: string;
  rating?: number;
  reviews?: number;
  shortDescription?: string;
  descriptionEn?: string;
  images?: string[];
  type?: string;
  origin?: string;
  quality?: string;
  condition?: string;
  suitableFor?: string;
  deliveryTime?: string;
  specifications?: { key: string; value: string }[];
  sizes?: string[]; // Deprecated
  colors?: string[]; // Deprecated
  variants?: ProductVariant[]; // Deprecated
  
  optionType?: 'none' | 'size' | 'color';
  productOptions?: ProductOption[];
}

export interface AddressObject {
  id: string;
  name: string;
  governorate?: string;
  area?: string;
  block?: string;
  house?: string;
  details: string;
}

export interface Banner {
  id: string;
  image: string | StaticImageData;
  title: string;
  subtitle: string;
  titleEn?: string;
  subtitleEn?: string;
}

