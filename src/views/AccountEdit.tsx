'use client';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '../lib/navigation';
import { User, Mail, CheckCircle2, AlertCircle, ArrowRight, Loader2, Camera } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getSession } from '../utils/auth';
import { apiGet } from '../api/client';
import { toast } from 'sonner';
import { BASE_URL } from '../api/config';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  image: string;
  is_active: boolean;
  is_blocked: boolean;
  is_notifiable: boolean;
  lang: string;
  token: string | null;
}

async function fetchProfile(lang: string): Promise<UserProfile> {
  const res = await apiGet<{ code: number; data: UserProfile }>('/user/profile', { language: lang });
  return res.data;
}

async function updateProfile(
  params: { name: string; email: string; image?: File },
  lang: string
): Promise<{ code: number; msg: string; data: UserProfile | null }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;
  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('email', params.email);
  if (params.image) formData.append('image', params.image);

  const res = await fetch(`${BASE_URL}/user/profile`, {
    method: 'PATCH',
    headers: {
      Accept: 'application/json',
      'Accept-Language': lang,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  return res.json();
}

export function AccountEdit() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [apiError, setApiError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Guard: must be logged in
  useEffect(() => {
    const session = getSession();
    if (!session || !session.isLoggedIn) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fetch profile from backend
  useEffect(() => {
    setLoading(true);
    fetchProfile(language)
      .then((data) => {
        setProfile(data);
        setName(data.name || '');
        setEmail(data.email || '');
        setImagePreview(data.image || null);
      })
      .catch(() => {
        toast.error(isArabic ? 'فشل تحميل بيانات الحساب' : 'Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, [language]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!name.trim()) {
      setApiError(isArabic ? 'يرجى إدخال الاسم' : 'Please enter your name');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateProfile({ name: name.trim(), email: email.trim(), image: imageFile || undefined }, language);

      if (res.code === 200) {
        setShowSuccess(true);
        toast.success(res.msg || (isArabic ? 'تم حفظ البيانات بنجاح' : 'Profile saved successfully'));
        if (res.data) {
          setProfile(res.data);
          setImagePreview(res.data.image || null);
        }
        setImageFile(null);
        setTimeout(() => setShowSuccess(false), 4000);
      } else {
        const msg = res.msg || (isArabic ? 'فشل حفظ البيانات' : 'Failed to save profile');
        setApiError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = isArabic ? 'خطأ في الاتصال. حاول مجدداً.' : 'Connection error. Try again.';
      setApiError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f] pb-24" dir={dir}>

      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
        <div className="container mx-auto px-5 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/account')}
            className="w-9 h-9 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors"
          >
            <ArrowRight className={`w-4 h-4 text-gray-700 dark:text-gray-300 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
          </button>
          <h1 className="text-lg font-black text-[#1a1a1a] dark:text-white">
            {isArabic ? 'تعديل الحساب' : 'Edit Account'}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-5 py-6 space-y-5">

        {/* Loading skeleton */}
        {loading && (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-5 animate-pulse">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-neutral-800" />
            </div>
            <div className="h-12 bg-gray-100 dark:bg-neutral-800 rounded-2xl" />
            <div className="h-12 bg-gray-100 dark:bg-neutral-800 rounded-2xl" />
            <div className="h-12 bg-gray-100 dark:bg-neutral-800 rounded-2xl" />
          </div>
        )}

        {/* Form */}
        {!loading && (
          <form onSubmit={handleSave} className="space-y-5">

            {/* Success banner */}
            {showSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center gap-3 text-emerald-800 dark:text-emerald-400 animate-in fade-in slide-in-from-top-4 duration-300">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-bold">
                  {isArabic ? 'تم حفظ بيانات الحساب بنجاح' : 'Account data saved successfully'}
                </span>
              </div>
            )}

            {/* Profile card */}
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-5">

              {/* Avatar picker */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 dark:bg-neutral-800 border-2 border-[var(--store-secondary-color)]/30">
                    {imagePreview ? (
                      <img src={imagePreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="absolute -bottom-1.5 -end-1.5 w-7 h-7 rounded-xl bg-[var(--store-secondary-color)] hover:brightness-110 flex items-center justify-center shadow transition-all"
                  >
                    <Camera className="w-3.5 h-3.5 text-white" />
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </div>

              {/* Phone (read-only display) */}
              {profile && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400">
                    {isArabic ? 'رقم الهاتف' : 'Phone Number'}
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700 opacity-70">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400 font-mono" dir="ltr">
                      {profile.country_code} {profile.phone}
                    </span>
                    <span className="ms-auto text-[10px] font-bold text-gray-400 bg-gray-200 dark:bg-neutral-700 px-2 py-0.5 rounded-full">
                      {isArabic ? 'لا يمكن تغييره' : 'Cannot change'}
                    </span>
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isArabic ? 'الاسم' : 'Full Name'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isArabic ? 'right-4' : 'left-4'} flex items-center text-gray-400 pointer-events-none`}>
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setApiError(null); }}
                    disabled={submitting}
                    className={`w-full ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-2 focus:ring-[var(--store-secondary-color)] focus:bg-white dark:focus:bg-neutral-900 outline-none transition-all text-sm font-semibold text-gray-900 dark:text-white`}
                    placeholder={isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                  {isArabic ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <span className={`absolute inset-y-0 ${isArabic ? 'right-4' : 'left-4'} flex items-center text-gray-400 pointer-events-none`}>
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setApiError(null); }}
                    disabled={submitting}
                    className={`w-full ${isArabic ? 'pr-11 pl-4' : 'pl-11 pr-4'} py-3.5 bg-gray-50 dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-2xl focus:ring-2 focus:ring-[var(--store-secondary-color)] focus:bg-white dark:focus:bg-neutral-900 outline-none transition-all text-sm font-semibold text-gray-800 dark:text-white`}
                    placeholder="example@mail.com"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* API Error */}
              {apiError && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in duration-200">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold leading-relaxed">{apiError}</p>
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#1a1a1a] hover:bg-black dark:bg-white dark:hover:bg-neutral-100 dark:text-[#1a1a1a] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer text-sm shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isArabic ? 'جارٍ الحفظ...' : 'Saving...'}</span>
                  </>
                ) : (
                  <span>{isArabic ? 'حفظ التعديلات' : 'Save Changes'}</span>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
