'use client';

import { Bell, House, Package, UserRound } from 'lucide-react';
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
    <nav
      aria-label={language === 'ar' ? 'التنقل الرئيسي على الجوال' : 'Mobile primary navigation'}
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] px-3 lg:hidden"
      dir={dir}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="pointer-events-auto mx-auto flex h-16 max-w-md items-center justify-around rounded-[22px] border border-white/80 bg-white/95 px-2 shadow-[0_12px_30px_rgba(31,31,31,0.16),0_2px_8px_rgba(31,31,31,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/95">
        {tabs.map(({ path, label, icon: Icon, protectedRoute }) => {
          const active = isTabActive(pathname, path);

          return (
            <button
              key={path}
              type="button"
              onClick={() => navigateTo(path, protectedRoute)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              title={label}
              className={`flex size-12 items-center justify-center rounded-[18px] transition-[transform,background-color,color,box-shadow] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green active:scale-90 ${
                active
                  ? '-translate-y-2 bg-lc-green text-white shadow-[0_8px_16px_rgba(74,122,53,0.32)] ring-4 ring-lc-green-light dark:ring-lc-green-dark/40'
                  : 'text-lc-muted hover:bg-lc-surface hover:text-lc-green-deep dark:text-neutral-400 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="size-[21px]" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
