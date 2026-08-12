'use client';
import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Loader2, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from '../lib/navigation';
import { Country, fetchCountries, loginApi, registerApi, checkPhoneExistsApi, CountriesResponse } from '../api/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { AuthPhoneRow, AuthField } from './lobbycare/AuthShell';

// Form validation imports
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const DEFAULT_COUNTRIES: Country[] = [
  { code: '+965', iso: 'kw', name: 'الكويت', phone_start: '5,6,9', phone_length: 8 },
  { code: '+971', iso: 'ae', name: 'الإمارات العربية المتحدة', phone_start: '5', phone_length: 9 },
  { code: '+963', iso: 'sy', name: 'سوريا', phone_start: '9', phone_length: 9 },
];

type Step = 'phone' | 'name';

const createAuthSchema = (step: Step, phoneLength?: number) =>
  z.object({
    phone: z.string().min(1, { message: 'enterPhoneErr' }).refine(
      (val) => (phoneLength === undefined ? true : val.length === phoneLength),
      { message: 'phoneLengthErr' }
    ),
    name: step === 'name' ? z.string().min(1, { message: 'enterFullNameErr' }) : z.string().optional(),
  });

interface AuthFormValues {
  phone: string;
  name: string | undefined;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('phone');

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isArabic = language === 'ar';

  const messageFrom = (res: { response_status?: { validation_errors?: unknown }; msg?: string } | null) => {
    if (!res) return t('loginFailed');
    const ve = res.response_status?.validation_errors;
    if (ve) {
      if (Array.isArray(ve)) return ve.join(' ');
      if (typeof ve === 'object') return Object.values(ve as Record<string, string[]>).flat().join(' ');
    }
    return res.msg || t('loginFailed');
  };

  const schema = React.useMemo(
    () => createAuthSchema(step, selectedCountry?.phone_length),
    [step, selectedCountry]
  );

  const { control, handleSubmit, formState, reset } = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', name: '' },
  });
  const { errors } = formState;

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep('phone');
      setApiError(null);
      setSubmitting(false);
      reset({ phone: '', name: '' });
    }
  }, [isOpen, reset]);

  // Fetch countries metadata on mount
  useEffect(() => {
    let isMounted = true;
    fetchCountries(language)
      .then((res: CountriesResponse) => {
        if (!isMounted) return;
        if (res.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
          setCountries(res.data);
          const kuwait = res.data.find((c) => c.iso.toLowerCase() === 'kw' || c.code === '+965');
          setSelectedCountry(kuwait ?? res.data[0]);
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
      .finally(() => {
        if (isMounted) setLoadingCountries(false);
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const goToVerify = (phone: string, type: 'register' | 'login') => {
    sessionStorage.setItem('verify_phone', phone);
    sessionStorage.setItem('verify_country_code', selectedCountry?.code || '+965');
    sessionStorage.setItem('verify_type', type);
    onClose();
    navigate('/verify');
  };

  const onFormSubmit = async (data: AuthFormValues) => {
    setApiError(null);

    if (step === 'phone') {
      setSubmitting(true);
      try {
        const countryCode = selectedCountry?.code || '+965';
        const exists = await checkPhoneExistsApi({ country_code: countryCode, phone: data.phone }, language);

        if (exists.code !== 200) {
          const errMsg = messageFrom(exists);
          setApiError(errMsg);
          toast.error(errMsg);
          return;
        }

        if (exists.data?.exists) {
          const res = await loginApi({ country_code: countryCode, phone: data.phone }, language);

          if (res.code === 200) {
            toast.success(res.msg || t('verifyOtpDesc'));
            goToVerify(data.phone, 'login');
          } else {
            const errMsg = messageFrom(res);
            setApiError(errMsg);
            toast.error(errMsg);
          }
        } else {
          setStep('name');
        }
      } catch {
        const connectMsg = t('connectionError');
        setApiError(connectMsg);
        toast.error(connectMsg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // step === 'name'
    setSubmitting(true);
    try {
      const res = await registerApi(
        {
          name: data.name!,
          country_code: selectedCountry?.code || '+965',
          phone: data.phone,
        },
        language
      );

      if ((res.code === 201 || res.code === 200) && res.data) {
        toast.success(res.msg || t('verifyOtpDesc'));
        goToVerify(data.phone, 'register');
      } else {
        const errMsg = res.msg || (isArabic ? 'فشل إكمال التسجيل.' : 'Registration failed.');
        setApiError(errMsg);
        toast.error(errMsg);
      }
    } catch {
      const connectMsg = t('connectionError');
      setApiError(connectMsg);
      toast.error(connectMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const msg = (key?: string) => (key ? t(key as Parameters<typeof t>[0]) || key : null);

  const pageTitle = step === 'phone'
    ? (isArabic ? 'تسجيل الدخول أو التسجيل' : 'Login or Register')
    : (isArabic ? 'إنشاء حساب جديد' : 'Create New Account');

  const pageSubtitle = step === 'phone'
    ? (isArabic ? 'أدخل رقم هاتفك للمتابعة' : 'Enter your phone number to continue')
    : (isArabic ? 'يرجى إدخال اسمك لإنشاء حساب جديد' : 'Please enter your name to register');

  const submitButtonText = step === 'phone'
    ? (isArabic ? 'متابعة' : 'Continue')
    : (isArabic ? 'إنشاء الحساب' : 'Create Account');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto" dir={dir}>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal content container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className="relative w-full max-w-md bg-[#fafafa] dark:bg-neutral-900 border border-gray-150 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 md:p-8 z-10 flex flex-col max-h-[90vh] overflow-y-auto no-scrollbar"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className={`absolute top-4 ${isArabic ? 'left-4' : 'right-4'} w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-all cursor-pointer`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Title */}
            <div className="text-center space-y-2 mb-6 mt-2 shrink-0">
              <h2 className="text-xl font-black text-[#1a1a1a] dark:text-white leading-tight">
                {pageTitle}
              </h2>
              <p className="text-gray-500 text-xs leading-relaxed max-w-xs mx-auto">
                {pageSubtitle}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
              {/* Phone Number Input */}
              <div>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field }) => (
                    <div className="relative">
                      <AuthPhoneRow
                        countries={countries}
                        selectedCountry={selectedCountry}
                        onCountryChange={(c) => {
                          setSelectedCountry(c);
                          setApiError(null);
                        }}
                        value={field.value}
                        onChange={(v) => {
                          field.onChange(v);
                          setApiError(null);
                        }}
                        disabled={submitting || loadingCountries || step !== 'phone'}
                        invalid={!!errors.phone}
                        placeholder={selectedCountry ? 'X'.repeat(selectedCountry.phone_length) : 'XXXXXXXX'}
                      />
                    </div>
                  )}
                />
                {errors.phone && (
                  <p className="pt-1 text-[11px] text-red-500">{msg(errors.phone.message)}</p>
                )}
              </div>

              {/* Full Name field (new-number step only) */}
              <AnimatePresence>
                {step === 'name' && (
                  <motion.div
                    key="name-field"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                    className="overflow-hidden"
                  >
                    <Controller
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <div className="relative flex items-center">
                          <AuthField
                            {...field}
                            type="text"
                            autoComplete="name"
                            disabled={submitting}
                            invalid={!!errors.name}
                            placeholder={isArabic ? 'الاسم بالكامل' : 'Full name'}
                            className="ps-10"
                          />
                          <User className="w-4 h-4 text-gray-400 absolute start-3.5 pointer-events-none" />
                        </div>
                      )}
                    />
                    {errors.name && (
                      <p className="pt-1 text-[11px] text-red-500">{msg(errors.name.message)}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {step !== 'phone' && (
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setApiError(null);
                  }}
                  className="text-xs font-bold text-gray-500 hover:underline cursor-pointer"
                >
                  {isArabic ? 'تغيير الرقم' : 'Change number'}
                </button>
              )}

              {/* API Error Warning Card */}
              {apiError && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-semibold leading-relaxed">{apiError}</p>
                </div>
              )}

              {/* Main submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1a1a1a] hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-[#1a1a1a] py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">{step === 'phone' ? (isArabic ? 'جاري التحقق...' : 'Checking...') : (isArabic ? 'جاري التسجيل...' : 'Signing Up...')}</span>
                  </>
                ) : (
                  <span>{submitButtonText}</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
