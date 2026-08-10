// ─── API Response Types (from /general/home and /general/categories) ───────────

export interface ApiBanner {
  id: number;
  title: string | null;
  description: string | null;
  image: string | null;
}

export interface ApiCategory {
  id: number;
  name: string;
  image: string | null;
}

export interface ApiProduct {
  id: number;
  name: string;
  /** Null until the product has an uploaded image. */
  image: string | null;
  brand?: string | null;
  price: number;
  old_price: number | null;
  discount_percentage: number | null;
  is_featured: boolean;
  is_favorite: boolean;
  is_in_cart: boolean;
}

export interface ApiBrand {
  id: number;
  name: string;
  image: string | null;
}

export interface HomeData {
  banners: ApiBanner[];
  categories: ApiCategory[];
  featured_products: ApiProduct[];
  latest_offers: ApiProduct[];
  most_ordered: ApiProduct[];
  brands?: ApiBrand[];
}

export interface HomeApiResponse {
  key: string;
  msg: string;
  code: number;
  data: HomeData;
}

// ─── Discount codes ────────────────────────────────────────────────────────────
// Shared block returned on `cart.summary.discount` and `order.discount`.
// Always present; an unapplied code is `{ code: null, ..., value: 0 }`.

/** `subtotal` = discount off the products, `delivery` = off the delivery fee. */
export type DiscountAppliesTo = 'subtotal' | 'delivery';

/** `percentage` = percent off, `fixed` = flat amount. */
export type DiscountType = 'percentage' | 'fixed';

export interface ApiDiscount {
  code: string | null;
  applies_to: DiscountAppliesTo | null;
  type: DiscountType | null;
  /** Always null for fixed-amount codes — only render `(n%)` when non-null. */
  percentage: number | null;
  /** The actual amount subtracted from the total, in currency. */
  value: number;
}

/** Placeholder used when a response predates the discount block. */
export const EMPTY_DISCOUNT: ApiDiscount = {
  code: null,
  applies_to: null,
  type: null,
  percentage: null,
  value: 0,
};

export interface ApiPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CategoriesData {
  categories: ApiCategory[];
  pagination: ApiPagination;
}

export interface CategoriesApiResponse {
  key: string;
  msg: string;
  code: number;
  data: CategoriesData;
}

export interface BrandsData {
  brands: ApiBrand[];
  pagination: ApiPagination;
}

export interface BrandsApiResponse {
  key: string;
  msg: string;
  code: number;
  data: BrandsData;
}

export interface PrivacyData {
  privacy: string;
}

export interface PrivacyApiResponse {
  key: string;
  msg: string;
  code: number;
  data: PrivacyData;
}

export interface TermsData {
  terms: string;
}

export interface TermsApiResponse {
  key: string;
  msg: string;
  code: number;
  data: TermsData;
}

export interface AboutData {
  about: string;
}

export interface AboutApiResponse {
  key: string;
  msg: string;
  code: number;
  data: AboutData;
}

export interface LoyaltyPointsRule {
  dinars: number;
  points: number;
}

export interface ConfigData {
  name: string;
  description: string;
  logo: string;
  app_color_light: string;
  app_color_dark: string;
  loyalty_points: {
    earn: LoyaltyPointsRule;
    redeem: LoyaltyPointsRule;
  };
}

export interface ConfigApiResponse {
  key: string;
  msg: string;
  code: number;
  data: ConfigData;
}
export interface FavoriteToggleData {
  is_favorite: boolean;
}

export interface FavoriteToggleApiResponse {
  key: string;
  msg: string;
  code: number;
  data: FavoriteToggleData;
}

export interface ContactSocial {
  id: number;
  name: string;
  link: string;
  icon_class: string;
  icon: string | null;
}

export interface ContactData {
  contact_number: string;
  contact_mail: string;
  socials: ContactSocial[];
}

export interface ContactApiResponse {
  key: string;
  msg: string;
  code: number;
  data: ContactData;
}

export interface ProductImage {
  id: number;
  image: string;
  is_default: boolean;
}

export interface ProductAttributeValue {
  id: number;
  attribute_value_id: number;
  name: string;
  price: number;
  is_default?: boolean;
}

export interface ProductAttribute {
  id: number;
  attribute_id: number;
  name: string;
  is_required: boolean;
  values: ProductAttributeValue[];
}

export interface ProductDefaultAttribute {
  id: number;
  attribute_id: number;
  name: string;
  is_required: boolean;
  value: ProductAttributeValue;
}

export interface ProductDetail {
  id: number;
  name: string;
  description: string;
  images: ProductImage[];
  price: number;
  old_price: number | null;
  discount_percentage: number | null;
  is_featured: boolean;
  is_favorite: boolean;
  is_in_cart: boolean;
  default_attributes: ProductDefaultAttribute[];
  attributes: ProductAttribute[];
}

export interface ProductDetailsApiResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: {
    product: ProductDetail;
    similar_products: ApiProduct[];
  };
}

export interface PaymentMethod {
  id: number;
  driver: string;
  name: string;
  image: string | null;
}

export interface PaymentMethodsApiResponse {
  key: string;
  msg: string;
  code: number;
  response_status?: {
    error: boolean;
    validation_errors: string[];
  };
  data: {
    payment_methods: PaymentMethod[];
  };
}

export interface CheckoutApiResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    /** Keyed object on 422 — e.g. `{ discount_code: ['...'] }`. */
    validation_errors: string[] | Record<string, string[]>;
  };
  data: {
    id: number;
    payment_ref: string;
    idempotency_key: string;
    status: string;
    status_label: string;
    /** Amount charged, already net of any discount. */
    amount: number;
    driver: string;
    payment_method: PaymentMethod;
    /**
     * Null while a remote payment is pending; populated for COD / instant
     * success. Now also carries `discount: ApiDiscount` and a `total` that is
     * already net of the discount. Left as `any` because the checkout view
     * reads it loosely — tighten it when that screen is rebuilt.
     */
    order: any;
    message: string;
    payment_url?: string;
    created_at: string;
  };
}

export interface BackendOrder {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  payment_method_name: string;
  created_at: string;
  subtotal?: number;
  delivery_fee?: number;
  /** Always present on the current backend; `value: 0` when no code was used. */
  discount?: ApiDiscount;
  /** Final total, already net of `discount.value`. */
  total: number;
  items_count: number;
  address: string;
}

export interface OrdersListApiResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: {
    orders: BackendOrder[];
    pagination: ApiPagination;
  };
}

export interface OrderDetailItemAttribute {
  attribute_name: {
    ar: string;
    en: string;
  };
  value_name: {
    ar: string;
    en: string;
  };
  price: number;
}

export interface OrderDetailItem {
  id: number;
  product_id: number;
  product_name: {
    ar: string;
    en: string;
  };
  quantity: number;
  unit_price: number;
  line_total: number;
  selected_attributes: OrderDetailItemAttribute[];
}

export interface OrderDetailData {
  id: number;
  order_number: string;
  status: string;
  status_label: string;
  payment_status: string;
  payment_status_label: string;
  subtotal: number;
  tax_value: number;
  tax_rate: number;
  delivery_fee?: number;
  /** Always present on the current backend; `value: 0` when no code was used. */
  discount?: ApiDiscount;
  /** Final total, already net of `discount.value`. */
  total: number;
  loyalty_points_earned: number;
  address: {
    id: number;
    lat: number;
    lng: number;
    notes: string;
    title: string;
    map_desc: string;
  };
  payment_method: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
    driver: string;
  };
  items: OrderDetailItem[];
  invoice?: {
    invoice_number: string;
    qr_code_url: string;
    web_view_url: string;
    pdf_download_url: string;
    image_download_url: string;
  };
  created_at: string;
}

export interface OrderDetailApiResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: OrderDetailData;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: {
    type: string;
    title: {
      ar: string;
      en: string;
    };
    body: {
      ar: string;
      en: string;
    };
  };
  created_at: string;
}

export interface NotificationsListApiResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: {
    notifications: ApiNotification[];
    pagination: ApiPagination;
  };
}

export interface NotificationToggleResponse {
  key: string;
  msg: string;
  code: number;
  response_status: {
    error: boolean;
    validation_errors: string[];
  };
  data: {
    is_notify: boolean;
  };
}


