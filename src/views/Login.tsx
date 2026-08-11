'use client';
/**
 * Sign in — Figma "تسجيل دخول" (node 80:18297).
 *
 *   card     420 wide, radius 20, pad 40/44, 0 4px 40px shadow
 *   heading  IBM Plex Sans Arabic 700 · 26/38 · #1a1a1a
 *   sub      400 · 14/21 · #888888, 6px below
 *   fields   phone row (radius 12) + password (radius 10), 14px apart,
 *            stack starting 24px under the sub
 *   button   332×52, bg #4a7a35, radius 10, 700 · 16/24
 *
 * The screen keeps its three-step machine — phone → (exists?) → password, or
 * → inline registration — because the API drives it. Figma draws the
 * password step, so that state matches the frame exactly; the phone and
 * register steps reuse the same card with the fields that step needs. The
 * register step mirrors the "انشاء حساب" frame (node 80:18597).
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Country,
  fetchCountries,
  loginApi,
  registerApi,
  checkPhoneExistsApi,
  CountriesResponse,
} from '../api/auth';
import {
  startSession,
  getOrGenerateDeviceId,
  resolvePostAuthRedirect,
  persistPostAuthRedirect,
} from '../utils/auth';
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

type Step = 'phone' | 'password' | 'register';

const createAuthSchema = (step: Step, phoneLength?: number) =>
  z
    .object({
      phone: z
        .string()
        .min(1, { message: 'enterPhoneErr' })
        .refine((val) => (phoneLength === undefined ? true : val.length === phoneLength), {
          message: 'phoneLengthErr',
        }),
      name: step === 'register' ? z.string().min(1, { message: 'enterFullNameErr' }) : z.string().optional(),
      email:
        step === 'register'
          ? z.string().min(1, { message: 'enterEmailErr' }).email({ message: 'invalidEmailErr' })
          : z.string().optional(),
      password: step !== 'phone' ? z.string().min(6, { message: 'passwordMinLengthErr' }) : z.string().optional(),
      password_confirmation:
        step === 'register' ? z.string().min(6, { message: 'passwordMinLengthErr' }) : z.string().optional(),
    })
    .refine((data) => (step === 'register' ? data.password === data.password_confirmation : true), {
      message: 'passwordsMustMatchErr',
      path: ['password_confirmation'],
    });

/**
 * Mirrors the zod output exactly: `.optional()` keeps the key present and
 * widens it to `| undefined`, so declaring these with `?` makes the resolver
 * type incompatible.
 */
interface AuthFormValues {
  phone: string;
  name: string | undefined;
  email: string | undefined;
  password: string | undefined;
  password_confirmation: string | undefined;
}

export function Login() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [step, setStep] = useState<Step>('phone');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const schema = React.useMemo(
    () => createAuthSchema(step, selectedCountry?.phone_length),
    [step, selectedCountry]
  );

  const { control, handleSubmit, formState } = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { phone: '', name: '', email: '', password: '', password_confirmation: '' },
  });
  const { errors } = formState;

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

  const messageFrom = (res: { response_status?: { validation_errors?: unknown }; msg?: string } | null) => {
    if (!res) return t('loginFailed');
    const ve = res.response_status?.validation_errors;
    if (ve) {
      if (Array.isArray(ve)) return ve.join(' ');
      if (typeof ve === 'object') return Object.values(ve as Record<string, string[]>).flat().join(' ');
    }
    return res.msg || t('loginFailed');
  };

  const goToVerify = (phone: string) => {
    sessionStorage.setItem('verify_phone', phone);
    sessionStorage.setItem('verify_country_code', selectedCountry?.code || '+965');
    sessionStorage.setItem('verify_type', 'register');
    persistPostAuthRedirect();
    navigate('/verify');
  };

  const onFormSubmit = async (data: AuthFormValues) => {
    setApiError(null);

    // ── Step 1: does this phone already have an account? ──────────────────
    if (step === 'phone') {
      setSubmitting(true);
      try {
        const res = await checkPhoneExistsApi(
          { country_code: selectedCountry?.code || '+965', phone: data.phone },
          language
        );

        if (res.code === 200 && res.data === true) {
          setStep('password');
        } else if (res.code === 422 || res.key === 'fail' || res.data === false || res.data === null) {
          setStep('register');
        } else {
          const errMsg = messageFrom(res);
          setApiError(errMsg);
          toast.error(errMsg);
        }
      } catch {
        setApiError(t('connectionError'));
        toast.error(t('connectionError'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ── Step 2: sign in ───────────────────────────────────────────────────
    if (step === 'password') {
      setSubmitting(true);
      try {
        const res = await loginApi(
          {
            type: 'phone',
            country_code: selectedCountry?.code,
            phone: data.phone,
            password: data.password,
            device_id: getOrGenerateDeviceId(),
            device_type: 'web',
          },
          language
        );

        if (res.code === 200 && res.data && res.key !== 'needActive') {
          toast.success(res.msg || t('loginSuccess'));
          startSession(res.data);
          setTimeout(() => {
            window.location.href = resolvePostAuthRedirect();
          }, 800);
        } else if (res.key === 'needActive' && res.data && typeof res.data === 'object' && 'phone' in res.data) {
          toast.success(res.msg || t('verifyOtpDesc'));
          goToVerify(res.data.phone);
        } else {
          const errMsg = messageFrom(res);
          setApiError(errMsg);
          toast.error(errMsg);
        }
      } catch {
        setApiError(t('connectionError'));
        toast.error(t('connectionError'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ── Step 3: register the new phone ────────────────────────────────────
    setSubmitting(true);
    try {
      const res = await registerApi(
        {
          name: data.name!,
          email: data.email!,
          country_code: selectedCountry?.code || '+965',
          phone: data.phone,
          password: data.password!,
          password_confirmation: data.password_confirmation!,
        },
        language
      );

      if ((res.code === 201 || res.code === 200) && res.data) {
        toast.success(res.msg || t('registerComingSoon'));
        goToVerify(data.phone);
      } else {
        const errMsg = res.msg || (isArabic ? 'فشل إكمال التسجيل.' : 'Registration failed.');
        setApiError(errMsg);
        toast.error(errMsg);
      }
    } catch {
      setApiError(t('connectionError'));
      toast.error(t('connectionError'));
    } finally {
      setSubmitting(false);
    }
  };

  const msg = (key?: string) => (key ? t(key as Parameters<typeof t>[0]) || key : null);

  const heading =
    step === 'register' ? (isArabic ? 'إنشاء حساب جديد' : 'Create a new account') : isArabic ? 'تسجيل الدخول' : 'Sign in';

  const subheading =
    step === 'register'
      ? isArabic
        ? 'انضم إلى لوبي كير واستمتع بتجربة تسوق أفضل'
        : 'Join Lobby Care and enjoy a better shopping experience'
      : isArabic
        ? 'مرحباً بك من جديد في لوبي كير'
        : 'Welcome back to Lobby Care';

  const submitLabel =
    step === 'phone'
      ? isArabic
        ? 'متابعة'
        : 'Continue'
      : step === 'password'
        ? isArabic
          ? 'تسجيل الدخول'
          : 'Sign in'
        : isArabic
          ? 'إنشاء حساب'
          : 'Create account';

  return (
    <AuthShell
      artwork={step === 'register' ? AUTH_ARTWORK.register : AUTH_ARTWORK.login}
      artworkSide={step === 'register' ? 'right' : 'left'}
      artworkRatio={step === 'register' ? '578/557' : '597/557'}
    >
      <AuthHeading size={step === 'register' ? 24 : 26}>{heading}</AuthHeading>
      <AuthSubheading>{subheading}</AuthSubheading>

      <form onSubmit={handleSubmit(onFormSubmit)} noValidate className="flex flex-col gap-3.5 pt-6">
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
                disabled={submitting || loadingCountries || step !== 'phone'}
                invalid={!!errors.phone}
                placeholder={isArabic ? 'رقم الجوال' : 'Phone number'}
              />
            )}
          />
          {errors.phone && <p className="pt-1 text-[13px] text-lc-danger">{msg(errors.phone.message)}</p>}
        </div>

        {step === 'register' && (
          <>
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
          </>
        )}

        {step !== 'phone' && (
          <div>
            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <AuthPasswordField
                  {...field}
                  autoComplete={step === 'register' ? 'new-password' : 'current-password'}
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
        )}

        {step === 'register' && (
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
        )}

        {apiError && <AuthError>{apiError}</AuthError>}

        <AuthSubmit type="submit" loading={submitting}>
          {submitLabel}
        </AuthSubmit>
      </form>

      <div className="flex items-center justify-between pt-5 text-[14px] leading-[21px]">
        {step === 'password' ? (
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="cursor-pointer font-semibold text-lc-green-deep transition-opacity hover:opacity-80"
          >
            {isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
          </button>
        ) : (
          <span />
        )}

        {step !== 'phone' && (
          <button
            type="button"
            onClick={() => {
              setStep('phone');
              setApiError(null);
            }}
            className="cursor-pointer text-[#888888] transition-colors hover:text-lc-ink"
          >
            {isArabic ? 'تغيير الرقم' : 'Change number'}
          </button>
        )}
      </div>
    </AuthShell>
  );
}
