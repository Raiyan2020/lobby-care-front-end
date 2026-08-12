'use client';

import { Bell, House, Package, UserRound } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from '../lib/navigation';

type TabPath = '/' | '/account' | '/orders' | '/notifications';

const isTabActive = (pathname: string, path: TabPath) => {
  if (path === '/') return pathname === '/' || pathname === '/home';
  return pathname === path || pathname.startsWith(`${path}/`);
};

/** Mobile-only primary navigation. Protected destinations reuse the store auth callback. */
export function MobileBottomNav() {
  const pathname = usePathname() ?? '/';
  const { language, dir, t } = useLanguage();
  const { isLoggedIn, openAuthModal } = useStore();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const navigateTo = (path: TabPath, protectedRoute = false) => {
    if (protectedRoute && !isLoggedIn) {
      openAuthModal(() => navigate(path));
      return;
    }

    navigate(path);
  };

  const tabs = [
    { path: '/' as const, label: t('home'), icon: House, protectedRoute: false },
    { path: '/account' as const, label: t('account'), icon: UserRound, protectedRoute: true },
    { path: '/orders' as const, label: t('myOrders'), icon: Package, protectedRoute: true },
    { path: '/notifications' as const, label: t('notifications'), icon: Bell, protectedRoute: true },
  ];

  return (
    <motion.nav
      aria-label={language === 'ar' ? 'التنقل الرئيسي على الجوال' : 'Mobile primary navigation'}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-2 lg:hidden"
      dir={dir}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', damping: 28, stiffness: 330, mass: 0.7 }}
    >
      <div className="pointer-events-auto mx-auto flex h-[72px] max-w-lg items-center justify-around rounded-[26px] border border-white/70 bg-white/75 px-2 shadow-[0_16px_36px_rgba(31,31,31,0.15),0_3px_10px_rgba(31,31,31,0.07)] backdrop-blur-2xl supports-[backdrop-filter]:bg-white/65 dark:border-white/10 dark:bg-neutral-900/75 dark:supports-[backdrop-filter]:bg-neutral-900/65">
        {tabs.map(({ path, label, icon: Icon, protectedRoute }) => {
          const active = isTabActive(pathname, path);

          return (
            <motion.button
              key={path}
              type="button"
              onClick={() => navigateTo(path, protectedRoute)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              title={label}
              animate={{ y: active ? -10 : 0, scale: active ? 1 : 0.94 }}
              transition={{ type: 'spring', damping: 20, stiffness: 380, mass: 0.55 }}
              whileTap={{ scale: 0.9 }}
              className={`flex size-14 items-center justify-center rounded-[20px] transition-[background-color,color,box-shadow] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green ${
                active
                  ? 'bg-lc-green text-white shadow-[0_8px_16px_rgba(74,122,53,0.32)] ring-4 ring-lc-green-light/80 dark:ring-lc-green-dark/40'
                  : 'text-lc-muted hover:bg-white/70 hover:text-lc-green-deep dark:text-neutral-400 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="size-6" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            </motion.button>
          );
        })}
      </div>
    </motion.nav>
  );
}
