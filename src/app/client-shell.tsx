'use client';
/**
 * ClientShell — replaces App.tsx's CustomerApp + admin layout logic.
 * Wraps every page with Header, SideMenu, and AppContainer.
 * Detects admin routes and renders a plain wrapper instead.
 */
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Header } from '../components/Header';
import { SideMenu } from '../components/SideMenu';
import { AppContainer } from '../components/AppContainer';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import type { ViewState } from '../types';
import { toast } from 'sonner';
import { syncAuthCookieFromStorage } from '../utils/auth';
import { AuthModal } from '../components/AuthModal';

export function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { settings } = useStore();
  const { language } = useLanguage();


  const themeStyle = {
    '--store-primary-color': settings.themeColors?.primaryColor || '#000000',
    '--store-secondary-color': settings.themeColors?.secondaryColor || '#bfa264',
  } as React.CSSProperties;

  // Sync document title
  useEffect(() => {
    document.title = language === 'ar' ? settings.storeName : settings.storeNameEn;
  }, [settings.storeName, settings.storeNameEn, language]);

  const { isAuthModalOpen, closeAuthModal, triggerAuthSuccess, logoutUser, openAuthModal } = useStore();

  // Global 401 interceptor
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;

    const handleUnauthorized = (customMessage?: string) => {
      logoutUser();

      const msg = customMessage || (language === 'ar' ? 'غير مصرح، يرجى تسجيل الدخول.' : 'Unauthenticated, please login.');
      toast.error(msg, {
        id: 'unauthenticated-toast-error',
      });
      openAuthModal();
    };

    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        handleUnauthorized();
      } else {
        try {
          const clone = response.clone();
          const contentType = clone.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const json = await clone.json();
            if (json && (json.code === 401 || json.key === 'unauthenticated')) {
              handleUnauthorized(json.msg);
            }
          }
        } catch (e) {
          // ignore parsing error
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [language, logoutUser, openAuthModal]);

  // Normalize stored orders payment method names (migrated from App.tsx)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_orders');
      if (!raw) return;
      const orders = JSON.parse(raw);
      if (!Array.isArray(orders)) return;
      let modified = false;
      const updated = orders.map((order: { paymentMethod?: string }) => {
        if (order && typeof order.paymentMethod === 'string') {
          let pm = order.paymentMethod;
          if (pm.includes('ديما سداد')) { pm = pm.replace(/ديما سداد/g, 'ديما'); modified = true; }
          if (pm.includes('Deema Pay'))  { pm = pm.replace(/Deema Pay/g, 'Deema'); modified = true; }
          if (pm.includes('تابي / تالي')) { pm = pm.replace(/تابي \/ تالي/g, 'تالي'); modified = true; }
          if (pm.includes('تالي / تالي')) { pm = pm.replace(/تالي \/ تالي/g, 'تالي'); modified = true; }
          if (pm.includes('Tabby / Taly')) { pm = pm.replace(/Tabby \/ Taly/g, 'Taly'); modified = true; }
          order.paymentMethod = pm;
        }
        return order;
      });
      if (modified) localStorage.setItem('user_orders', JSON.stringify(updated));
    } catch { /* ignore */ }
  }, []);

  const currentView: ViewState =
    pathname?.startsWith('/cart')        ? 'CART' :
    pathname?.startsWith('/categories')  ? 'CATEGORIES' :
    pathname?.startsWith('/offers')      ? 'OFFERS' :
    pathname?.startsWith('/account')     ? 'ACCOUNT' :
    pathname?.startsWith('/favorites')   ? 'FAVORITES' :
    'HOME';

  const handleNavigate = (view: ViewState) => {
    const paths: Record<ViewState, string> = {
      HOME: '/', CATEGORIES: '/categories', CART: '/cart',
      OFFERS: '/offers', ACCOUNT: '/account', FAVORITES: '/favorites',
      SPLASH: '/',
    };
    router.push(paths[view]);
  };

  const isHomePath = pathname === '/' || pathname === '/home';


  // ── Customer layout ────────────────────────────────────────────────────
  return (
    <div style={themeStyle} className="w-full h-full customer-app">
      <AppContainer>
        <div className="flex flex-col flex-1 h-full relative">
          <Header
            onMenuClick={() => setIsMenuOpen(true)}
            onCartClick={() => handleNavigate('CART')}
            onFavoritesClick={() => handleNavigate('FAVORITES')}
          />
          <main
            className={`flex-1 overflow-y-auto overflow-x-hidden no-scrollbar flex flex-col ${isHomePath ? 'pb-0' : 'pb-10'}`}
          >
            {children}
          </main>
          <SideMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            currentView={currentView}
            onNavigate={handleNavigate}
          />
        </div>
      </AppContainer>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        onSuccess={triggerAuthSuccess}
      />
    </div>
  );
}
