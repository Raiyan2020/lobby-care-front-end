'use client';
/**
 * LOBBY CARE auth layout + form primitives.
 *
 * Every auth frame in Figma ("مرحبا", "تسجيل دخول", "انشاء حساب",
 * "تاكيد ع رقم الجوال", "تم التحقق بنجاح") shares one composition:
 *
 *   section   bg #f9f7f3, row SPACE_BETWEEN, 64px top / 80px bottom padding
 *   column    420 wide — a 131×160 logo, 24px gap, then the card
 *   card      420 wide, radius 20, 40px vertical / 44px horizontal padding
 *   heading   IBM Plex Sans Arabic 700 · 24–26 / 36–38 · #1a1a1a
 *   sub       400 · 14 / 21–24 · #888888
 *   field     47px tall, 1.3px #d8d0c4 border, radius 10 (12 on the phone row)
 *   button    52px tall, bg #4a7a35, radius 10, 700 · 16/24 white
 *
 * The artwork side alternates across the flow — Login and OTP place it on the
 * left, Welcome/Register/Verified on the right — so `artworkSide` mirrors the
 * DOM order under dir="rtl" to match each frame's measured x-positions.
 *
 * Only Login, Register and Welcome carry the 0 4px 40px card shadow; the OTP
 * and Verified cards are flat in Figma, hence `elevated`.
 */
import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';
// @ts-expect-error — country-code-emoji ships no type declarations.
import { countryCodeEmoji } from 'country-code-emoji';
import { useStore } from '../../contexts/StoreContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Country } from '../../api/auth';

function countryFlag(iso: string): string {
  try {
    return countryCodeEmoji(iso) as string;
  } catch {
    return '🏳️';
  }
}

export const AUTH_ARTWORK = {
  login: '/lobbycare/auth-login.jpg',
  register: '/lobbycare/auth-register.jpg',
  otp: '/lobbycare/auth-otp.jpg',
  verified: '/lobbycare/auth-verified.jpg',
  welcome: '/lobbycare/welcome-hero.jpg',
} as const;

interface AuthShellProps {
  children: React.ReactNode;
  artwork: string;
  /** Which side the artwork sits on at desktop, per the Figma frame. */
  artworkSide: 'left' | 'right';
  /** Figma gives the card a drop shadow on Login/Register/Welcome only. */
  elevated?: boolean;
  /** Intrinsic artwork ratio, so the image never distorts as it scales. */
  artworkRatio?: string;
}

export function AuthShell({
  children,
  artwork,
  artworkSide,
  elevated = true,
  artworkRatio = '597/557',
}: AuthShellProps) {
  const { dir } = useLanguage();
  const { settings } = useStore();
  const reduceMotion = useReducedMotion();

  const rise = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  const art = (
    <motion.div
      {...(reduceMotion
        ? {}
        : {
            initial: { opacity: 0, scale: 0.98 },
            animate: { opacity: 1, scale: 1 },
            transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
          })}
      className="relative w-full max-w-[601px] shrink-0 overflow-hidden rounded-lc-3xl max-lg:hidden lg:w-[46%]"
      style={{ aspectRatio: artworkRatio }}
    >
      <Image src={artwork} alt="" fill priority sizes="(max-width: 1024px) 0px, 601px" className="object-cover" />
    </motion.div>
  );

  const column = (
    <motion.div {...rise} className="flex w-full max-w-[420px] flex-col items-center gap-6">
      {settings.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={settings.logoUrl} alt="" className="h-[120px] w-auto object-contain lg:h-40" />
      ) : null}
      <div
        className={`w-full rounded-lc-3xl bg-white px-[30px] py-8 sm:px-11 sm:py-10 ${
          elevated ? 'shadow-lc-card' : ''
        }`}
      >
        {children}
      </div>
    </motion.div>
  );

  // Under RTL the first child renders right, so the DOM order is flipped
  // relative to the visual side the design specifies.
  const cardFirst = artworkSide === 'left';

  return (
    <div dir={dir} className="flex flex-1 flex-col bg-lc-canvas">
      <section className="lc-container flex flex-1 flex-col items-center justify-between gap-10 py-10 lg:flex-row lg:items-center lg:py-16">
        {cardFirst ? (
          <>
            {column}
            {art}
          </>
        ) : (
          <>
            {art}
            {column}
          </>
        )}
      </section>
    </div>
  );
}

/* ── Card typography ──────────────────────────────────────────────────────── */

export function AuthHeading({ children, size = 26 }: { children: React.ReactNode; size?: 24 | 26 }) {
  return (
    <h1
      dir="auto"
      className="font-sans font-bold text-lc-ink"
      style={{ fontSize: size, lineHeight: size === 26 ? '38px' : '36px' }}
    >
      {children}
    </h1>
  );
}

export function AuthSubheading({ children, gap = 6 }: { children: React.ReactNode; gap?: number }) {
  return (
    <p dir="auto" className="text-[14px] leading-[21px] text-[#888888]" style={{ marginTop: gap }}>
      {children}
    </p>
  );
}

/* ── Form primitives ──────────────────────────────────────────────────────── */

const FIELD =
  'h-[47px] w-full rounded-lc border-[1.3px] border-lc-border-warm bg-white px-4 text-[15px] leading-[23px] text-lc-ink outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-lc-green disabled:opacity-60';

export function AuthField({
  invalid,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      aria-invalid={invalid || undefined}
      className={`${FIELD} ${invalid ? 'border-lc-danger' : ''} ${className}`}
    />
  );
}

/** Password field with the 17px lock glyph Figma places on the reading edge. */
export function AuthPasswordField({
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <div
      className={`flex h-[47px] w-full items-center gap-2 rounded-lc border-[1.3px] bg-white px-4 transition-colors focus-within:border-lc-green ${
        invalid ? 'border-lc-danger' : 'border-lc-border-warm'
      }`}
    >
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden className="shrink-0">
        <rect x="2.5" y="7" width="12" height="8" rx="2" stroke="#aaaaaa" strokeWidth="1.3" />
        <path d="M5.5 7V5a3 3 0 0 1 6 0v2" stroke="#aaaaaa" strokeWidth="1.3" />
      </svg>
      <input
        {...props}
        type="password"
        aria-invalid={invalid || undefined}
        className="min-w-0 flex-1 bg-transparent text-[15px] leading-[23px] text-lc-ink outline-none placeholder:text-[#bbbbbb]"
      />
    </div>
  );
}

export function AuthSubmit({
  loading,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className="flex h-[52px] w-full items-center justify-center rounded-lc bg-lc-green-dark text-[16px] font-bold leading-[24px] text-white transition-colors hover:bg-lc-green-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lc-green disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Phone row — Figma splits it into a 122px country selector and a flexible
 * number field, both 47px tall with radius 12. Figma lists the number field
 * first (left-to-right); authored here in RTL order so the selector lands on
 * the reading-start edge as drawn.
 */
export function AuthPhoneRow({
  countries,
  selectedCountry,
  onCountryChange,
  value,
  onChange,
  disabled,
  invalid,
  placeholder,
}: {
  countries: Country[];
  selectedCountry: Country | null;
  onCountryChange: (c: Country) => void;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  invalid?: boolean;
  placeholder?: string;
}) {
  const border = invalid ? 'border-lc-danger' : 'border-lc-border-warm';
  return (
    <div className="flex w-full items-center gap-2">
      <div
        className={`relative flex h-[47px] w-[122px] shrink-0 items-center gap-1.5 rounded-lc-md border-[1.3px] bg-white px-3.5 ${border}`}
      >
        <span aria-hidden className="text-[16px] leading-none">
          {selectedCountry ? countryFlag(selectedCountry.iso) : '🏳️'}
        </span>
        <span className="text-[15px] leading-[23px] text-lc-ink" dir="ltr">
          {selectedCountry?.code ?? '+965'}
        </span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden className="ms-auto shrink-0">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="#666666" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        <select
          aria-label="country"
          disabled={disabled}
          value={selectedCountry?.code ?? ''}
          onChange={(e) => {
            const next = countries.find((c) => c.code === e.target.value);
            if (next) onCountryChange(next);
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {countries.map((c) => (
            <option key={`${c.iso}${c.code}`} value={c.code}>
              {c.name} ({c.code})
            </option>
          ))}
        </select>
      </div>

      <input
        type="tel"
        inputMode="numeric"
        dir="ltr"
        disabled={disabled}
        aria-invalid={invalid || undefined}
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        placeholder={placeholder}
        maxLength={selectedCountry?.phone_length}
        className={`h-[47px] min-w-0 flex-1 rounded-lc-md border-[1.3px] bg-white px-3.5 text-[15px] leading-[23px] text-lc-ink outline-none transition-colors placeholder:text-[#bbbbbb] focus:border-lc-green disabled:opacity-60 ${border}`}
      />
    </div>
  );
}

/** Inline API/validation error, styled on the design's danger tokens. */
export function AuthError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <p
      role="alert"
      dir="auto"
      className="rounded-lc-sm bg-lc-danger-bg px-3 py-2 text-[13px] leading-[20px] text-lc-danger"
    >
      {children}
    </p>
  );
}
