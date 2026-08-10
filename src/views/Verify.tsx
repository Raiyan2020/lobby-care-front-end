'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from '../lib/navigation';
import { ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { verifyCodeApi, resendCodeApi } from '../api/auth';
import { startSession } from '../utils/auth';
import { toast } from 'sonner';

// Headless input-otp package
// @ts-ignore
import { OTPInput, SlotProps } from 'input-otp';

// Individual OTP slot component styled in shadcn / premium style
function OtpSlot(props: SlotProps) {
  return (
    <div
      className={`w-12 h-12 bg-gray-55 dark:bg-neutral-800 border rounded-2xl flex items-center justify-center font-black text-xl text-[#1a1a1a] dark:text-white transition-all shadow-sm relative ${props.isActive
        ? 'ring-2 ring-[var(--store-secondary-color)] border-transparent bg-white dark:bg-neutral-900'
        : 'border-gray-200 dark:border-neutral-700'
        }`}
    >
      {props.char !== null ? (
        <span className="font-sans leading-none">{props.char}</span>
      ) : null}

      {props.hasFakeCaret && (
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
          <div className="w-px h-6 bg-[#1a1a1a] dark:bg-white" />
        </div>
      )}
    </div>
  );
}

export function Verify() {
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();

  // Verification states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [verifyType, setVerifyType] = useState('register');

  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  // Countdown timer state
  const [countdown, setCountdown] = useState(40);
  const [resending, setResending] = useState(false);

  // Retrieve verify credentials on mount
  useEffect(() => {
    const storedPhone = sessionStorage.getItem('verify_phone') || '';
    const storedCode = sessionStorage.getItem('verify_country_code') || '';
    const storedType = sessionStorage.getItem('verify_type') || 'register';

    if (!storedPhone) {
      toast.error(language === 'ar' ? 'بيانات التفعيل غير موجودة. يرجى تسجيل الدخول أو التسجيل.' : 'Verification session expired.');
      navigate('/login', { replace: true });
      return;
    }

    setPhoneNumber(storedPhone);
    setCountryCode(storedCode);
    setVerifyType(storedType);
  }, [navigate, language]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Trigger verify code API call when OTP code reaches length 4
  const handleComplete = async (code: string) => {
    setError(null);
    setVerifying(true);

    try {
      const res = await verifyCodeApi({
        country_code: countryCode,
        phone: phoneNumber,
        code,
        type: 'register',
      }, language);

      if (res.code === 200 && res.data) {
        setSuccess(true);
        toast.success(res.msg || t('otpSuccess'));

        // Start login session with details + token
        startSession(res.data);

        // Clear verification session storage
        sessionStorage.removeItem('verify_phone');
        sessionStorage.removeItem('verify_country_code');
        sessionStorage.removeItem('verify_type');

        // Redirect after delay
        setTimeout(() => {
          const redirectPath = localStorage.getItem('auth_redirect') || '/home';
          localStorage.removeItem('auth_redirect');
          window.location.href = redirectPath;
        }, 1000);
      } else {
        const errMsg = res.msg || t('otpError');
        setError(errMsg);
        toast.error(errMsg);
        setOtpCode(''); // Clear on error to re-enter
      }
    } catch (err) {
      setError(t('connectionError'));
      toast.error(t('connectionError'));
    } finally {
      setVerifying(false);
    }
  };

  const handleOTPChange = (val: string) => {
    setOtpCode(val);
    if (val.length === 6) {
      handleComplete(val);
    }
  };

  // Handle Resend Verification Code
  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await resendCodeApi({
        country_code: countryCode,
        phone: phoneNumber,
        type: 'register',
      }, language);

      if (res.code === 200) {
        toast.success(res.msg || t('otpResent'));
        setCountdown(40); // Reset timer to 40 seconds
      } else {
        toast.error(res.msg || (language === 'ar' ? 'فشل إعادة إرسال الرمز.' : 'Failed to resend code.'));
      }
    } catch (err) {
      toast.error(t('connectionError'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col pb-24 pt-4 min-h-[80vh] bg-[#fafafa] dark:bg-neutral-900/10 justify-center px-6">
      <div className="w-full max-w-md mx-auto space-y-8">

        {/* Back button */}
        <div className={`flex ${dir === 'rtl' ? 'justify-end' : 'justify-start'}`}>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--store-secondary-color)] transition-colors select-none"
          >
            <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            <span>{t('back')}</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white">
            {t('verifyOtpTitle')}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('verifyOtpDesc')}
          </p>
          <p className="text-[var(--store-secondary-color)] font-bold tracking-widest font-sans" dir="ltr">
            ({countryCode}) {phoneNumber}
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-6">

          <div className="space-y-4">
            <label className="block text-center text-sm font-bold text-gray-700 dark:text-gray-200">
              {language === 'ar' ? 'أدخل الرمز المكون من 6 أرقام' : 'Enter the 6-digit verification code'}
            </label>

            {/* Shadcn style input-otp component rendering */}
            <div className="flex justify-center select-none" dir="ltr">
              <OTPInput
                maxLength={6}
                value={otpCode}
                onChange={handleOTPChange}
                disabled={verifying || success}
                render={({ slots }) => (
                  <div className="flex gap-2 flex-wrap justify-center">
                    {slots.map((slot, idx) => (
                      <OtpSlot key={idx} {...slot} />
                    ))}
                  </div>
                )}
              />
            </div>
          </div>

          {/* Verification Status Feedback */}
          {verifying && (
            <div className="flex items-center justify-center gap-2 text-[var(--store-secondary-color)] font-bold text-sm py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t('verifyingOtp')}
            </div>
          )}

          {success && (
            <div className="flex items-center justify-center gap-2 text-green-600 font-bold text-sm py-2">
              <ShieldCheck className="w-6 h-6 animate-bounce" />
              {t('otpSuccess')}
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">{error}</p>
            </div>
          )}

        </div>

        {/* Resend instructions */}
        <div className="text-center select-none">
          {countdown > 0 ? (
            <p className="text-gray-400 text-xs font-bold transition-all">
              {t('resendCodeIn')} <span className="text-indigo-600 dark:text-indigo-400 font-sans">{countdown}</span> {t('seconds')}
            </p>
          ) : (
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="text-[var(--store-secondary-color)] hover:underline text-xs font-black transition-colors cursor-pointer disabled:opacity-50"
            >
              {resending ? (
                <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
              ) : null}
              {t('resendCodeButton')}
            </button>
          )}
        </div>

      </div>

      {/* Embedded CSS animation for blinking caret */}
      <style>{`
        @keyframes caret-blink {
          0%, 70%, 100% { opacity: 1; }
          20%, 50% { opacity: 0; }
        }
        .animate-caret-blink {
          animation: caret-blink 1s infinite;
        }
      `}</style>
    </div>
  );
}
