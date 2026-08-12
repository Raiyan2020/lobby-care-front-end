'use client';
/**
 * Sign in — Figma "تسجيل دخول" (node 80:18297).
 *
 *   card     420 wide, radius 20, pad 40/44, 0 4px 40px shadow
 *   heading  IBM Plex Sans Arabic 700 · 26/38 · #1a1a1a
 *   sub      400 · 14/21 · #888888, 6px below
 *   fields   phone row (radius 12), 14px apart, stack starting 24px under sub
 *   button   332×52, bg #4a7a35, radius 10, 700 · 16/24
 *
 * Authentication is phone + WhatsApp OTP only. This screen is a two-step
 * machine — phone → (existing account? send OTP : collect name) — and the
 * API drives which branch runs. Both branches hand off to /verify, which
 * owns OTP entry for the whole app (login and registration alike). The
 * name step mirrors the "انشاء حساب" frame (node 80:18597) minus the
 * fields that no longer exist (email/password).
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

type Step = 'phone' | 'name';

const createAuthSchema = (step: Step, phoneLength?: number) =>
  z.object({
    phone: z
      .string()
      .min(1, { message: 'enterPhoneErr' })
      .refine((val) => (phoneLength === undefined ? true : val.length === phoneLength), {
        message: 'phoneLengthErr',
      }),
    name: step === 'name' ? z.string().min(1, { message: 'enterFullNameErr' }) : z.string().optional(),
  });

/**
 * Mirrors the zod output exactly: `.optional()` keeps the key present and
 * widens it to `| undefined`, so declaring these with `?` makes the resolver
 * type incompatible.
 */
interface AuthFormValues {
  phone: string;
  name: string | undefined;
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
    defaultValues: { phone: '', name: '' },
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

  const goToVerify = (phone: string, type: 'register' | 'login') => {
    sessionStorage.setItem('verify_phone', phone);
    sessionStorage.setItem('verify_country_code', selectedCountry?.code || '+965');
    sessionStorage.setItem('verify_type', type);
    persistPostAuthRedirect();
    navigate('/verify');
  };

  const onFormSubmit = async (data: AuthFormValues) => {
    setApiError(null);

    // ── Step 1: does this phone already have an account? ──────────────────
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
          // Existing account: send the WhatsApp OTP straight away.
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
        setApiError(t('connectionError'));
        toast.error(t('connectionError'));
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // ── Step 2: new number — collect the name, then register + send OTP ────
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
      setApiError(t('connectionError'));
      toast.error(t('connectionError'));
    } finally {
      setSubmitting(false);
    }
  };

  const msg = (key?: string) => (key ? t(key as Parameters<typeof t>[0]) || key : null);

  const heading =
    step === 'name' ? (isArabic ? 'إنشاء حساب جديد' : 'Create a new account') : isArabic ? 'تسجيل الدخول' : 'Sign in';

  const subheading =
    step === 'name'
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
      : isArabic
        ? 'إنشاء حساب'
        : 'Create account';

  return (
    <AuthShell
      artwork={step === 'name' ? AUTH_ARTWORK.register : AUTH_ARTWORK.login}
      artworkSide={step === 'name' ? 'right' : 'left'}
      artworkRatio={step === 'name' ? '578/557' : '597/557'}
    >
      <AuthHeading size={step === 'name' ? 24 : 26}>{heading}</AuthHeading>
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

        {step === 'name' && (
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
        )}

        {apiError && <AuthError>{apiError}</AuthError>}

        <AuthSubmit type="submit" loading={submitting}>
          {submitLabel}
        </AuthSubmit>
      </form>

      {step !== 'phone' && (
        <div className="flex items-center justify-end pt-5 text-[14px] leading-[21px]">
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
        </div>
      )}
    </AuthShell>
  );
}
