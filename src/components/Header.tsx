'use client';
/**
 * LOBBY CARE site header — Figma node 5:39.
 *
 * Two stacked rows:
 *   1. Announcement bar  (green, three promises)      — node 5:40
 *   2. Main row          (actions · nav · logo)       — node 5:67
 *
 * The Figma frame is laid out left-to-right (actions at x=80, logo at the far
 * right) even though the copy is Arabic, so the two rows are forced to `ltr`
 * and each text node keeps `dir="auto"` to shape Arabic correctly.
 */
import {
  Menu,
  ShoppingBag,
  Heart,
  User,
  Globe,
  ChevronDown,
  Search,
  Truck,
  Clock,
  BadgePercent,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate, useLocation } from '../lib/navigation';
import { useState } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  onFavoritesClick: () => void;
}

const PROMISES = [
  { Icon: BadgePercent, ar: 'خصم على أول طلب باستخدام كود WELCOME10', en: 'Get a discount on your first order with code WELCOME10' },
  { Icon: Truck, ar: 'شحن مجاني للطلبات فوق 15 د.ك', en: 'Free shipping on orders over 15 KWD' },
  { Icon: Clock, ar: 'توصيل سريع داخل الكويت', en: 'Fast delivery inside Kuwait' },
];

const NAV_LINKS = [
  { path: '/about-us', ar: 'من نحن', en: 'About Us' },
  { path: '/categories', ar: 'الأقسام', en: 'Categories' },
  { path: '/', ar: 'الرئيسية', en: 'Home' },
];

export function Header({ onMenuClick, onCartClick, onFavoritesClick }: HeaderProps) {
  const { language, setLanguage } = useLanguage();
  const { cart, settings, favorites } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isArabic = language === 'ar';
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const favoritesCount = favorites.length;

  const [query, setQuery] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
  };

  const label = (item: { ar: string; en: string }) => (isArabic ? item.ar : item.en);

  const logo = (className: string) =>
    settings.logoUrl ? (
      <img
        src={settings.logoUrl}
        alt={isArabic ? settings.storeName : settings.storeNameEn}
        className={className}
        onClick={() => navigate('/')}
      />
    ) : (
      <button
        onClick={() => navigate('/')}
        className="font-bold text-lg text-[var(--lc-ink-hero)] whitespace-nowrap cursor-pointer"
      >
        LOBBY CARE
      </button>
    );

  /** Icon + label + optional count badge (account / favorites / cart). */
  const iconAction = (
    key: string,
    Icon: typeof User,
    text: string,
    onClick: () => void,
    count?: number,
    id?: string,
  ) => (
    <button
      key={key}
      id={id}
      onClick={onClick}
      className="flex flex-col items-center gap-0.5 rounded-[10px] px-2 py-1.5 hover:bg-[var(--lc-surface)] transition-colors cursor-pointer"
    >
      <span className="relative">
        <Icon className="w-[21px] h-[21px] text-[var(--lc-ink)]" strokeWidth={1.6} />
        {count !== undefined && count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full bg-[var(--lc-green)] text-[11px] font-semibold leading-[17px] text-white text-center">
            {count}
          </span>
        )}
      </span>
      <span className="text-[12px] leading-[20.4px] text-[var(--lc-muted)] whitespace-nowrap">{text}</span>
    </button>
  );

  const divider = <span className="mx-2 w-px h-8 bg-[var(--lc-border)] shrink-0" />;

  return (
    <header className="shrink-0 sticky top-0 z-40 bg-white border-b border-[var(--lc-border)]">
      {/* ── Announcement bar — node 5:40 ─────────────────────────────────── */}
      <div className="bg-[var(--lc-green)]">
        <div
          dir="ltr"
          className="mx-auto flex h-11 max-w-[1320px] items-center justify-between gap-4 overflow-hidden px-5 lg:px-20"
        >
          {PROMISES.map(({ Icon, ar, en }, i) => (
            <div
              key={ar}
              // Only the first promise survives on narrow screens.
              className={`flex items-center gap-2 ${i === 0 ? 'mx-auto md:mx-0' : 'hidden md:flex'}`}
            >
              <Icon className="w-[15px] h-[15px] text-white shrink-0" strokeWidth={1.8} />
              <p dir="auto" className="text-[13px] leading-[22.1px] text-white whitespace-nowrap">
                {isArabic ? ar : en}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main row — node 5:67 ─────────────────────────────────────────── */}
      <div dir="ltr" className="flex h-[92px] items-center justify-between gap-4 px-5 lg:px-20">
        {/* Actions + selectors + search (node 5:88) */}
        <div className="flex items-center gap-2">
          {/* Mobile: drawer trigger replaces the action cluster */}
          <button
            onClick={onMenuClick}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--lc-surface)] transition-colors cursor-pointer"
            aria-label={isArabic ? 'القائمة' : 'Menu'}
          >
            <Menu className="w-5 h-5 text-[var(--lc-ink)]" />
          </button>

          <div className="hidden lg:flex items-center">
            {iconAction('account', User, isArabic ? 'حسابي' : 'Account', () => navigate('/account'))}
            {divider}
            {iconAction('fav', Heart, isArabic ? 'المفضلة' : 'Favorites', onFavoritesClick, favoritesCount)}
            {divider}
            {iconAction('cart', ShoppingBag, isArabic ? 'السلة' : 'Cart', onCartClick, cartCount, 'header-cart-icon')}
          </div>

          {/* Country selector — display only, Kuwait is the single market */}
          <div className="hidden xl:flex items-center gap-1 rounded-[10px] p-2 text-[var(--lc-muted)]">
            <Globe className="w-[14px] h-[14px]" />
            <span className="text-[14px] leading-[23.8px] whitespace-nowrap">{isArabic ? 'الكويت' : 'Kuwait'}</span>
            <ChevronDown className="w-[17px] h-[17px]" />
          </div>

          {/* Language selector */}
          <button
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            className="hidden xl:flex items-center gap-1 rounded-[10px] p-2 text-[var(--lc-muted)] hover:bg-[var(--lc-surface)] transition-colors cursor-pointer"
          >
            <Globe className="w-[14px] h-[14px]" />
            <span className="text-[14px] leading-[23.8px] whitespace-nowrap">{isArabic ? 'العربية' : 'English'}</span>
            <ChevronDown className="w-[17px] h-[17px]" />
          </button>

          {/* Search — node 8:7479 */}
          <form
            onSubmit={submitSearch}
            dir={isArabic ? 'rtl' : 'ltr'}
            className="hidden lg:flex h-[54px] w-[260px] xl:w-[320px] items-center gap-3 rounded-[12px] border border-[var(--lc-border)] bg-[var(--lc-surface)] px-6"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isArabic ? 'ابحث عن منتجات، ماركات وأكثر...' : 'Search products, brands and more...'}
              className="min-w-0 flex-1 bg-transparent text-[15px] text-[var(--lc-ink)] outline-none placeholder:text-[var(--lc-muted-soft)]"
            />
            <button type="submit" aria-label={isArabic ? 'بحث' : 'Search'} className="cursor-pointer">
              <Search className="w-[18px] h-[18px] text-[var(--lc-muted-soft)]" />
            </button>
          </form>
        </div>

        {/* Navigation — node 8:7468 */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative flex h-[52px] items-center justify-center px-4 text-[15px] leading-[25.5px] transition-colors cursor-pointer ${
                  active
                    ? 'font-semibold text-[var(--lc-green-deep)]'
                    : 'text-[var(--lc-muted)] hover:text-[var(--lc-green-deep)]'
                }`}
              >
                <span dir="auto">{label(link)}</span>
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-t-[4px] bg-[var(--lc-green)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile actions */}
        <div className="flex items-center gap-1 lg:hidden">
          <button
            onClick={onFavoritesClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--lc-surface)] transition-colors cursor-pointer"
            aria-label={isArabic ? 'المفضلة' : 'Favorites'}
          >
            <Heart className="w-5 h-5 text-[var(--lc-ink)]" />
            {favoritesCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--lc-green)] text-[10px] font-semibold leading-4 text-white text-center">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            id="header-cart-icon-mobile"
            onClick={onCartClick}
            className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--lc-surface)] transition-colors cursor-pointer"
            aria-label={isArabic ? 'السلة' : 'Cart'}
          >
            <ShoppingBag className="w-5 h-5 text-[var(--lc-ink)]" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--lc-green)] text-[10px] font-semibold leading-4 text-white text-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Logo — node 8:7477 */}
        <div className="flex items-center lg:px-10">{logo('h-[56px] lg:h-[72px] w-auto object-contain cursor-pointer')}</div>
      </div>

      {/* Mobile search row */}
      <form
        onSubmit={submitSearch}
        dir={isArabic ? 'rtl' : 'ltr'}
        className="flex lg:hidden h-[48px] items-center gap-3 border-t border-[var(--lc-border)] bg-[var(--lc-surface)] px-5"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={isArabic ? 'ابحث عن منتجات، ماركات وأكثر...' : 'Search products, brands and more...'}
          className="min-w-0 flex-1 bg-transparent text-[14px] text-[var(--lc-ink)] outline-none placeholder:text-[var(--lc-muted-soft)]"
        />
        <button type="submit" aria-label={isArabic ? 'بحث' : 'Search'} className="cursor-pointer">
          <Search className="w-[18px] h-[18px] text-[var(--lc-muted-soft)]" />
        </button>
      </form>
    </header>
  );
}
