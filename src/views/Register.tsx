'use client';
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { ArrowLeft, User, Mail, Lock, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { PhoneInput } from '../components/PhoneInput';
import { Country, fetchCountries, registerApi } from '../api/auth';
import { toast } from 'sonner';

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

const createRegisterSchema = (phoneLength?: number) => z.object({
  name: z.string().min(1, { message: 'enterFullNameErr' }),
  email: z.string().min(1, { message: 'enterEmailErr' }).email({ message: 'invalidEmailErr' }),
  phone: z.string().min(1, { message: 'enterPhoneErr' }).refine(
    (val) => {
      if (phoneLength === undefined) return true;
      return val.length === phoneLength;
    },
    { message: 'phoneLengthErr' }
  ),
  password: z.string().min(6, { message: 'passwordMinLengthErr' }),
  password_confirmation: z.string().min(6, { message: 'passwordMinLengthErr' }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'passwordsMustMatchErr',
  path: ['password_confirmation'],
});

export function Register() {
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();

  // Country selector states
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Form submit & API states
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // React Hook Form setup
  const schema = React.useMemo(() => createRegisterSchema(selectedCountry?.phone_length), [selectedCountry]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
  });

  const { control, handleSubmit, setValue } = form;

  // Fetch countries metadata on mount
  useEffect(() => {
    let isMounted = true;
    fetchCountries(language)
      .then((res) => {
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
    setSubmitting(true);
    setApiError(null);

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

        // Store verification details for Verify.tsx
        sessionStorage.setItem('verify_phone', data.phone);
        sessionStorage.setItem('verify_country_code', selectedCountry?.code || '+965');
        sessionStorage.setItem('verify_type', 'register');

        // Redirect to /verify
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
  };

  return (
    <div className="flex flex-col pb-24 pt-4 min-h-[80vh] bg-[#fafafa] dark:bg-neutral-900/10 justify-center px-6">
      <div className="w-full max-w-md mx-auto space-y-8">

        {/* Back button */}
        <div className={`flex`}>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--store-secondary-color)] transition-colors select-none"
          >
            <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            <span>{t('backToLogin')}</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white">
            {t('createNewAccount')}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t('registerTagline')}
          </p>
        </div>

        {/* Register Form Card */}
        <Form {...form}>
          <form onSubmit={handleSubmit(onFormSubmit)} className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-5">

            {/* Full Name */}
            <FormField
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
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
                      <User className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
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

            {/* Email */}
            <FormField
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
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
                      <Mail className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
                    </div>
                  </FormControl>
                  {fieldState.error?.message && (
                    <FormMessage>{t(fieldState.error.message as any)}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              control={control}
              name="phone"
              render={({ field, fieldState }) => {
                // Custom error formatting for dynamic phone length
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
                        disabled={submitting || loadingCountries}
                        placeholder={selectedCountry ? 'X'.repeat(selectedCountry.phone_length) : 'XXXXXXXX'}
                      />
                    </FormControl>
                    {selectedCountry && (
                      <p className="text-xs text-gray-400">
                        {t('example')}{'X'.repeat(selectedCountry.phone_length)}
                      </p>
                    )}
                    {phoneErrorMsg && <FormMessage>{phoneErrorMsg}</FormMessage>}
                  </FormItem>
                );
              }}
            />

            {/* Password */}
            <FormField
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
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
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
                    </div>
                  </FormControl>
                  {fieldState.error?.message && (
                    <FormMessage>{t(fieldState.error.message as any)}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Password Confirmation */}
            <FormField
              control={control}
              name="password_confirmation"
              render={({ field, fieldState }) => (
                <FormItem>
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
                      <Lock className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" />
                    </div>
                  </FormControl>
                  {fieldState.error?.message && (
                    <FormMessage>{t(fieldState.error.message as any)}</FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Validation/API Error Warning Card */}
            {apiError && (
              <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">{apiError}</p>
              </div>
            )}

            {/* Register Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1a1a1a] hover:bg-black text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-[#1a1a1a] py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-gray-900/10 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...'}</span>
                </>
              ) : (
                <span>{t('signUpButton')}</span>
              )}
            </button>

            {/* Link to login */}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-400 font-medium">
                {t('alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[var(--store-secondary-color)] font-bold hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  {t('loginHere')}
                </button>
              </p>
            </div>

          </form>
        </Form>

        <div className="text-center">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{t('secureDataDesc')}</span>
          </p>
        </div>

      </div>
    </div>
  );
}
