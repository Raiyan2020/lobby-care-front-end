'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { ArrowLeft, AlertCircle, Loader2, ShieldQuestion } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PhoneInput } from '../components/PhoneInput';
import { Country, fetchCountries, forgotPasswordApi } from '../api/auth';
import { toast } from 'sonner';

const DEFAULT_COUNTRIES: Country[] = [
  { code: '+965', iso: 'kw', name: 'الكويت', phone_start: '5,6,9', phone_length: 8 },
  { code: '+971', iso: 'ae', name: 'الإمارات العربية المتحدة', phone_start: '5', phone_length: 9 },
  { code: '+963', iso: 'sy', name: 'سوريا', phone_start: '9', phone_length: 9 },
];

export function ForgotPassword() {
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchCountries(language)
      .then((res) => {
        if (!isMounted) return;
        if (res.code === 200 && Array.isArray(res.data)) {
          setCountries(res.data);
          const kuwait = res.data.find((c) => c.iso.toLowerCase() === 'kw' || c.code === '+965');
          setSelectedCountry(kuwait || res.data[0] || DEFAULT_COUNTRIES[0]);
        } else {
          setCountries(DEFAULT_COUNTRIES);
          setSelectedCountry(DEFAULT_COUNTRIES[0]);
        }
      })
      .catch(() => {
        if (isMounted) {
          setCountries(DEFAULT_COUNTRIES);
          setSelectedCountry(DEFAULT_COUNTRIES[0]);
        }
      })
      .finally(() => { if (isMounted) setLoadingCountries(false); });

    return () => { isMounted = false; };
  }, [language]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);
    setApiError(null);

    if (!phone.trim()) {
      setPhoneError(language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Please enter your phone number');
      return;
    }
    if (selectedCountry && phone.length !== selectedCountry.phone_length) {
      setPhoneError(
        language === 'ar'
          ? `رقم الهاتف يجب أن يكون ${selectedCountry.phone_length} أرقام`
          : `Phone must be ${selectedCountry.phone_length} digits`
      );
      return;
    }

    setSubmitting(true);
    try {
      const res = await forgotPasswordApi(
        { country_code: selectedCountry?.code || '+965', phone },
        language
      );

      if (res.code === 200) {
        toast.success(res.msg || (language === 'ar' ? 'تم إرسال رمز التحقق' : 'Verification code sent'));
        // Store credentials for the OTP + reset steps
        sessionStorage.setItem('forgot_phone', res.data?.phone || phone);
        sessionStorage.setItem('forgot_country_code', res.data?.country_code || selectedCountry?.code || '+965');
        navigate('/forgot-password/verify');
      } else {
        const msg = res.msg || (language === 'ar' ? 'فشل الإرسال. حاول مجدداً.' : 'Failed to send. Try again.');
        setApiError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = language === 'ar' ? 'خطأ في الاتصال. حاول مجدداً.' : 'Connection error. Try again.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col pb-24 pt-4 min-h-[80vh] bg-[#fafafa] dark:bg-neutral-900/10 justify-center px-6">
      <div className="w-full max-w-md mx-auto space-y-8">

        {/* Back button */}
        <div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--store-secondary-color)] transition-colors select-none"
          >
            <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            <span>{t('back')}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl bg-[var(--store-secondary-color)]/10 flex items-center justify-center">
              <ShieldQuestion className="w-8 h-8 text-[var(--store-secondary-color)]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white">
            {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {language === 'ar'
              ? 'أدخل رقم هاتفك وسنرسل لك رمز التحقق لإعادة تعيين كلمة المرور'
              : 'Enter your phone number and we\'ll send you a verification code to reset your password'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-5"
        >
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-200 block">
              {t('phoneNumberLabel')}
            </label>
            <PhoneInput
              countries={countries}
              selectedCountry={selectedCountry}
              onCountryChange={(c) => { setSelectedCountry(c); setPhoneError(null); setApiError(null); }}
              phoneNumber={phone}
              onPhoneNumberChange={(val) => { setPhone(val); setPhoneError(null); setApiError(null); }}
              disabled={submitting || loadingCountries}
              placeholder={selectedCountry ? 'X'.repeat(selectedCountry.phone_length) : 'XXXXXXXX'}
            />
            {phoneError && (
              <p className="text-xs text-red-500 font-semibold mt-1">{phoneError}</p>
            )}
          </div>

          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in duration-200">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs font-semibold leading-relaxed">{apiError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#1a1a1a] hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-[#1a1a1a] py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-gray-900/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}</span>
              </>
            ) : (
              <span>{language === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'}</span>
            )}
          </button>

          <div className="text-center pt-2 border-t border-gray-100 dark:border-neutral-800">
            <p className="text-xs text-gray-400 font-medium">
              {language === 'ar' ? 'تذكرت كلمة المرور؟' : 'Remember your password?'}{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-[var(--store-secondary-color)] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            </p>
          </div>
        </form>

      </div>
    </div>
  );
}
