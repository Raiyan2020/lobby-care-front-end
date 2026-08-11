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
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from '../lib/navigation';
import { isSafeInternalPath } from '../utils/internalPath';

export function Welcome() {
  const { dir, language } = useLanguage();
  const { settings } = useStore();
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const isArabic = language === 'ar';
  const reduceMotion = useReducedMotion();

  // The middleware forwards the originally requested page; carry it through so
  // the user lands where they intended once authenticated.
  const requestedRedirect = searchParams.get('redirect');
  const redirect = isSafeInternalPath(requestedRedirect)
    ? requestedRedirect
    : null;
  const withRedirect = (path: string) =>
    redirect ? `${path}?redirect=${encodeURIComponent(redirect)}` : path;

  const rise = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div dir={dir} className="flex flex-1 flex-col bg-lc-canvas">
      <section className="lc-container flex flex-1 flex-col-reverse items-center justify-between gap-10 py-10 lg:flex-row lg:items-center lg:py-16">
        {/* Artwork — authored first so RTL renders it on the right, per Figma */}
        <motion.div
          {...(reduceMotion
            ? {}
            : {
                initial: { opacity: 0, scale: 0.98 },
                animate: { opacity: 1, scale: 1 },
                transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
              })}
          className="relative aspect-[601/557] w-full max-w-[601px] shrink-0 overflow-hidden rounded-lc-3xl lg:w-[601px]"
        >
          <Image
            src="/lobbycare/welcome-hero.jpg"
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 601px"
            className="object-cover"
          />
        </motion.div>

        {/* Card column — 420 wide, logo above the card */}
        <motion.div {...rise} className="flex w-full max-w-[420px] flex-col items-center gap-6">
          {settings.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logoUrl}
              alt={isArabic ? settings.storeName : settings.storeNameEn}
              className="h-40 w-auto object-contain"
            />
          ) : null}

          <div className="w-full rounded-lc-3xl bg-white px-11 py-10 shadow-lc-card">
            <h1 className="font-sans text-[26px] leading-[38px] font-bold text-lc-ink">
              {isArabic ? 'مرحباً بك في لوبي كير' : 'Welcome to Lobby Care'}
            </h1>

            <p className="mt-3 text-[15px] leading-[25px] text-lc-muted">
              {isArabic
                ? 'نمنحك منتجات العناية الطبيعية بأجود المكونات النقية.'
                : 'Natural care products made with the purest ingredients.'}
            </p>

            <div className="mt-7 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => navigate(withRedirect('/login'))}
                className="flex h-13 w-full cursor-pointer items-center justify-center rounded-lc bg-lc-green-dark text-lc-md font-bold text-white transition-colors hover:bg-lc-green-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green"
              >
                {isArabic ? 'تسجيل الدخول' : 'Sign in'}
              </button>

              <button
                type="button"
                onClick={() => navigate(withRedirect('/register'))}
                className="flex h-13 w-full cursor-pointer items-center justify-center rounded-lc border-[1.3px] border-lc-border-warm text-lc-body font-medium text-lc-ink transition-colors hover:bg-lc-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green"
              >
                {isArabic ? 'إنشاء حساب جديد' : 'Create a new account'}
              </button>
            </div>

            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="group flex cursor-pointer items-center gap-1.5 text-lc-base text-lc-muted-soft transition-colors hover:text-lc-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green"
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
          </div>
        </motion.div>
      </section>
    </div>
  );
}
