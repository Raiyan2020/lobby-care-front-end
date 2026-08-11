'use client';
/**
 * Welcome — auth gateway.
 *
 * Implements Figma frame "مرحبا" (node 80:18152), the entry point that offers
 * sign in / register / continue-as-guest. Measured from the node tree:
 *
 *   section    bg #f9f7f3, row SPACE_BETWEEN, pad 64/80/80/240
 *   card       420×367, radius 20, pad 40/44, shadow 0 4px 40px rgba(0,0,0,.08)
 *   heading    IBM Plex Sans Arabic 700 · 25.6/38 · #1a1a1a
 *   body       400 · 14.7/25 · #666, 12px above
 *   buttons    52px tall, radius 10, 12px apart, 28px above
 *              primary   bg #4a7a35, 700 16/24, white
 *              secondary 1.3px #d8d0c4 border, 500 15.2/23, #1a1a1a
 *   guest link 400 · 14.4/22 · #888 with a 16px chevron, 20px above
 *
 * Figma places the card left and the artwork right. Because the app renders
 * under dir="rtl", the artwork is authored first so the rendered order matches.
 * The fractional Figma type sizes (25.6/14.72/15.2/14.4) come from a scaled
 * instance and are rounded to whole pixels.
 */
import { useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from '../lib/navigation';
import { AuthShell, AuthHeading, AuthSubmit, AUTH_ARTWORK } from '../components/lobbycare/AuthShell';
import { isSafeInternalPath } from '../utils/internalPath';

export function Welcome() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const isArabic = language === 'ar';

  // The middleware forwards the originally requested page; carry it through so
  // the user lands where they intended once authenticated.
  const requestedRedirect = searchParams.get('redirect');
  const redirect = isSafeInternalPath(requestedRedirect) ? requestedRedirect : null;
  const withRedirect = (path: string) =>
    redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;

  return (
    <AuthShell artwork={AUTH_ARTWORK.welcome} artworkSide="right" artworkRatio="601/557">
      <AuthHeading size={26}>{isArabic ? 'مرحباً بك في لوبي كير' : 'Welcome to Lobby Care'}</AuthHeading>

      <p dir="auto" className="pt-3 text-[15px] leading-[25px] text-lc-muted">
        {isArabic
          ? 'نمنحك منتجات العناية الطبيعية بأجود المكونات النقية.'
          : 'Natural care products made with the purest ingredients.'}
      </p>

      <div className="flex flex-col gap-3 pt-7">
        <AuthSubmit onClick={() => navigate(withRedirect('/login'))}>
          {isArabic ? 'تسجيل الدخول' : 'Sign in'}
        </AuthSubmit>

        <button
          type="button"
          onClick={() => navigate(withRedirect('/register'))}
          className="flex h-[52px] w-full cursor-pointer items-center justify-center rounded-lc border-[1.3px] border-lc-border-warm text-[15px] font-medium leading-[23px] text-lc-ink transition-colors hover:bg-lc-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green"
        >
          {isArabic ? 'إنشاء حساب جديد' : 'Create a new account'}
        </button>
      </div>

      <div className="flex justify-center pt-5">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="group flex cursor-pointer items-center gap-1.5 text-[14px] leading-[22px] text-[#888888] transition-colors hover:text-lc-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green"
        >
          {isArabic ? 'متابعة كزائر' : 'Continue as a guest'}
          <ChevronLeft
            className={`size-4 transition-transform group-hover:-translate-x-0.5 ${
              dir === 'ltr' ? 'rotate-180 group-hover:translate-x-0.5' : ''
            }`}
            aria-hidden
          />
        </button>
      </div>
    </AuthShell>
  );
}
