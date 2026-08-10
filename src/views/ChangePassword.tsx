'use client';
import React, { useState } from 'react';
import { useNavigate } from '../lib/navigation';
import { ArrowLeft, AlertCircle, Loader2, KeyRound, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { changePasswordApi } from '../api/auth';
import { toast } from 'sonner';

export function ChangePassword() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState<{ current?: string; password?: string; confirm?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!currentPassword.trim()) {
      newErrors.current = isArabic ? 'يرجى إدخال كلمة المرور الحالية' : 'Please enter your current password';
    }
    if (password.length < 6) {
      newErrors.password = isArabic ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    }
    if (password !== passwordConfirmation) {
      newErrors.confirm = isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await changePasswordApi(
        { current_password: currentPassword, password, password_confirmation: passwordConfirmation },
        language
      );

      if (res.code === 200) {
        setDone(true);
        toast.success(res.msg || (isArabic ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'));
        setTimeout(() => navigate('/account', { replace: true }), 1800);
      } else {
        const msg = res.msg || (isArabic ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
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

  if (done) {
    return (
      <div className="flex flex-col pb-24 pt-4 min-h-[80vh] bg-[#fafafa] dark:bg-neutral-900/10 justify-center px-6">
        <div className="w-full max-w-sm mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-500 animate-bounce" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white">
              {isArabic ? 'تم بنجاح!' : 'Done!'}
            </h2>
            <p className="text-gray-500 text-sm">
              {isArabic ? 'تم تغيير كلمة المرور بنجاح.' : 'Your password has been changed successfully.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-24 pt-4 min-h-[80vh] bg-[#fafafa] dark:bg-neutral-900/10 justify-center px-6" dir={dir}>
      <div className="w-full max-w-md mx-auto space-y-8">

        {/* Back button */}
        <div>
          <button
            onClick={() => navigate('/account')}
            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--store-secondary-color)] transition-colors select-none"
          >
            <ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            <span>{isArabic ? 'رجوع' : 'Back'}</span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl bg-[var(--store-secondary-color)]/10 flex items-center justify-center">
              <KeyRound className="w-8 h-8 text-[var(--store-secondary-color)]" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-[#1a1a1a] dark:text-white">
            {isArabic ? 'تغيير كلمة المرور' : 'Change Password'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {isArabic ? 'أدخل كلمة المرور الحالية ثم كلمة المرور الجديدة' : 'Enter your current password then set a new one'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-neutral-800 space-y-5"
        >
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-200 block">
              {isArabic ? 'كلمة المرور الحالية' : 'Current Password'}
            </label>
            <div className="relative flex items-center">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => { setCurrentPassword(e.target.value); setErrors({}); setApiError(null); }}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full ps-10 pe-11 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-[#1a1a1a] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-secondary-color)] transition-all"
              />
              <KeyRound className="w-4.5 h-4.5 text-gray-400 absolute start-3 pointer-events-none" />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute end-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.current && <p className="text-xs text-red-500 font-semibold">{errors.current}</p>}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-200 block">
              {isArabic ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative flex items-center">
              <input
                type={showNew ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}); setApiError(null); }}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full ps-10 pe-11 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-[#1a1a1a] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-secondary-color)] transition-all"
              />
              <KeyRound className="w-4.5 h-4.5 text-gray-400 absolute start-3 pointer-events-none" />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNew((v) => !v)}
                className="absolute end-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 font-semibold">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-200 block">
              {isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}
            </label>
            <div className="relative flex items-center">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => { setPasswordConfirmation(e.target.value); setErrors({}); setApiError(null); }}
                placeholder="••••••••"
                disabled={submitting}
                className="w-full ps-10 pe-11 py-3 rounded-xl border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-[#1a1a1a] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--store-secondary-color)] transition-all"
              />
              <KeyRound className="w-4.5 h-4.5 text-gray-400 absolute start-3 pointer-events-none" />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute end-3 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-red-500 font-semibold">{errors.confirm}</p>}
          </div>

          {/* API Error */}
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
                <span>{isArabic ? 'جارٍ الحفظ...' : 'Saving...'}</span>
              </>
            ) : (
              <span>{isArabic ? 'تغيير كلمة المرور' : 'Change Password'}</span>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
