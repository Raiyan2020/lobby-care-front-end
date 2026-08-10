'use client';
import { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { User, MapPin, ShoppingBag, Award, Globe, LogOut, Trash2, ChevronLeft, ChevronRight, Settings, Moon, Sun, KeyRound, Bell, Shield, FileText, Info, Phone, } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { getSession, getOrGenerateDeviceId, syncAuthCookieFromStorage } from '../utils/auth';
import { apiGet } from '../api/client';
import { logoutApi, deleteAccountApi } from '../api/auth';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  image: string;
}

export function Account() {
  const { dir, language, setLanguage } = useLanguage();
  const { settings, updateSettings } = useStore();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || !currentSession.isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }
    setSession(currentSession);

    // Fetch live profile data from API
    apiGet<{ code: number; data: UserProfile }>('/user/profile', { language })
      .then((res) => { if (res.code === 200) setProfile(res.data); })
      .catch(() => { });
  }, [navigate, language]);

  const handleLogout = async () => {
    try {
      const deviceId = getOrGenerateDeviceId();
      await logoutApi(deviceId, language);
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      localStorage.removeItem('user_session');
      localStorage.removeItem('api_token');
      syncAuthCookieFromStorage(); // clears the cookie since token is now gone
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteAccountApi(language);
    } catch (err) {
      console.error('Delete account API error:', err);
    } finally {
      localStorage.removeItem('user_session');
      localStorage.removeItem('api_token');
      localStorage.removeItem('user_addresses');
      localStorage.removeItem('user_orders');
      localStorage.removeItem('user_points');
      localStorage.removeItem('user_points_history');
      syncAuthCookieFromStorage(); // clears the cookie since token is now gone
      setShowDeleteModal(false);
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  if (!session) return null;

  // ─── Chevron helper ────────────────────────────────────────────────────────
  const Chevron = ({ className = '' }: { className?: string }) =>
    dir === 'rtl'
      ? <ChevronLeft className={`w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors ${className}`} />
      : <ChevronRight className={`w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors ${className}`} />;

  // ─── Reusable row (mobile list style) ──────────────────────────────────────
  const Row = ({
    icon,
    iconBg,
    label,
    right,
    onClick,
    danger = false,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    right?: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 h-[58px] rounded-[14px] transition-colors group ${danger ? 'hover:bg-red-50' : 'hover:bg-gray-50'}`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <span className={`font-bold text-[13px] ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</span>
      </div>
      {right ?? <Chevron />}
    </button>
  );

  // ─── Grid card (desktop) ───────────────────────────────────────────────────
  const GridCard = ({
    icon,
    iconBg,
    label,
    sublabel,
    onClick,
    danger = false,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    sublabel?: string;
    onClick: () => void;
    danger?: boolean;
  }) => (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border text-center transition-all hover:shadow-md active:scale-[0.98] group ${danger
          ? 'border-red-100 bg-red-50/60 hover:bg-red-50'
          : 'border-gray-100 bg-white hover:border-[var(--store-secondary-color)]/30'
        }`}
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div>
        <p className={`text-[13px] font-black leading-tight ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</p>
        {sublabel && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{sublabel}</p>}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0d0d0f]" dir={dir}>

      {/* ── Hero Header ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
        <div className="container mx-auto px-5 py-6">
          <div className="flex items-center justify-between gap-4">
            {/* Avatar + info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--store-secondary-color)]/10 border border-[var(--store-secondary-color)]/20 flex items-center justify-center shrink-0">
                {profile?.image ? (
                  <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-[var(--store-secondary-color)]" />
                )}
              </div>
              <div>
                <h1 className="text-[18px] font-black text-[#1a1a1a] dark:text-white leading-tight">
                  {profile?.name || session?.name || (isArabic ? 'مستخدم' : 'User')}
                </h1>
                <p className="text-[13px] text-gray-500 font-semibold" dir="ltr">
                  {profile ? `${profile.country_code} ${profile.phone}` : session?.phoneNumber}
                </p>
                {(profile?.email || session?.email) && (
                  <p className="text-[11px] text-gray-400 font-medium">
                    {profile?.email || session?.email}
                  </p>
                )}
              </div>
            </div>
            {/* Edit button */}
            <button
              onClick={() => navigate('/account/edit')}
              className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--store-secondary-color)]/10 hover:bg-[var(--store-secondary-color)]/20 text-[var(--store-secondary-color)] font-bold text-[13px] transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{isArabic ? 'تعديل الحساب' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="container mx-auto px-5 py-6 pb-20 space-y-6">

        {/* ── DESKTOP: Grid layout, MOBILE: list cards ── */}

        {/* Quick actions grid — desktop only */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <GridCard
            icon={<ShoppingBag className="w-6 h-6 text-indigo-600" />}
            iconBg="bg-indigo-50"
            label={isArabic ? 'طلباتي' : 'My Orders'}
            sublabel={isArabic ? 'استعرض طلباتك السابقة' : 'View past orders'}
            onClick={() => navigate('/orders')}
          />
          <GridCard
            icon={<Award className="w-6 h-6 text-amber-600" />}
            iconBg="bg-amber-50"
            label={isArabic ? 'نقاطي' : 'My Points'}
            sublabel={isArabic ? 'رصيد نقاط المكافآت' : 'Rewards balance'}
            onClick={() => navigate('/points')}
          />
          <GridCard
            icon={<MapPin className="w-6 h-6 text-emerald-600" />}
            iconBg="bg-emerald-50"
            label={isArabic ? 'عناويني' : 'Addresses'}
            sublabel={isArabic ? 'إدارة عناوين التوصيل' : 'Manage delivery addresses'}
            onClick={() => navigate('/addresses')}
          />
          <GridCard
            icon={<Bell className="w-6 h-6 text-sky-600" />}
            iconBg="bg-sky-50"
            label={isArabic ? 'الإشعارات' : 'Notifications'}
            sublabel={isArabic ? 'اطلع على آخر التحديثات' : 'Latest updates'}
            onClick={() => navigate('/notifications')}
          />
          <GridCard
            icon={<KeyRound className="w-6 h-6 text-violet-600" />}
            iconBg="bg-violet-50"
            label={isArabic ? 'كلمة المرور' : 'Password'}
            sublabel={isArabic ? 'تغيير كلمة المرور' : 'Change your password'}
            onClick={() => navigate('/account/change-password')}
          />
          <GridCard
            icon={<Shield className="w-6 h-6 text-blue-600" />}
            iconBg="bg-blue-50"
            label={isArabic ? 'الشروط والخصوصية' : 'Terms & Privacy'}
            onClick={() => navigate('/terms-privacy')}
          />
          <GridCard
            icon={<FileText className="w-6 h-6 text-orange-600" />}
            iconBg="bg-orange-50"
            label={isArabic ? 'سياسة الإرجاع' : 'Return Policy'}
            onClick={() => navigate('/return-exchange-policy')}
          />
          <GridCard
            icon={<Info className="w-6 h-6 text-teal-600" />}
            iconBg="bg-teal-50"
            label={isArabic ? 'عن المتجر' : 'About Us'}
            onClick={() => navigate('/about-us')}
          />
          <GridCard
            icon={<Phone className="w-6 h-6 text-pink-600" />}
            iconBg="bg-pink-50"
            label={isArabic ? 'تواصل معنا' : 'Contact Us'}
            onClick={() => navigate('/contact')}
          />
        </div>

        {/* Settings toggles — desktop only, separate row */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[var(--store-secondary-color)]/30 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-[13px] font-black text-gray-800 leading-tight">{isArabic ? 'اللغة' : 'Language'}</p>
              <p className="text-[10px] text-[var(--store-secondary-color)] font-bold mt-0.5">{isArabic ? 'English' : 'العربية'}</p>
            </div>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={() => updateSettings({ ...settings, displayMode: settings.displayMode === 'dark' ? 'light' : 'dark' })}
            className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border border-gray-100 bg-white hover:border-[var(--store-secondary-color)]/30 hover:shadow-md transition-all active:scale-[0.98] group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
              {settings.displayMode === 'dark'
                ? <Sun className="w-6 h-6 text-amber-500" />
                : <Moon className="w-6 h-6 text-indigo-600" />}
            </div>
            <div>
              <p className="text-[13px] font-black text-gray-800 leading-tight">{isArabic ? 'المظهر' : 'Appearance'}</p>
              <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase">
                {settings.displayMode === 'dark' ? (isArabic ? 'داكن' : 'Dark') : (isArabic ? 'مضيء' : 'Light')}
              </p>
            </div>
          </button>

          {/* Logout */}
          <GridCard
            icon={<LogOut className="w-6 h-6 text-red-500" />}
            iconBg="bg-red-50"
            label={isArabic ? 'تسجيل الخروج' : 'Logout'}
            onClick={handleLogout}
            danger
          />

          {/* Delete account */}
          <GridCard
            icon={<Trash2 className="w-6 h-6 text-gray-400" />}
            iconBg="bg-gray-100"
            label={isArabic ? 'مسح الحساب' : 'Delete Account'}
            onClick={() => setShowDeleteModal(true)}
          />
        </div>

        {/* ── MOBILE: List card sections ── */}
        <div className="md:hidden space-y-4">

          {/* Main section */}
          <div className="bg-white dark:bg-neutral-900 rounded-[20px] p-1.5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <Row icon={<ShoppingBag className="w-[18px] h-[18px] text-indigo-600" />} iconBg="bg-indigo-50" label={isArabic ? 'طلباتي السابقة' : 'My Previous Orders'} onClick={() => navigate('/orders')} />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<Award className="w-[18px] h-[18px] text-amber-600" />} iconBg="bg-amber-50" label={isArabic ? 'رصيد نقاطي' : 'My Points Balance'} onClick={() => navigate('/points')} />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<MapPin className="w-[18px] h-[18px] text-emerald-600" />} iconBg="bg-emerald-50" label={isArabic ? 'عناويني' : 'My Addresses'} onClick={() => navigate('/addresses')} />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<Bell className="w-[18px] h-[18px] text-sky-600" />} iconBg="bg-sky-50" label={isArabic ? 'الإشعارات' : 'Notifications'} onClick={() => navigate('/notifications')} />
          </div>

          {/* Settings section */}
          <div className="bg-white dark:bg-neutral-900 rounded-[20px] p-1.5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <Row
              icon={<Globe className="w-[18px] h-[18px] text-gray-600" />}
              iconBg="bg-gray-50"
              label={isArabic ? 'اللغة' : 'Language'}
              right={<span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{isArabic ? 'English' : 'العربية'}</span>}
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row
              icon={settings.displayMode === 'dark' ? <Sun className="w-[18px] h-[18px] text-amber-500" /> : <Moon className="w-[18px] h-[18px] text-indigo-600" />}
              iconBg="bg-gray-50"
              label={isArabic ? 'المظهر' : 'Appearance'}
              right={<span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">{settings.displayMode === 'dark' ? (isArabic ? 'داكن' : 'Dark') : (isArabic ? 'مضيء' : 'Light')}</span>}
              onClick={() => updateSettings({ ...settings, displayMode: settings.displayMode === 'dark' ? 'light' : 'dark' })}
            />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<KeyRound className="w-[18px] h-[18px] text-violet-600" />} iconBg="bg-violet-50" label={isArabic ? 'تغيير كلمة المرور' : 'Change Password'} onClick={() => navigate('/account/change-password')} />
          </div>

          {/* Links section */}
          <div className="bg-white dark:bg-neutral-900 rounded-[20px] p-1.5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <Row icon={<Shield className="w-[18px] h-[18px] text-blue-600" />} iconBg="bg-blue-50" label={isArabic ? 'الشروط والخصوصية' : 'Terms & Privacy'} onClick={() => navigate('/terms-privacy')} />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<FileText className="w-[18px] h-[18px] text-orange-600" />} iconBg="bg-orange-50" label={isArabic ? 'سياسة الإرجاع' : 'Return Policy'} onClick={() => navigate('/return-exchange-policy')} />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<Info className="w-[18px] h-[18px] text-teal-600" />} iconBg="bg-teal-50" label={isArabic ? 'عن المتجر' : 'About Us'} onClick={() => navigate('/about-us')} />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<Phone className="w-[18px] h-[18px] text-pink-600" />} iconBg="bg-pink-50" label={isArabic ? 'تواصل معنا' : 'Contact Us'} onClick={() => navigate('/contact')} />
          </div>

          {/* Danger section */}
          <div className="bg-white dark:bg-neutral-900 rounded-[20px] p-1.5 shadow-sm border border-gray-100 dark:border-neutral-800">
            <Row icon={<LogOut className="w-[18px] h-[18px] text-red-600" />} iconBg="bg-red-50" label={isArabic ? 'تسجيل الخروج' : 'Logout'} onClick={handleLogout} danger />
            <div className="h-px bg-gray-50 dark:bg-neutral-800 mx-4" />
            <Row icon={<Trash2 className="w-[18px] h-[18px] text-gray-400" />} iconBg="bg-gray-50 border border-gray-100" label={isArabic ? 'مسح الحساب' : 'Delete Account'} onClick={() => setShowDeleteModal(true)} />
          </div>

        </div>

      </div>

      {/* ── Delete Confirmation Modal ─────────────────────────────────────── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="font-extrabold text-[#1a1a1a] dark:text-white text-lg mb-2">
              {isArabic ? 'مسح الحساب' : 'Delete Account'}
            </h3>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed px-1">
              {isArabic
                ? 'هل أنت متأكد أنك تريد حذف حسابك؟ سيتم حذف بياناتك المحفوظة من هذا الجهاز.'
                : 'Are you sure you want to delete your account? All your saved data on this device will be erased.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 font-bold rounded-xl transition-colors cursor-pointer text-sm"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors cursor-pointer text-sm shadow-sm"
              >
                {isArabic ? 'مسح الحساب' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
