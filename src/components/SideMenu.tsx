'use client';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../types';
import { User, X, Globe, LogOut, ShoppingBag, Bell, Shield, FileText, Info, Phone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from '../lib/navigation';
import { clearSession, getSession, getOrGenerateDeviceId } from '../utils/auth';
import { logoutApi } from '../api/auth';
import { useContactQuery } from '../hooks/useContactQuery';
import React, { useEffect, useState } from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export function SideMenu({ isOpen, onClose, currentView, onNavigate }: SideMenuProps) {
  const { language, setLanguage, dir, t } = useLanguage();
  const { settings, openAuthModal, isLoggedIn } = useStore();
  const navigate = useNavigate();

  const session = getSession();

  const { contact } = useContactQuery();

  const storeNameVal = language === 'ar' ? settings.storeName : settings.storeNameEn;
  const displayStoreName = storeNameVal || 'App';

  const handleProtectedNavigation = (path: string) => {
    if (!isLoggedIn) {
      openAuthModal(() => {
        navigate(path);
      });
    } else {
      navigate(path);
    }
    onClose();
  };

  const menuItems = [
    { label: t('account'), icon: User, onClick: () => handleProtectedNavigation('/account') },
    { label: t('myOrders'), icon: ShoppingBag, onClick: () => handleProtectedNavigation('/orders') },
    { label: t('notifications'), icon: Bell, onClick: () => handleProtectedNavigation('/notifications') },
    { label: t('termsPrivacy'), icon: Shield, onClick: () => { navigate('/terms-privacy'); onClose(); } },
    { label: t('returnExchangePolicy'), icon: FileText, onClick: () => { navigate('/return-exchange-policy'); onClose(); } },
    { label: t('aboutUs'), icon: Info, onClick: () => { navigate('/about-us'); onClose(); } },
    { label: t('contactUs'), icon: Phone, onClick: () => { navigate('/contact'); onClose(); } },
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
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-[76%] max-w-[300px] bg-white dark:bg-neutral-900 z-50 flex flex-col shadow-2xl overflow-hidden`}
            dir={dir}
            style={{ direction: dir }}
          >
            {/* Header section with reduced height and centered smaller logo */}
            <div className="py-5 px-6 bg-[#1a1a1a] text-white flex flex-col items-center border-b-2 border-[var(--store-secondary-color)] relative shrink-0">
              <button
                onClick={onClose}
                className={`absolute top-3.5 ${dir === 'rtl' ? 'left-3.5' : 'right-3.5'} w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none`}
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
                className="w-11 h-11 object-contain invert cursor-pointer transition-transform active:scale-95"

              />
            </div>

            {/* Scrollable menu navigation */}
            <nav
              className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto scrollbar-none w-full"
              dir={dir}
              style={{ direction: dir }}
            >
              {menuItems.map((item, index) => {
                // Check if current page matches standard paths for subtle active state
                const isActive = (
                  (item.label === t('account') && window.location.pathname === '/account') ||
                  (item.label === t('myOrders') && window.location.pathname === '/orders')
                );

                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    dir={dir}
                    style={{ direction: dir }}
                    className={`w-full h-[52px] flex items-center gap-3 px-3.5 rounded-xl transition-all duration-200 cursor-pointer focus:outline-none ${isActive
                        ? 'bg-[var(--store-secondary-color)]/10 text-[var(--store-secondary-color)] font-extrabold'
                        : 'hover:bg-gray-50 dark:hover:bg-neutral-800/60 text-gray-700 dark:text-gray-200 active:bg-gray-100 dark:active:bg-neutral-800'
                      }`}
                  >
                    <item.icon className={`w-[20px] h-[20px] shrink-0 transition-colors ${isActive ? 'text-[var(--store-secondary-color)]' : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    <span className={`text-[15px] font-bold flex-1 tracking-tight leading-none ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* Bottom utility actions */}
            <div className="px-4 pb-6 pt-3 border-t border-gray-100 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/40 shrink-0 space-y-2">

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
                      className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-neutral-800 hover:bg-[var(--store-secondary-color)] hover:scale-110 transition-all duration-200 active:scale-95"
                    >
                      {social.icon ? (
                        <img src={social.icon} alt={social.name} className="w-4.5 h-4.5 object-contain" />
                      ) : (
                        <span className="text-[10px] font-black text-gray-600 dark:text-gray-300">
                          {social.name.charAt(0)}
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}

              <button
                onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                className="w-full flex items-center gap-3 px-3 h-[46px] rounded-2xl transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none text-gray-700 dark:text-gray-200 cursor-pointer"
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
                  <div className="flex items-center gap-3 px-3 py-2 bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700">
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
                    className="w-full flex items-center gap-3 px-3 h-[46px] rounded-2xl transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/20 focus:outline-none group cursor-pointer"
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
                    className="w-full flex items-center justify-center h-[44px] rounded-2xl text-[14px] font-bold text-gray-750 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer border border-gray-200 dark:border-neutral-800"
                  >
                    {t('login')}
                  </button>
                  {/* Register button */}
                  <button
                    onClick={() => { openAuthModal(); onClose(); }}
                    className="w-full flex items-center justify-center h-[44px] rounded-2xl text-[14px] font-bold bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
                  >
                    {t('register')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
