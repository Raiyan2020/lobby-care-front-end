'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { StaticImageData } from 'next/image';
import { Product, CartItem, ProductVariant } from '../types';
import { fetchConfig } from '../api/general';
import { DEFAULT_HOME_LAYOUT, type HomeLayoutName } from '../api/config';
import { fetchHome } from '../api/home';
import { toggleFavoriteApi } from '../api/products';
import { useCartQuery, useInvalidateCart } from '../hooks/useCartQuery';
import { useFavoritesQuery, useInvalidateFavorites } from '../hooks/useFavoritesQuery';
import { startSession, clearSession } from '../utils/auth';
import { toast } from 'sonner';
import { useLanguage } from './LanguageContext';
import type { ApiBanner, ApiCategory, ApiProduct } from '../api/types';

export function getProductVariants(product: Product): ProductVariant[] {
  if (product.variants && product.variants.length > 0) {
    return product.variants;
  }
  const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['افتراضي'];
  const colors = product.colors && product.colors.length > 0 ? product.colors : ['افتراضي'];

  if (sizes.length === 1 && sizes[0] === 'افتراضي' && colors.length === 1 && colors[0] === 'افتراضي') {
    return [{
      id: `var-${product.id}-default`,
      size: 'افتراضي',
      color: 'افتراضي',
      stock: 999,
      isActive: true,
    }];
  }

  const generated: ProductVariant[] = [];
  sizes.forEach((s) => {
    colors.forEach((c) => {
      generated.push({
        id: `var-${product.id}-${s.replace(/\s+/g, '')}-${c.replace(/\s+/g, '')}`,
        size: s,
        color: c,
        stock: 0,
        isActive: true,
      });
    });
  });
  return generated;
}

export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  image: string | StaticImageData;
  active: boolean;
}

export interface StoreProduct extends Product {
  description?: string;
  categoryId?: string;
  active: boolean;
  isOffer: boolean;
  isMostOrdered: boolean;
  isTrending: boolean;
  costPrice?: number;
  homeWidgets?: ('offers' | 'mostOrdered' | 'trending')[];
}

export interface StoreBanner {
  id: string;
  image: string;
  title?: string;
  subtitle?: string;
  titleEn?: string;
  subtitleEn?: string;
  active: boolean;
}

export interface ThemeColors {
  primaryColor: string;
  secondaryColor: string;
}

export interface StoreSettings {
  logoUrl: string;
  storeName: string;
  tagline: string;
  storeNameEn: string;
  taglineEn: string;
  displayMode?: 'light' | 'dark';
  themeColors?: ThemeColors;
  homeLayout?: HomeLayoutName;
}

const DEFAULT_SETTINGS: StoreSettings = {
  logoUrl: '',
  storeName: '',
  tagline: '',
  storeNameEn: '',
  taglineEn: '',
  displayMode: 'light',
  themeColors: {
    primaryColor: '#80b446',
    secondaryColor: '#6b9a37',
  },
  homeLayout: DEFAULT_HOME_LAYOUT,
};

// ── Helpers: cookie reader (works on the client without localStorage) ─────────

/** Read a cookie value by name (client-side only). */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// ── Helpers: map API shapes → internal shapes ──────────────────────────────

function mapApiBannerToStoreBanner(b: ApiBanner): StoreBanner {
  return {
    id: String(b.id),
    image: b.image ?? '',
    title: b.title ?? '',
    subtitle: b.description ?? '',
    titleEn: b.title ?? '',
    subtitleEn: b.description ?? '',
    active: true,
  };
}

function mapApiCategoryToCategory(c: ApiCategory): Category {
  return {
    id: String(c.id),
    name: c.name,
    nameEn: c.name,
    image: c.image || '',
    active: true,
  };
}

function mapApiProductToStoreProduct(
  p: ApiProduct,
  flags: { isOffer?: boolean; isMostOrdered?: boolean; isTrending?: boolean } = {}
): StoreProduct {
  const hw: ('offers' | 'mostOrdered' | 'trending')[] = [];
  if (flags.isOffer) hw.push('offers');
  if (flags.isMostOrdered) hw.push('mostOrdered');
  if (flags.isTrending) hw.push('trending');

  return {
    id: String(p.id),
    name: p.name,
    image: p.image ?? '',
    price: p.price,
    originalPrice: p.old_price ?? undefined,
    badge: p.discount_percentage ? `-${p.discount_percentage}%` : undefined,
    stock: p.stock,
    active: true,
    isOffer: flags.isOffer ?? false,
    isMostOrdered: flags.isMostOrdered ?? false,
    isTrending: flags.isTrending ?? false,
    homeWidgets: hw,
  };
}

// ── Context type ──────────────────────────────────────────────────────────────

interface StoreContextType {
  banners: StoreBanner[];
  categories: Category[];
  products: StoreProduct[];
  settings: StoreSettings;
  setBanners: (banners: StoreBanner[]) => void;
  setCategories: (categories: Category[]) => void;
  setProducts: (products: StoreProduct[]) => void;
  updateSettings: (settings: StoreSettings) => void;
  resetSettings: () => void;
  addBanner: (banner: StoreBanner) => void;
  updateBanner: (banner: StoreBanner) => void;
  deleteBanner: (id: string) => void;
  addProduct: (product: StoreProduct) => void;
  updateProduct: (product: StoreProduct) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  cart: CartItem[];
  addToCart: (product: StoreProduct, selectedOptionId?: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (onSuccess?: () => void) => void;
  closeAuthModal: () => void;
  loginUser: (sessionData: any) => void;
  logoutUser: () => void;
  triggerAuthSuccess: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [banners, setBannersState] = useState<StoreBanner[]>([]);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [products, setProductsState] = useState<StoreProduct[]>([]);
  const [settings, setSettingsState] = useState<StoreSettings>(DEFAULT_SETTINGS);
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Language comes from LanguageContext — no localStorage needed
  const { language, setStoreDetails } = useLanguage();

  const { cartData } = useCartQuery();
  const invalidateCart = useInvalidateCart();
  const { data: favoritesData } = useFavoritesQuery(1);
  const invalidateFavorites = useInvalidateFavorites();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);

  // Sync auth state on mount
  useEffect(() => {
    setIsLoggedIn(Boolean(getCookie('auth_token')));
  }, []);

  const openAuthModal = (onSuccess?: () => void) => {
    setIsAuthModalOpen(true);
    if (onSuccess) {
      setAuthSuccessCallback(() => onSuccess);
    } else {
      setAuthSuccessCallback(null);
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthSuccessCallback(null);
  };

  const triggerAuthSuccess = () => {
    if (authSuccessCallback) {
      authSuccessCallback();
    }
    closeAuthModal();
  };

  const loginUser = (sessionData: any) => {
    startSession(sessionData);
    setIsLoggedIn(true);
    invalidateCart();
    invalidateFavorites();
  };

  const logoutUser = () => {
    clearSession();
    setIsLoggedIn(false);
    setCartState([]);
    setFavoritesState([]);
    invalidateCart();
    invalidateFavorites();
  };

  // ── Sync server cart into local state ─────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn && cartData && cartData.items) {
      const mappedCart: CartItem[] = cartData.items.map((item) => {
        let selectedOptionType: 'size' | 'color' | null = null;
        let selectedSize = 'افتراضي';
        let selectedColor = 'افتراضي';
        let selectedOptionLabelAr = '';
        let selectedOptionLabelEn = '';
        let selectedOptionValueAr = '';
        let selectedOptionValueEn = '';

        if (item.selected_attributes && item.selected_attributes.length > 0) {
          const firstAttr = item.selected_attributes[0];
          if (
            firstAttr.attribute_name.includes('اللون') ||
            firstAttr.attribute_name.toLowerCase().includes('color')
          ) {
            selectedOptionType = 'color';
            selectedColor = firstAttr.value_name;
            selectedOptionLabelAr = 'اللون';
            selectedOptionLabelEn = 'Color';
            selectedOptionValueAr = firstAttr.value_name;
            selectedOptionValueEn = firstAttr.value_name;
          } else {
            selectedOptionType = 'size';
            selectedSize = firstAttr.value_name;
            selectedOptionLabelAr = firstAttr.attribute_name;
            selectedOptionLabelEn = firstAttr.attribute_name;
            selectedOptionValueAr = firstAttr.value_name;
            selectedOptionValueEn = firstAttr.value_name;
          }
        }

        const variantId = item.selected_attributes
          .map((a) => a.product_attribute_value_id)
          .sort()
          .join('-');

        return {
          id: String(item.id),
          product: {
            id: String(item.product.id),
            name: item.product.name,
            image: item.product.image,
            price: item.product.price,
            originalPrice: item.product.old_price ?? undefined,
            stock: item.product.stock,
          } as any,
          quantity: item.quantity,
          selectedSize,
          selectedColor,
          variantId,
          selectedOptionType,
          selectedOptionLabelAr,
          selectedOptionLabelEn,
          selectedOptionValueAr,
          selectedOptionValueEn,
        };
      });

      setCartState(mappedCart);
    }
  }, [cartData, isLoggedIn]);

  // ── Bootstrap: fetch everything from the backend ───────────────────────────
  useEffect(() => {
    // Fetch home data (banners, categories, featured / offer / most-ordered products)
    fetchHome(language)
      .then((homeData) => {
        if (homeData.banners?.length) {
          setBannersState(homeData.banners.map(mapApiBannerToStoreBanner));
        }

        if (homeData.categories?.length) {
          setCategoriesState(homeData.categories.map(mapApiCategoryToCategory));
        }

        // Merge all product lists; de-duplicate by id, preserve widget flags
        const productMap = new Map<string, StoreProduct>();

        (homeData.featured_products || []).forEach((p) => {
          const key = String(p.id);
          const existing = productMap.get(key);
          productMap.set(
            key,
            mapApiProductToStoreProduct(p, {
              isOffer: existing?.isOffer ?? false,
              isMostOrdered: existing?.isMostOrdered ?? false,
              isTrending: existing?.isTrending ?? false,
            })
          );
        });

        (homeData.latest_offers || []).forEach((p) => {
          const key = String(p.id);
          const existing = productMap.get(key);
          productMap.set(
            key,
            mapApiProductToStoreProduct(p, {
              isOffer: true,
              isMostOrdered: existing?.isMostOrdered ?? false,
              isTrending: existing?.isTrending ?? false,
            })
          );
        });

        (homeData.most_ordered || []).forEach((p) => {
          const key = String(p.id);
          const existing = productMap.get(key);
          productMap.set(
            key,
            mapApiProductToStoreProduct(p, {
              isOffer: existing?.isOffer ?? false,
              isMostOrdered: true,
              isTrending: existing?.isTrending ?? false,
            })
          );
        });

        setProductsState(Array.from(productMap.values()));
      })
      .catch((err) => console.error('Failed to load home data', err));

    // Fetch store config (name, logo, brand color, etc.)
    fetchConfig(language)
      .then((config) => {
        setStoreDetails(config.name, config.description);
        setSettingsState((prev) => {
          const updated: StoreSettings = {
            ...prev,
            storeName: config.name,
            storeNameEn: config.name,
            tagline: config.description,
            taglineEn: config.description,
            logoUrl: config.logo,
            themeColors: {
              ...prev.themeColors,
              secondaryColor: config.app_color_light || '#9c88ff',
            } as ThemeColors,
          };

          if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty(
              '--store-secondary-color',
              config.app_color_light || '#9c88ff'
            );
          }

          return updated;
        });
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error('Failed to load store config', err);
        setIsLoaded(true);
      });
  }, [language]);

  // Sync favorites IDs to local context state
  useEffect(() => {
    if (favoritesData?.key === 'success' && favoritesData.data?.products) {
      const favIds = favoritesData.data.products.map((p: any) => String(p.id));
      setFavoritesState(favIds);
    }
  }, [favoritesData]);

  // ── In-memory setters (pure React state — no localStorage) ────────────────
  const setBanners = (newData: StoreBanner[]) => setBannersState(newData);
  const setCategories = (newData: Category[]) => setCategoriesState(newData);

  const setProducts = (newData: StoreProduct[]) => {
    const synced = newData.map((p) => {
      const hw: ('offers' | 'mostOrdered' | 'trending')[] = Array.isArray(p.homeWidgets)
        ? [...p.homeWidgets]
        : [];
      if (!p.homeWidgets) {
        if (p.isOffer) hw.push('offers');
        if (p.isMostOrdered) hw.push('mostOrdered');
        if (p.isTrending) hw.push('trending');
      }
      return {
        ...p,
        homeWidgets: hw,
        isOffer: hw.includes('offers'),
        isMostOrdered: hw.includes('mostOrdered'),
        isTrending: hw.includes('trending'),
      } as StoreProduct;
    });
    setProductsState(synced);
  };

  const addBanner = (b: StoreBanner) => setBanners([...banners, b]);
  const updateBanner = (b: StoreBanner) => setBanners(banners.map((i) => (i.id === b.id ? b : i)));
  const deleteBanner = (id: string) => setBanners(banners.filter((i) => i.id !== id));

  const addProduct = (p: StoreProduct) => setProducts([...products, p]);
  const updateProduct = (p: StoreProduct) => setProducts(products.map((i) => (i.id === p.id ? p : i)));
  const deleteProduct = (id: string) => setProducts(products.filter((i) => i.id !== id));

  const addCategory = (c: Category) => setCategories([...categories, c]);
  const updateCategory = (c: Category) => setCategories(categories.map((i) => (i.id === c.id ? c : i)));
  const deleteCategory = (id: string) => setCategories(categories.filter((i) => i.id !== id));

  // Settings: all data from API; displayMode is in-memory React state only
  const updateSettings = (newSettings: StoreSettings) => setSettingsState(newSettings);
  const resetSettings = () => setSettingsState(DEFAULT_SETTINGS);

  // ── Cart (in-memory; server state is the source of truth via useCartQuery) ─
  const setCart = (newCart: CartItem[]) => setCartState(newCart);

  const addToCart = (product: StoreProduct, selectedOptionId?: string, quantity: number = 1) => {
    let matchedOption = null;
    let selectedOptionType: 'size' | 'color' | null = null;

    if (product.optionType === 'size' || product.optionType === 'color') {
      selectedOptionType = product.optionType;
      matchedOption = product.productOptions?.find((opt) => opt.id === selectedOptionId);
      if (!matchedOption && product.productOptions && product.productOptions.length > 0) {
        matchedOption = product.productOptions[0];
      }
    }

    const variantId = matchedOption?.id || 'default';
    const productStock = product.stock ?? 999;
    const maxStock = matchedOption?.stock !== undefined
      ? Math.min(productStock, matchedOption.stock)
      : productStock;

    let selectedOptionLabelAr = '';
    let selectedOptionLabelEn = '';
    let selectedOptionValueAr = '';
    let selectedOptionValueEn = '';

    if (matchedOption && selectedOptionType) {
      if (selectedOptionType === 'size') {
        selectedOptionLabelAr = 'المقاس';
        selectedOptionLabelEn = 'Size';
      } else {
        selectedOptionLabelAr = 'اللون';
        selectedOptionLabelEn = 'Color';
      }
      selectedOptionValueAr = matchedOption.nameAr;
      selectedOptionValueEn = matchedOption.nameEn;
    }

    const uniqueId = `${product.id}-${variantId}`;
    const existingIndex = cart.findIndex(
      (item) =>
        item.id === uniqueId ||
        (item.product.id === product.id && item.variantId === variantId)
    );

    let targetQty = quantity;
    if (existingIndex > -1) targetQty += cart[existingIndex].quantity;
    if (targetQty > maxStock) targetQty = maxStock;
    if (targetQty <= 0) return;

    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity = targetQty;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          id: uniqueId,
          product,
          quantity: targetQty,
          variantId,
          selectedOptionType: selectedOptionType || undefined,
          selectedOptionLabelAr,
          selectedOptionLabelEn,
          selectedOptionValueAr,
          selectedOptionValueEn,
        },
      ]);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(
      cart.filter((item) => {
        const id = item.id || item.product.id;
        return id !== cartItemId;
      })
    );
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(
      cart.map((item) => {
        const id = item.id || item.product.id;
        if (id === cartItemId) {
          let maxStock = item.product.stock ?? 999;
          if (item.product.optionType === 'size' || item.product.optionType === 'color') {
            const matchedOption = item.product.productOptions?.find(
              (v) => v.id === item.variantId
            );
            if (matchedOption && matchedOption.stock !== undefined) {
              maxStock = Math.min(maxStock, matchedOption.stock);
            }
          }
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  // ── Favorites (in-memory; server state is source of truth via useFavoritesQuery)
  const setFavorites = (newData: string[]) => setFavoritesState(newData);

  const toggleFavorite = async (productId: string) => {
    if (!isLoggedIn) {
      openAuthModal(() => {
        toggleFavorite(productId);
      });
      return;
    }

    const isAlreadyFav = favorites.includes(productId);

    // Optimistic UI update
    setFavorites(
      isAlreadyFav
        ? favorites.filter((id) => id !== productId)
        : [...favorites, productId]
    );

    try {
      const response = await toggleFavoriteApi(productId, language);
      if (response.code === 401 || response.key === 'unauthenticated') {
        // Rollback
        setFavorites(favorites);
        logoutUser();
        openAuthModal(() => {
          toggleFavorite(productId);
        });
        return;
      }

      // Reconcile with server truth
      const serverIsFav = response.data.is_favorite;
      if (serverIsFav !== !isAlreadyFav) {
        setFavorites(
          serverIsFav
            ? [...favorites, productId]
            : favorites.filter((id) => id !== productId)
        );
      }
      invalidateFavorites();
    } catch (err) {
      setFavorites(favorites); // rollback on network error
      console.error('Failed to toggle favorite on backend', err);
    }
  };

  if (!isLoaded) return null;

  return (
    <StoreContext.Provider
      value={{
        banners,
        categories,
        products,
        settings,
        setBanners,
        setCategories,
        setProducts,
        updateSettings,
        resetSettings,
        addBanner,
        updateBanner,
        deleteBanner,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        favorites,
        toggleFavorite,
        isLoggedIn,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginUser,
        logoutUser,
        triggerAuthSuccess,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}
