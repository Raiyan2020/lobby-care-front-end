'use client';
/**
 * LobbyHeader — LOBBY CARE site header.
 *
 * Implements Figma frame "الرئيسية" → Header (node 5:39), a 136px stack of a
 * 44px promo bar over a 92px main bar. Measurements are taken from the node
 * tree, not estimated:
 *
 *   promo bar   44px, bg #80b446, three 13/22 white items, 1280 content width
 *   main bar    92px, bg #fff, [logo 137×72] [nav 281×52] [actions 683×56]
 *   nav item    15/26, #666; active #6b9a37 @600 with a 3px #80b446 underline
 *   icon action 21px glyph over a 12/20 label, 6/8 padding, radius 10
 *   badge       pill, bg #80b446, 11/19 @600 white
 *   search      270×54, bg #f7f9f4, 1.2px #e8e8e8 border, radius 12
 *
 * Figma lists children left-to-right; this markup is authored in RTL reading
 * order so the rendered x-positions match the design under `dir="rtl"`.
 *
 * Figma has no mobile frame for the header, so below `lg` the nav and promo
 * bar collapse into the existing SideMenu drawer — see
 * FIGMA_FRONTEND_IMPLEMENTATION_PLAN.md §0.
 */
import { useState } from 'react';
import {
  ChevronDown,
  Globe,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  Tag,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useStore } from '../../contexts/StoreContext';
import { useNavigate, useLocation } from '../../lib/navigation';

interface LobbyHeaderProps {
  onMenuClick: () => void;
  onCartClick: () => void;
  onFavoritesClick: () => void;
}

/** A promo-bar item: 15px glyph + 13/22 white label, 8px apart. */
function PromoItem({
  icon: Icon,
  label,
  className,
}: {
  icon: typeof Tag;
  label: string;
  className?: string;
}) {
  return (
    <li className={`flex items-center gap-2 ${className ?? ''}`}>
      <Icon className="size-[15px] shrink-0" strokeWidth={1.1} aria-hidden />
      <span className="text-lc-sm">{label}</span>
    </li>
  );
}

/** Header icon button: glyph over label, with an optional count badge. */
function IconAction({
  icon: Icon,
  label,
  count,
  onClick,
  className,
}: {
  icon: typeof User;
  label: string;
  count?: number;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count ? `${label} (${count})` : label}
      className={`flex min-w-11 cursor-pointer flex-col items-center gap-0.5 rounded-lc px-2 py-1.5 transition-colors hover:bg-lc-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green ${className ?? ''}`}
    >
      <span className="relative block size-[21px]">
        <Icon className="size-[21px] text-lc-ink" strokeWidth={1.5} aria-hidden />
        {/* Figma sits the count 12px to the reading-start side of the glyph
            (right under RTL), so this offset is logical rather than a physical
            `-left-2`, which would pin it to the wrong side. */}
        {count ? (
          <span className="absolute -top-1 -start-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-lc-green px-1 text-lc-overline font-semibold text-white">
            {count > 99 ? '99+' : count}
          </span>
        ) : null}
      </span>
      <span className="text-lc-caption text-lc-muted">{label}</span>
    </button>
  );
}

/** 1px × 32px hairline separating the icon actions. Desktop only — the mobile
 *  bar carries too few controls to need separators. */
function Divider() {
  return <span aria-hidden className="mx-2 h-8 w-px shrink-0 bg-lc-border max-lg:hidden" />;
}

export function LobbyHeader({
  onMenuClick,
  onCartClick,
  onFavoritesClick,
}: LobbyHeaderProps) {
  const { language, setLanguage } = useLanguage();
  const { cart, settings, favorites } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  const isArabic = language === 'ar';
  const cartCount = cart?.length ?? 0;
  const favCount = favorites?.length ?? 0;

  const navLinks = [
    { path: '/', label: isArabic ? 'الرئيسية' : 'Home' },
    { path: '/categories', label: isArabic ? 'الأقسام' : 'Categories' },
    { path: '/about-us', label: isArabic ? 'من نحن' : 'About us' },
  ];

  const promos = [
    { icon: Zap, label: isArabic ? 'توصيل سريع داخل الكويت' : 'Fast delivery in Kuwait' },
    { icon: Truck, label: isArabic ? 'شحن مجاني للطلبات فوق 15 د.ك' : 'Free shipping over 15 KD' },
    { icon: Tag, label: isArabic ? 'خصم على أول طلب باستخدام كود WELCOME10' : 'Use code WELCOME10 on your first order' },
  ];

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  return (
    <header className="w-full bg-white">
      {/* ── Promo bar — 44px, brand green ─────────────────────────────────── */}
      <div className="bg-lc-green text-white">
        <ul className="lc-container flex h-11 items-center justify-between gap-6 max-lg:justify-center">
          {promos.map((p, i) => (
            <PromoItem
              key={p.label}
              icon={p.icon}
              label={p.label}
              /* Only the first promo survives the narrow viewport. */
              className={i > 0 ? 'max-lg:hidden' : undefined}
            />
          ))}
        </ul>
      </div>

      {/* ── Main bar — 92px ───────────────────────────────────────────────── */}
      <div className="lc-container flex h-[92px] items-center justify-between gap-12">
        {/* Logo — rightmost under RTL */}
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label={isArabic ? 'الصفحة الرئيسية' : 'Home'}
          className="flex shrink-0 cursor-pointer items-center px-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green lg:px-10"
        >
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={isArabic ? settings.storeName : settings.storeNameEn}
              className="h-12 w-auto object-contain lg:h-[72px]"
            />
          ) : (
            <span className="font-display text-lc-2xl font-bold text-lc-ink">
              {isArabic ? settings.storeName : settings.storeNameEn}
            </span>
          )}
        </button>

        {/* Primary navigation — centred */}
        <nav aria-label={isArabic ? 'التنقل الرئيسي' : 'Main'} className="max-lg:hidden">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => {
              const active = location.pathname === link.path;
              return (
                <li key={link.path}>
                  <button
                    type="button"
                    onClick={() => navigate(link.path)}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex h-13 cursor-pointer items-center px-4 text-lc-body transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green ${
                      active
                        ? 'font-semibold text-lc-green-deep'
                        : 'text-lc-muted hover:text-lc-ink'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <span
                        aria-hidden
                        className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-lc-green"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Actions — leftmost under RTL */}
        <div className="flex items-center gap-2">
          {/* Search — 270×54 */}
          <form onSubmit={submitSearch} role="search" className="max-md:hidden">
            <label htmlFor="lc-search" className="sr-only">
              {isArabic ? 'بحث' : 'Search'}
            </label>
            <div className="flex h-[54px] w-[270px] items-center gap-4 rounded-lc-md border-[1.2px] border-lc-border bg-lc-surface px-6 focus-within:border-lc-green">
              <input
                id="lc-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isArabic ? 'ابحث عن منتجات، ماركات وأكثر...' : 'Search products, brands and more...'}
                className="min-w-0 flex-1 bg-transparent text-lc-body text-lc-ink outline-none placeholder:text-lc-muted-soft"
              />
              <button type="submit" aria-label={isArabic ? 'بحث' : 'Search'} className="cursor-pointer">
                <Search className="size-[18px] text-lc-ink-soft" aria-hidden />
              </button>
            </div>
          </form>

          {/* Language selector */}
          <button
            type="button"
            onClick={() => setLanguage(isArabic ? 'en' : 'ar')}
            className="flex h-10 cursor-pointer items-center gap-1 rounded-lc px-2 text-lc-base text-lc-muted transition-colors hover:bg-lc-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green max-lg:hidden"
          >
            <Globe className="size-[14px] text-lc-muted-soft" aria-hidden />
            {isArabic ? 'العربية' : 'English'}
            <ChevronDown className="size-[17px]" aria-hidden />
          </button>

          <Divider />

          {/* Cart stays on every viewport; favourites and account fall back to
              the drawer on small screens to keep the 92px bar from crowding. */}
          <IconAction icon={ShoppingBag} label={isArabic ? 'السلة' : 'Cart'} count={cartCount} onClick={onCartClick} />
          <Divider />
          <IconAction
            icon={Heart}
            label={isArabic ? 'المفضلة' : 'Favorites'}
            count={favCount}
            onClick={onFavoritesClick}
            className="max-sm:hidden"
          />
          <Divider />
          <IconAction
            icon={User}
            label={isArabic ? 'حسابي' : 'Account'}
            onClick={() => navigate('/account')}
            className="max-lg:hidden"
          />

          {/* Drawer trigger — replaces the nav below lg (no Figma mobile frame) */}
          <button
            type="button"
            onClick={onMenuClick}
            aria-label={isArabic ? 'القائمة' : 'Menu'}
            className="flex size-11 cursor-pointer items-center justify-center rounded-lc transition-colors hover:bg-lc-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green lg:hidden"
          >
            <Menu className="size-6 text-lc-ink" aria-hidden />
          </button>
        </div>
      </div>
    </header>
  );
}
