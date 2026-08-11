'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { Mail, ArrowLeft, AlertCircle, Loader2, User, Lock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PhoneInput } from '../components/PhoneInput';
import { Country, fetchCountries, loginApi, registerApi, checkPhoneExistsApi, CountriesResponse } from '../api/auth';
import { startSession, getOrGenerateDeviceId, resolvePostAuthRedirect, persistPostAuthRedirect } from '../utils/auth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// shadcn UI & Form components
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../components/ui/form';
import { Input } from '../components/ui/input';

// Form validation imports
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const DEFAULT_COUNTRIES: Country[] = [
  {
    code: "+965",
    iso: "kw",
    name: "الكويت",
    phone_start: "5,6,9",
    phone_length: 8
  },
  {
    code: "+971",
    iso: "ae",
    name: "الإمارات العربية المتحدة",
    phone_start: "5",
    phone_length: 9
  },
  {
    code: "+963",
    iso: "sy",
    name: "سوريا",
    phone_start: "9",
    phone_length: 9
  }
];

const createAuthSchema = (step: 'phone' | 'password' | 'register', phoneLength?: number) => {
  return z.object({
    phone: z.string().min(1, { message: 'enterPhoneErr' }).refine(
      (val) => {
        if (phoneLength === undefined) return true;
        return val.length === phoneLength;
      },
      { message: 'phoneLengthErr' }
    ),
    name: step === 'register' ? z.string().min(1, { message: 'enterFullNameErr' }) : z.string().optional(),
    email: step === 'register' ? z.string().min(1, { message: 'enterEmailErr' }).email({ message: 'invalidEmailErr' }) : z.string().optional(),
    password: step !== 'phone' ? z.string().min(6, { message: 'passwordMinLengthErr' }) : z.string().optional(),
    password_confirmation: step === 'register' ? z.string().min(6, { message: 'passwordMinLengthErr' }) : z.string().optional(),
  }).refine((data) => {
    if (step === 'register') {
      return data.password === data.password_confirmation;
    }
    return true;
  }, {
    message: 'passwordsMustMatchErr',
    path: ['password_confirmation'],
  });
};

export function Login() {
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState<'phone' | 'password' | 'register'>('phone');

  // Country selector states
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Form submit & API states
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const getMessageFromResponse = (res: any) => {
    if (!res) return t('loginFailed');
    if (res.response_status?.validation_errors) {
      const errors = res.response_status.validation_errors;
      if (Array.isArray(errors)) return errors.join(' ');
      return Object.values(errors).flat().join(' ');
    }
    return res.msg || t('loginFailed');
  };

  // Custom dynamic resolver using current step and selected country
  const formResolver = React.useCallback(
    (values: any, context: any, options: any) => {
      const currentSchema = createAuthSchema(step, selectedCountry?.phone_length);
      return zodResolver(currentSchema)(values, context, options);
    },
    [step, selectedCountry]
  );

  const form = useForm({
    resolver: formResolver,
    defaultValues: {
      phone: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  const { control, handleSubmit, watch } = form;

  // Fetch countries metadata on mount
  useEffect(() => {
    let isMounted = true;
    fetchCountries(language)
      .then((res: CountriesResponse) => {
        if (!isMounted) return;
        if (res.code === 200 && Array.isArray(res.data)) {
          setCountries(res.data);
          const kuwait = res.data.find(
            (c) => c.iso.toLowerCase() === 'kw' || c.code === '+965'
          );
          if (kuwait) {
            setSelectedCountry(kuwait);
          } else if (res.data.length > 0) {
            setSelectedCountry(res.data[0]);
          }
        } else {
          setCountries(DEFAULT_COUNTRIES);
          setSelectedCountry(DEFAULT_COUNTRIES[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load countries', err);
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

  const onFormSubmit = async (data: any) => {
    setApiError(null);

    if (step === 'phone') {
      setSubmitting(true);
      try {
        const res = await checkPhoneExistsApi({
          country_code: selectedCountry?.code || '+965',
          phone: data.phone,
        }, language);

        if (res.code === 200 && res.data === true) {
          setStep('password');
        } else if (res.code === 422 || res.key === 'fail' || res.data === false || res.data === null) {
          // Treat fail/422 as "user does not exist", show registration fields
          setStep('register');
        } else {
          let validationMsg = '';
          if (res.response_status?.validation_errors) {
            const errs = res.response_status.validation_errors;
            if (typeof errs === 'object' && !Array.isArray(errs)) {
              validationMsg = Object.values(errs).flat().join(' ');
            } else if (Array.isArray(errs)) {
              validationMsg = errs.join(' ');
            }
          }
          const errMsg = validationMsg || res.msg || t('loginFailed');
          setApiError(errMsg);
          toast.error(errMsg);
        }
      } catch (err) {
        const connectMsg = t('connectionError');
        setApiError(connectMsg);
        toast.error(connectMsg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step === 'password') {
      setSubmitting(true);
      const deviceId = getOrGenerateDeviceId();
      try {
        const res = await loginApi(
          {
            type: 'phone',
            country_code: selectedCountry?.code,
            phone: data.phone,
            password: data.password,
            device_id: deviceId,
            device_type: 'web',
          },
          language
        );

        if (res.code === 200 && res.data && res.key !== 'needActive') {
          toast.success(res.msg || t('loginSuccess'));
          startSession(res.data as any);

          setTimeout(() => {
            window.location.href = resolvePostAuthRedirect();
          }, 1000);
        } else if (res.key === 'needActive' && res.data && typeof res.data === 'object' && 'phone' in res.data) {
          const phone = res.data.phone;
          const countryCode = res.data.country_code || selectedCountry?.code || '+965';

          sessionStorage.setItem('verify_phone', phone);
          sessionStorage.setItem('verify_country_code', countryCode);
          sessionStorage.setItem('verify_type', 'register');

          toast.success(res.msg || t('verifyOtpDesc'));
          persistPostAuthRedirect();
          navigate('/verify');
        } else {
          const errMsg = getMessageFromResponse(res);
          setApiError(errMsg);
          toast.error(errMsg);
        }
      } catch (err) {
        const connectMsg = t('connectionError');
        setApiError(connectMsg);
        toast.error(connectMsg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (step === 'register') {
      setSubmitting(true);
      try {
        const res = await registerApi(
          {
            name: data.name,
            email: data.email,
            country_code: selectedCountry?.code || '+965',
            phone: data.phone,
            password: data.password,
            password_confirmation: data.password_confirmation,
          },
          language
        );

        if ((res.code === 201 || res.code === 200) && res.data) {
          toast.success(res.msg || t('registerComingSoon'));

          sessionStorage.setItem('verify_phone', data.phone);
          sessionStorage.setItem('verify_country_code', selectedCountry?.code || '+965');
          sessionStorage.setItem('verify_type', 'register');

          persistPostAuthRedirect();
          setTimeout(() => {
            navigate('/verify');
          }, 1000);
        } else {
          const errMsg = res.msg || (language === 'ar' ? 'فشل إكمال التسجيل.' : 'Registration failed.');
          setApiError(errMsg);
          toast.error(errMsg);
        }
      } catch (err) {
        const connectMsg = t('connectionError');
        setApiError(connectMsg);
        toast.error(connectMsg);
      } finally {
        setSubmitting(false);
      }
      return;
    }
  };

  const pageTitle = step === 'phone'
    ? (language === 'ar' ? 'تسجيل الدخول أو التسجيل' : 'Login or Register')
    : step === 'password'
      ? t('signIn')
      : (language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account');

  const pageSubtitle = step === 'phone'
    ? (language === 'ar' ? 'أدخل رقم هاتفك للمتابعة' : 'Enter your phone number to continue')
    : step === 'password'
      ? (language === 'ar' ? 'يرجى إدخال كلمة المرور للمتابعة' : 'Please enter your password to continue')
      : (language === 'ar' ? 'يرجى إدخال بياناتك لإنشاء حساب جديد' : 'Please fill in your details to register');

  const submitButtonText = step === 'phone'
    ? (language === 'ar' ? 'متابعة' : 'Continue')
    : step === 'password'
      ? t('signIn')
      : (language === 'ar' ? 'إنشاء الحساب' : 'Create Account');

  return (
    <div className="flex flex-col pb-24 pt-4 min-h-[80vh] bg-[#fafafa] dark:bg-neutral-900/10 justify-center px-6" dir={dir}>
      <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in duration-300">

        {/* Back button */}
        <div>
          <button
            onClick={() => {
              if (step !== 'phone') {
                setStep('phone');
              } else {
                navigate(-1);
              }
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--store-secondary-color)] transition-colors select-none cursor-pointer"
          >
            <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            <span>{step !== 'phone' ? (language === 'ar' ? 'السابق' : 'Back') : t('back')}</span>
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white">
            {pageTitle}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {pageSubtitle}
          </p>
        </div>

        {/* Card Form */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-5">

            {/* Phone Number Input */}
            <FormField
              control={control}
              name="phone"
              render={({ field, fieldState }) => {
                let phoneErrorMsg = fieldState.error?.message;
                if (phoneErrorMsg === 'phoneLengthErr' && selectedCountry) {
                  phoneErrorMsg = `${t('phoneLengthErrStart')}${selectedCountry.name}${t('phoneLengthErrMiddle')}${selectedCountry.phone_length}${t('phoneLengthErrEnd')}`;
                } else if (phoneErrorMsg) {
                  phoneErrorMsg = t(phoneErrorMsg as any);
                }

                return (
                  <FormItem>
                    <FormLabel>{t('phoneNumberLabel')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <PhoneInput
                          countries={countries}
                          selectedCountry={selectedCountry}
                          onCountryChange={(c) => {
                            setSelectedCountry(c);
                            setApiError(null);
                          }}
                          phoneNumber={field.value}
                          onPhoneNumberChange={(val) => {
                            field.onChange(val);
                            setApiError(null);
                          }}
                          disabled={submitting || loadingCountries || step !== 'phone'}
                          placeholder={selectedCountry ? 'X'.repeat(selectedCountry.phone_length) : 'XXXXXXXX'}
                        />
                        {step !== 'phone' && (
                          <button
                            type="button"
                            onClick={() => {
                              setStep('phone');
                              form.setValue('password', '');
                              form.setValue('name', '');
                              form.setValue('email', '');
                              form.setValue('password_confirmation', '');
                            }}
                            className="absolute top-1/2 -translate-y-1/2 end-3 text-xs font-bold text-[var(--store-secondary-color)] hover:underline cursor-pointer bg-white dark:bg-neutral-900 px-2 py-1 rounded"
                          >
                            {language === 'ar' ? 'تغيير' : 'Change'}
                          </button>
                        )}
                      </div>
                    </FormControl>
                    {phoneErrorMsg && <FormMessage>{phoneErrorMsg}</FormMessage>}
                  </FormItem>
                );
              }}
            />

            {/* Full Name field (Register only) */}
            <AnimatePresence>
              {step === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  className="overflow-hidden"
                >
                  <FormField
                    control={control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem className="mb-4">
                        <FormLabel>{t('fullName')}</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              type="text"
                              placeholder={t('enterFullName')}
                              disabled={submitting}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setApiError(null);
                              }}
                              className="ps-10"
                            />
                            <User className="w-5 h-5 text-gray-400 absolute start-4 pointer-events-none" />
                          </div>
                        </FormControl>
                        {fieldState.error?.message && (
                          <FormMessage>
                            {t(fieldState.error.message as any)}
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email field (Register only) */}
            <AnimatePresence>
              {step === 'register' && (
                <motion.div
                  key="email-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  className="overflow-hidden"
                >
                  <FormField
                    control={control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem className="mb-4">
                        <FormLabel>{t('emailAddress')}</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              type="email"
                              placeholder="example@mail.com"
                              disabled={submitting}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setApiError(null);
                              }}
                              className="ps-10"
                            />
                            <Mail className="w-5 h-5 text-gray-400 absolute start-4 pointer-events-none" />
                          </div>
                        </FormControl>
                        {fieldState.error?.message && (
                          <FormMessage>{t(fieldState.error.message as any)}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Field (Login & Register) */}
            <AnimatePresence>
              {step !== 'phone' && (
                <motion.div
                  key="password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  className="overflow-hidden"
                >
                  <FormField
                    control={control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem className="mb-4">
                        <FormLabel>{t('passwordLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              type="password"
                              placeholder="••••••••"
                              disabled={submitting}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setApiError(null);
                              }}
                              className="ps-10"
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute start-4 pointer-events-none" />
                          </div>
                        </FormControl>
                        {fieldState.error?.message && (
                          <FormMessage>{t(fieldState.error.message as any)}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Password Confirmation Field (Register only) */}
            <AnimatePresence>
              {step === 'register' && (
                <motion.div
                  key="password-confirm-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                  className="overflow-hidden"
                >
                  <FormField
                    control={control}
                    name="password_confirmation"
                    render={({ field, fieldState }) => (
                      <FormItem className="mb-4">
                        <FormLabel>{t('passwordConfirmLabel')}</FormLabel>
                        <FormControl>
                          <div className="relative flex items-center">
                            <Input
                              type="password"
                              placeholder="••••••••"
                              disabled={submitting}
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                setApiError(null);
                              }}
                              className="ps-10"
                            />
                            <Lock className="w-5 h-5 text-gray-400 absolute start-4 pointer-events-none" />
                          </div>
                        </FormControl>
                        {fieldState.error?.message && (
                          <FormMessage>{t(fieldState.error.message as any)}</FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password link (only on password/login step) */}
            {step === 'password' && (
              <div className={`flex ${dir === 'rtl' ? 'justify-start' : 'justify-end'}`}>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-[var(--store-secondary-color)] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                </button>
              </div>
            )}

            {/* API Error Warning Card */}
            {apiError && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{apiError}</p>
              </div>
            )}

            {/* Main submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1a1a1a] hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-[#1a1a1a] py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-gray-900/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{step === 'phone' ? (language === 'ar' ? 'جاري التحقق...' : 'Checking...') : step === 'password' ? t('loggingIn') : (language === 'ar' ? 'جاري التسجيل...' : 'Signing Up...')}</span>
                </>
              ) : (
                <span>{submitButtonText}</span>
              )}
            </button>

          </form>
        </Form>

        {/* Info Slogan */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            {t('loginInfoSlogan')}
          </p>
        </div>

      </div>
    </div>
  );
}
