'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { addToCartApi, getCartErrorMessage } from '../api/cart';
import { useInvalidateCart } from './useCartQuery';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { isOutOfStock } from '../utils/stock';

/**
 * useAddToCart
 *
 * A reusable hook that:
 *  - Calls POST /user/cart with { product_id, quantity }
 *  - On success  → shows a success toast and invalidates the cart query
 *  - On 401      → clears session, shows a warning toast, redirects to /login
 *  - On error    → shows an error toast
 *
 * Returns { addToCart, loadingId } so each layout can show per-item loading states.
 */
export function useAddToCart() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const invalidateCart = useInvalidateCart();
  const { t } = useLanguage();
  const { cart, isLoggedIn, openAuthModal, logoutUser } = useStore();

  const addToCart = async (
    e: React.MouseEvent,
    productId: number,
    quantity = 1,
    attributeValueIds?: number[],
    /**
     * Units on hand, when the caller knows them. This gives immediate UI
     * feedback; the backend independently enforces the authoritative limit.
     */
    stock?: number | null
  ): Promise<boolean> => {
    e.stopPropagation();

    if (isOutOfStock({ stock })) {
      toast.error(t('outOfStockError'));
      return false;
    }

    if (stock !== null && stock !== undefined) {
      const quantityAlreadyInCart = cart
        .filter((item) => String(item.product.id) === String(productId))
        .reduce((total, item) => total + item.quantity, 0);

      if (quantityAlreadyInCart + quantity > stock) {
        toast.error(t('stockLimitReached').replace('{stock}', String(stock)));
        return false;
      }
    }

    if (!isLoggedIn) {
      openAuthModal(() => {
        const dummyEvent = { stopPropagation: () => {} } as React.MouseEvent;
        addToCart(dummyEvent, productId, quantity, attributeValueIds, stock);
      });
      return false;
    }

    // Optimistically block the button while in-flight
    setLoadingId(productId);

    try {
      const res = await addToCartApi(productId, quantity, attributeValueIds);

      if (res.code === 401 || res.key === 'unauthenticated') {
        logoutUser();
        openAuthModal(() => {
          const dummyEvent = { stopPropagation: () => {} } as React.MouseEvent;
          addToCart(dummyEvent, productId, quantity, attributeValueIds, stock);
        });
        return false;
      }

      if (res.response_status?.error) {
        toast.error(getCartErrorMessage(res, t('addToCartError')));
        return false;
      }

      // Success
      toast.success(res.msg || t('addToCartSuccess'), {
        duration: 2500,
      });

      // Refresh cart count + data in Header and CartPage
      await invalidateCart();
      return true;
    } catch {
      toast.error(t('connectionError'));
      return false;
    } finally {
      setLoadingId(null);
    }
  };

  return { addToCart, loadingId };
}
