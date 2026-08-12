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
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-lc-border bg-white/95 shadow-[0_-4px_18px_rgba(31,31,31,0.08)] backdrop-blur lg:hidden dark:bg-neutral-900/95"
      dir={dir}
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div className="mx-auto flex h-16 max-w-lg items-center justify-around px-3">
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
              className={`flex size-11 items-center justify-center rounded-lc transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green ${
                active
                  ? 'bg-lc-green-light text-lc-green-deep'
                  : 'text-lc-muted hover:bg-lc-surface hover:text-lc-green-deep'
              }`}
            >
              <Icon className="size-5" strokeWidth={active ? 2.5 : 2} aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
