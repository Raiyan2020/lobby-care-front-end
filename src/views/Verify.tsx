'use client';
/**
 * OTP verification — Figma "تاكيد ع رقم الجوال" (node 80:18449) and its
 * success state "تم التحقق بنجاح" (node 80:18757).
 *
 *   card      420 wide, radius 20, pad 40/44, flat (no shadow in Figma)
 *   heading   IBM Plex Sans Arabic 700 · 24/36
 *   sub       400 · 14/24 · #888888, 10px below the heading
 *   phone     700 · 16/24 · #1a1a1a, 6px below the sub
 *   slots     six 52×56 boxes, 10px apart, radius 10, 1.3px #d8d0c4
 *   resend    14/21 · #888888, 20px above and below
 *   button    332×52, bg #4a7a35, radius 10, 700 · 16/24
 *   success   80×80 #4a7a35 circle with a white check, then heading + copy
 *
 * All verification behaviour is unchanged: session-storage handoff, auto-submit
 * at six digits, 40s resend countdown, and the post-auth redirect.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { verifyCodeApi, resendCodeApi } from '../api/auth';
import { startSession, resolvePostAuthRedirect } from '../utils/auth';
import { toast } from 'sonner';
import {
  AuthShell,
  AuthHeading,
  AuthSubmit,
  AuthError,
  AUTH_ARTWORK,
} from '../components/lobbycare/AuthShell';

import { OTPInput, type SlotProps } from 'input-otp';

/**
 * A single code box — 52×56 at desktop, per Figma. Six boxes plus five 10px
 * gaps measure 362px against a 332px card interior, so Figma lets the row
 * bleed past the card padding; `-mx-[15px]` on the row reproduces that rather
 * than letting the sixth box wrap. Below `sm` the boxes step down so the row
 * still fits a 360px viewport on one line.
 */
function OtpSlot(props: SlotProps) {
  return (
    <div
      className={`relative flex h-12 w-10 shrink-0 items-center justify-center rounded-lc border-[1.3px] bg-white text-[20px] font-bold text-lc-ink transition-colors sm:h-[56px] sm:w-[52px] ${
        props.isActive ? 'border-lc-green' : 'border-lc-border-warm'
      }`}
    >
      {props.char !== null ? <span className="leading-none">{props.char}</span> : null}
      {props.hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-px animate-pulse bg-lc-ink" />
        </div>
      )}
    </div>
  );
}

export function Verify() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [, setVerifyType] = useState('register');

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  const [countdown, setCountdown] = useState(40);
  const [resending, setResending] = useState(false);

  // Retrieve verify credentials on mount
  useEffect(() => {
    const storedPhone = sessionStorage.getItem('verify_phone') || '';
    const storedCode = sessionStorage.getItem('verify_country_code') || '';
    const storedType = sessionStorage.getItem('verify_type') || 'register';

    if (!storedPhone) {
      toast.error(
        isArabic
          ? 'بيانات التفعيل غير موجودة. يرجى تسجيل الدخول أو التسجيل.'
          : 'Verification session expired.'
      );
      navigate('/login', { replace: true });
      return;
    }

    setPhoneNumber(storedPhone);
    setCountryCode(storedCode);
    setVerifyType(storedType);
  }, [navigate, isArabic]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleComplete = async (code: string) => {
    setError(null);
    setVerifying(true);

    try {
      const res = await verifyCodeApi(
        { country_code: countryCode, phone: phoneNumber, code, type: 'register' },
        language
      );

      if (res.code === 200 && res.data) {
        setSuccess(true);
        toast.success(res.msg || t('otpSuccess'));

        startSession(res.data);

        sessionStorage.removeItem('verify_phone');
        sessionStorage.removeItem('verify_country_code');
        sessionStorage.removeItem('verify_type');

        setTimeout(() => {
          window.location.href = resolvePostAuthRedirect();
        }, 1500);
      } else {
        const errMsg = res.msg || t('otpError');
        setError(errMsg);
        toast.error(errMsg);
        setOtpCode('');
      }
    } catch {
      setError(t('connectionError'));
      toast.error(t('connectionError'));
    } finally {
      setVerifying(false);
    }
  };

  const handleOTPChange = (val: string) => {
    setOtpCode(val);
    if (val.length === 6) handleComplete(val);
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await resendCodeApi(
        { country_code: countryCode, phone: phoneNumber, type: 'register' },
        language
      );

      if (res.code === 200) {
        toast.success(res.msg || t('otpResent'));
        setCountdown(40);
      } else {
        toast.error(res.msg || (isArabic ? 'فشل إعادة إرسال الرمز.' : 'Failed to resend code.'));
      }
    } catch {
      toast.error(t('connectionError'));
    } finally {
      setResending(false);
    }
  };

  const mmss = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`;

  // ── Verified state — Figma node 80:18757 ─────────────────────────────────
  if (success) {
    return (
      <AuthShell artwork={AUTH_ARTWORK.verified} artworkSide="right" elevated={false} artworkRatio="628/418">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-20 items-center justify-center rounded-full bg-lc-green-dark">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
              <path
                d="M11 20.5 17 26.5 29 13.5"
                stroke="#ffffff"
                strokeWidth="4.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="pt-5">
            <AuthHeading size={26}>{isArabic ? 'تم التحقق بنجاح' : 'Verified successfully'}</AuthHeading>
          </div>

          <p dir="auto" className="pt-3 pb-7 text-[14px] leading-[24px] text-[#888888]">
            {isArabic
              ? 'تم التحقق من حسابك بنجاح يمكنك الآن تسجيل الدخول والاستمتاع بتجربة تسوق أفضل.'
              : 'Your account has been verified. You can now sign in and enjoy a better shopping experience.'}
          </p>

          <AuthSubmit onClick={() => { window.location.href = resolvePostAuthRedirect(); }}>
            {isArabic ? 'الانتقال لتسجيل الدخول' : 'Continue'}
          </AuthSubmit>
        </div>
      </AuthShell>
    );
  }

  // ── OTP entry — Figma node 80:18449 ──────────────────────────────────────
  return (
    <AuthShell artwork={AUTH_ARTWORK.otp} artworkSide="left" elevated={false} artworkRatio="557/557">
      <AuthHeading size={24}>{isArabic ? 'تأكيد رقم الجوال' : 'Verify your phone'}</AuthHeading>

      <div className="pt-2.5">
        <p dir="auto" className="text-[14px] leading-[24px] text-[#888888]">
          {isArabic ? 'أدخل الرمز المرسل للتحقق إلى رقم الجوال' : 'Enter the code sent to your phone number'}
        </p>
      </div>

      <p dir="ltr" className="pt-1.5 text-start text-[16px] font-bold leading-[24px] text-lc-ink">
        ({countryCode}) {phoneNumber}
      </p>

      <div className="flex justify-center pt-6" dir="ltr">
        <OTPInput
          maxLength={6}
          value={otpCode}
          onChange={handleOTPChange}
          disabled={verifying}
          render={({ slots }: { slots: SlotProps[] }) => (
            <div className="flex flex-nowrap justify-center gap-1.5 sm:-mx-[15px] sm:gap-2.5">
              {slots.map((slot, idx) => (
                <OtpSlot key={idx} {...slot} />
              ))}
            </div>
          )}
        />
      </div>

      {error && (
        <div className="pt-4">
          <AuthError>{error}</AuthError>
        </div>
      )}

      <div className="py-5 text-center">
        {countdown > 0 ? (
          <p className="text-[14px] leading-[21px] text-[#888888]">
            {isArabic ? `لم تصلك الرسالة؟ إعادة الإرسال خلال ${mmss}` : `Didn't get it? Resend in ${mmss}`}
          </p>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="cursor-pointer text-[14px] font-semibold leading-[21px] text-lc-green-deep transition-opacity hover:opacity-80 disabled:opacity-60"
          >
            {resending
              ? isArabic ? 'جاري الإرسال...' : 'Sending...'
              : isArabic ? 'إعادة إرسال الرمز' : 'Resend code'}
          </button>
        )}
      </div>

      <AuthSubmit
        loading={verifying}
        disabled={otpCode.length !== 6}
        onClick={() => handleComplete(otpCode)}
      >
        {isArabic ? 'تأكيد' : 'Confirm'}
      </AuthSubmit>
    </AuthShell>
  );
}
