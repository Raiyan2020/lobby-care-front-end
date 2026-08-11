'use client';
/**
 * Registration — Figma "انشاء حساب" (node 80:18597).
 *
 *   card     420 wide, radius 20, pad 40/44, 0 4px 40px shadow
 *   heading  IBM Plex Sans Arabic 700 · 24/36 · #1a1a1a
 *   sub      400 · 14/21 · #888888, 6px below
 *   fields   47px tall, 1.3px #d8d0c4, radius 10 (12 on the phone row),
 *            14px apart, stack starting 22px under the sub
 *   order    phone · full name · email · password · confirm password
 *   button   332×52, bg #4a7a35, radius 10, 700 · 16/24
 *
 * Validation (react-hook-form + zod), the countries fetch with its offline
 * fallback, the verification handoff through sessionStorage and the
 * post-auth redirect are all unchanged.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { Country, fetchCountries, registerApi } from '../api/auth';
import { persistPostAuthRedirect } from '../utils/auth';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AuthShell,
  AuthHeading,
  AuthSubheading,
  AuthField,
  AuthPasswordField,
  AuthPhoneRow,
  AuthSubmit,
  AuthError,
  AUTH_ARTWORK,
} from '../components/lobbycare/AuthShell';

const DEFAULT_COUNTRIES: Country[] = [
  { code: '+965', iso: 'kw', name: 'الكويت', phone_start: '5,6,9', phone_length: 8 },
  { code: '+971', iso: 'ae', name: 'الإمارات العربية المتحدة', phone_start: '5', phone_length: 9 },
  { code: '+963', iso: 'sy', name: 'سوريا', phone_start: '9', phone_length: 9 },
];

const createRegisterSchema = (phoneLength?: number) =>
  z
    .object({
      name: z.string().min(1, { message: 'enterFullNameErr' }),
      email: z.string().min(1, { message: 'enterEmailErr' }).email({ message: 'invalidEmailErr' }),
      phone: z
        .string()
        .min(1, { message: 'enterPhoneErr' })
        .refine((val) => (phoneLength === undefined ? true : val.length === phoneLength), {
          message: 'phoneLengthErr',
        }),
      password: z.string().min(6, { message: 'passwordMinLengthErr' }),
      password_confirmation: z.string().min(6, { message: 'passwordMinLengthErr' }),
    })
    .refine((data) => data.password === data.password_confirmation, {
      message: 'passwordsMustMatchErr',
      path: ['password_confirmation'],
    });

type RegisterValues = z.infer<ReturnType<typeof createRegisterSchema>>;

export function Register() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = React.useMemo(
    () => createRegisterSchema(selectedCountry?.phone_length),
    [selectedCountry]
  );

  const { control, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', password: '', password_confirmation: '' },
  });
  const { errors } = formState;

  // Countries metadata, with an offline fallback so signup still works.
  useEffect(() => {
    let isMounted = true;
    fetchCountries(language)
      .then((res) => {
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
        if (!isMounted) return;
        setCountries(DEFAULT_COUNTRIES);
        setSelectedCountry(DEFAULT_COUNTRIES[0]);
      })
      .finally(() => {
        if (isMounted) setLoadingCountries(false);
      });
    return () => {
      isMounted = false;
    };
  }, [language]);

  const onFormSubmit = async (data: RegisterValues) => {
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

        sessionStorage.setItem('verify_phone', data.phone);
        sessionStorage.setItem('verify_country_code', selectedCountry?.code || '+965');
        sessionStorage.setItem('verify_type', 'register');

        persistPostAuthRedirect();
        setTimeout(() => navigate('/verify'), 800);
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

  /** Zod carries i18n keys as messages, so resolve them through t(). */
  const msg = (key?: string) => (key ? t(key as Parameters<typeof t>[0]) || key : null);

  return (
    <AuthShell artwork={AUTH_ARTWORK.register} artworkSide="right" artworkRatio="578/557">
      <AuthHeading size={24}>{isArabic ? 'إنشاء حساب جديد' : 'Create a new account'}</AuthHeading>
      <AuthSubheading>
        {isArabic
          ? 'انضم إلى لوبي كير واستمتع بتجربة تسوق أفضل'
          : 'Join Lobby Care and enjoy a better shopping experience'}
      </AuthSubheading>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="flex flex-col gap-3.5 pt-[22px]">
        <div>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
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
                disabled={submitting || loadingCountries}
                invalid={!!errors.phone}
                placeholder={isArabic ? 'رقم الجوال' : 'Phone number'}
              />
            )}
          />
          {errors.phone && <p className="pt-1 text-[13px] text-lc-danger">{msg(errors.phone.message)}</p>}
        </div>

        <div>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <AuthField
                {...field}
                type="text"
                autoComplete="name"
                disabled={submitting}
                invalid={!!errors.name}
                placeholder={isArabic ? 'الاسم بالكامل' : 'Full name'}
              />
            )}
          />
          {errors.name && <p className="pt-1 text-[13px] text-lc-danger">{msg(errors.name.message)}</p>}
        </div>

        <div>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <AuthField
                {...field}
                type="email"
                dir="ltr"
                autoComplete="email"
                disabled={submitting}
                invalid={!!errors.email}
                placeholder={isArabic ? 'البريد الإلكتروني' : 'Email address'}
              />
            )}
          />
          {errors.email && <p className="pt-1 text-[13px] text-lc-danger">{msg(errors.email.message)}</p>}
        </div>

        <div>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <AuthPasswordField
                {...field}
                autoComplete="new-password"
                disabled={submitting}
                invalid={!!errors.password}
                placeholder={isArabic ? 'كلمة المرور' : 'Password'}
              />
            )}
          />
          {errors.password && (
            <p className="pt-1 text-[13px] text-lc-danger">{msg(errors.password.message)}</p>
          )}
        </div>

        <div>
          <Controller
            control={control}
            name="password_confirmation"
            render={({ field }) => (
              <AuthPasswordField
                {...field}
                autoComplete="new-password"
                disabled={submitting}
                invalid={!!errors.password_confirmation}
                placeholder={isArabic ? 'تأكيد كلمة المرور' : 'Confirm password'}
              />
            )}
          />
          {errors.password_confirmation && (
            <p className="pt-1 text-[13px] text-lc-danger">
              {msg(errors.password_confirmation.message)}
            </p>
          )}
        </div>

        {apiError && <AuthError>{apiError}</AuthError>}

        <AuthSubmit type="submit" loading={submitting}>
          {isArabic ? 'إنشاء حساب' : 'Create account'}
        </AuthSubmit>
      </form>

      <p className="pt-5 text-center text-[14px] leading-[21px] text-[#888888]">
        {isArabic ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="cursor-pointer font-semibold text-lc-green-deep transition-opacity hover:opacity-80"
        >
          {isArabic ? 'تسجيل الدخول' : 'Sign in'}
        </button>
      </p>
    </AuthShell>
  );
}
