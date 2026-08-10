'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { addToCartApi } from '../api/cart';
import { useInvalidateCart } from './useCartQuery';
import { clearSession } from '../utils/auth';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';

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
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isLoggedIn, openAuthModal, logoutUser } = useStore();

  const addToCart = async (
    e: React.MouseEvent,
    productId: number,
    quantity = 1,
    attributeValueIds?: number[]
  ) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      openAuthModal(() => {
        const dummyEvent = { stopPropagation: () => {} } as any;
        addToCart(dummyEvent, productId, quantity, attributeValueIds);
      });
      return;
    }

    // Optimistically block the button while in-flight
    setLoadingId(productId);

    try {
      const res = await addToCartApi(productId, quantity, attributeValueIds);

      if (res.code === 401 || res.key === 'unauthenticated') {
        logoutUser();
        openAuthModal(() => {
          const dummyEvent = { stopPropagation: () => {} } as any;
          addToCart(dummyEvent, productId, quantity, attributeValueIds);
        });
        return;
      }

      if (res.response_status?.error) {
        toast.error(res.msg || t('addToCartError'));
        return;
      }

      // Success
      toast.success(res.msg || t('addToCartSuccess'), {
        duration: 2500,
      });

      // Refresh cart count + data in Header and CartPage
      await invalidateCart();
    } catch (err) {
      toast.error(t('connectionError'));
    } finally {
      setLoadingId(null);
    }
  };

  return { addToCart, loadingId };
}
