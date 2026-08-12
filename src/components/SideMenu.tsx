'use client';
import { motion, AnimatePresence } from 'motion/react';
import { Facebook, FileText, Globe, Info, Instagram, Linkedin, LogOut, MessageCircle, Music2, Phone, Send, Share2, Shield, Twitter, User, X, Youtube } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from '../lib/navigation';
import { clearSession, getSession, getOrGenerateDeviceId } from '../utils/auth';
import { logoutApi } from '../api/auth';
import { useContactQuery } from '../hooks/useContactQuery';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const socialIcon = (name: string, link: string, iconClass: string) => {
  const value = `${name} ${link} ${iconClass}`.toLowerCase();
  const Icon = value.includes('facebook')
    ? Facebook
    : value.includes('whatsapp')
      ? MessageCircle
      : value.includes('youtube')
        ? Youtube
        : value.includes('linkedin')
          ? Linkedin
          : value.includes('instagram')
            ? Instagram
            : value.includes('twitter') || value.includes('x.com')
              ? Twitter
              : value.includes('telegram')
                ? Send
                : value.includes('tiktok')
                  ? Music2
                  : Share2;

  return <Icon className="size-[18px]" aria-hidden="true" />;
};

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const { language, setLanguage, dir, t } = useLanguage();
  const { settings, openAuthModal } = useStore();
  const navigate = useNavigate();

  const session = getSession();

  const { contact } = useContactQuery();

  const storeNameVal = language === 'ar' ? settings.storeName : settings.storeNameEn;
  const displayStoreName = storeNameVal || 'App';

  const menuItems = [
    { label: t('termsPrivacy'), icon: Shield, path: '/terms-privacy', onClick: () => { navigate('/terms-privacy'); onClose(); } },
    { label: t('returnExchangePolicy'), icon: FileText, path: '/return-exchange-policy', onClick: () => { navigate('/return-exchange-policy'); onClose(); } },
    { label: t('aboutUs'), icon: Info, path: '/about-us', onClick: () => { navigate('/about-us'); onClose(); } },
    { label: t('contactUs'), icon: Phone, path: '/contact', onClick: () => { navigate('/contact'); onClose(); } },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[70] bg-lc-ink/25 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: dir === 'rtl' ? '100%' : '-100%', opacity: 0.4, scale: 0.98 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: dir === 'rtl' ? '100%' : '-100%', opacity: 0.35, scale: 0.98 }}
            transition={{ type: 'spring', damping: 27, stiffness: 260, mass: 0.85 }}
            className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-[80] flex w-[76%] max-w-[300px] flex-col overflow-hidden border-white/60 bg-white/90 shadow-[0_24px_60px_rgba(23,38,20,0.24),0_4px_14px_rgba(23,38,20,0.1)] backdrop-blur-2xl dark:border-white/10 dark:bg-neutral-900/90 ${dir === 'rtl' ? 'border-l' : 'border-r'}`}
            dir={dir}
            style={{ direction: dir }}
          >
            <div className="relative flex shrink-0 flex-col items-center border-b border-white/20 bg-[linear-gradient(135deg,var(--store-primary-color),var(--store-secondary-color))] px-6 py-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
              <button
                onClick={onClose}
                aria-label={language === 'ar' ? 'إغلاق القائمة' : 'Close menu'}
                className={`absolute top-3.5 ${dir === 'rtl' ? 'left-3.5' : 'right-3.5'} flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/15 transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-white/25 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                <X className="w-3.5 h-3.5 text-white" />
              </button>
              <img
                src={settings.logoUrl}
                alt={displayStoreName}
                onClick={() => {
                  navigate('/home');
                  onClose();
                }}
                className="w-11 h-11 cursor-pointer object-contain invert transition-transform duration-200 hover:scale-105 active:scale-95"

              />
            </div>

            <nav
              className="scrollbar-none w-full flex-1 space-y-1 overflow-y-auto px-3 py-3"
              dir={dir}
              style={{ direction: dir }}
            >
              {menuItems.map((item, index) => {
                const isActive = window.location.pathname === item.path;

                return (
                  <motion.button
                    key={index}
                    onClick={item.onClick}
                    dir={dir}
                    style={{ direction: dir }}
                    initial={{ opacity: 0, x: dir === 'rtl' ? 12 : -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + index * 0.045, duration: 0.24, ease: 'easeOut' }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex h-[52px] w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 transition-[background-color,color,box-shadow] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-secondary-color)] ${isActive
                        ? 'bg-[var(--store-secondary-color)]/12 font-extrabold text-[var(--store-secondary-color)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--store-secondary-color)_14%,transparent)]'
                        : 'text-gray-700 hover:bg-white/70 dark:text-gray-200 dark:hover:bg-white/10'
                      }`}
                  >
                    <item.icon className={`w-[20px] h-[20px] shrink-0 transition-colors ${isActive ? 'text-[var(--store-secondary-color)]' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    <span className={`text-[15px] font-bold flex-1 tracking-tight leading-none ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24, duration: 0.24, ease: 'easeOut' }}
              className="shrink-0 space-y-2 border-t border-white/70 bg-white/55 px-4 pb-6 pt-3 backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55"
            >

              {/* Social links */}
              {contact?.socials && contact.socials.length > 0 && (
                <div className="flex flex-wrap gap-2 py-2 justify-center">
                  {contact.socials.map((social) => (
                    <a
                      key={social.id}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.name}
                      aria-label={social.name}
                      className="flex size-9 items-center justify-center rounded-xl border border-white/65 bg-white/65 text-gray-600 shadow-sm transition-[transform,background-color,color,box-shadow] duration-200 hover:-translate-y-0.5 hover:scale-105 hover:bg-[var(--store-secondary-color)] hover:text-white hover:shadow-md active:scale-95 dark:border-white/5 dark:bg-white/10 dark:text-gray-200"
                    >
                      {social.icon ? (
                        <img src={social.icon} alt={social.name} className="w-4.5 h-4.5 object-contain" />
                      ) : (
                        socialIcon(social.name, social.link, social.icon_class)
                      )}
                    </a>
                  ))}
                </div>
              )}

              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-gray-700 transition-[background-color,transform] duration-200 hover:bg-white/70 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--store-secondary-color)] dark:text-gray-200 dark:hover:bg-white/10"
                dir={dir}
              >
                <Globe className="w-[18px] h-[18px] text-gray-500" />
                <span className={`text-[14px] font-bold text-gray-700 dark:text-gray-200 flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                  {language === 'ar' ? 'English' : 'العربية'}
                </span>
              </button>

              {session ? (
                <>
                  {/* User Profile Info Mini Card */}
                  <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/65 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/10">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--store-secondary-color)]/15 text-[var(--store-secondary-color)] shrink-0 font-black text-xs">
                      {session.name ? session.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black text-gray-900 dark:text-white truncate">
                        {session.name || t('user')}
                      </p>
                      <p className="text-[10px] text-gray-400 font-medium truncate" dir="ltr">
                        {session.phone || session.phoneNumber}
                      </p>
                    </div>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={async () => {
                      try {
                        const deviceId = getOrGenerateDeviceId();
                        await logoutApi(deviceId, language);
                      } catch (err) {
                        console.error('Logout error:', err);
                      } finally {
                        clearSession();
                        navigate('/home');
                        window.location.reload();
                        onClose();
                      }
                    }}
                    className="group flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-2xl px-3 transition-[background-color,transform] hover:bg-rose-50/80 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500 dark:hover:bg-rose-950/20"
                    dir={dir}
                  >
                    <LogOut className="w-[18px] h-[18px] text-rose-500 group-hover:text-rose-600 transition-colors" />
                    <span className={`text-[14px] font-bold text-rose-600 group-hover:text-rose-700 flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {t('logoutLabel')}
                    </span>
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-1.5 pt-1">
                  {/* Login button */}
                  <button
                    onClick={() => { openAuthModal(); onClose(); }}
                    className="flex h-[44px] w-full cursor-pointer items-center justify-center rounded-2xl border border-gray-200/80 bg-white/50 text-[14px] font-bold text-gray-750 transition-[background-color,transform,box-shadow] hover:-translate-y-px hover:bg-white/90 hover:shadow-sm active:scale-[0.98] dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
                  >
                    {t('login')}
                  </button>
                  {/* Register button */}
                  <button
                    onClick={() => { openAuthModal(); onClose(); }}
                    className="flex h-[44px] w-full cursor-pointer items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--store-primary-color),var(--store-secondary-color))] text-[14px] font-bold text-white shadow-[0_7px_14px_color-mix(in_srgb,var(--store-secondary-color)_30%,transparent)] transition-[transform,box-shadow,filter] hover:-translate-y-px hover:brightness-105 hover:shadow-[0_10px_18px_color-mix(in_srgb,var(--store-secondary-color)_35%,transparent)] active:scale-[0.98]"
                  >
                    {t('register')}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
