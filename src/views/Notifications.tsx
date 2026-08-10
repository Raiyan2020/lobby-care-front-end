'use client';
import { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, Bell, Package, CheckCircle, Truck, Award, Check, X, Trash2, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  fetchNotificationsList,
  markNotificationsAsRead,
  deleteNotificationApi,
  clearAllNotificationsApi,
  toggleNotificationStatusApi
} from '../api/notifications';
import { ApiNotification, ApiPagination } from '../api/types';
import { getSession } from '../utils/auth';

export function Notifications() {
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);

  // Toggle state
  const [isNotifiable, setIsNotifiable] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  // Initialize toggle status from session
  useEffect(() => {
    const session = getSession();
    if (session) {
      setIsNotifiable(session.is_notifiable ?? true);
    }
  }, []);

  // Fetch list
  const loadNotifications = (pageNum: number) => {
    setIsLoading(true);
    setIsError(false);
    fetchNotificationsList(pageNum, language)
      .then((res) => {
        if (res.code === 200 && res.data) {
          setNotifications(res.data.notifications || []);
          setPagination(res.data.pagination || null);

          // Automatically mark all as read on the backend once they are fetched
          markNotificationsAsRead(language).catch(() => { });
        } else {
          setIsError(true);
        }
      })
      .catch((err) => {
        setIsError(true);
        console.error('Failed to load notifications:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const session = getSession();
    if (!session || !session.isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    loadNotifications(page);
  }, [page, language, navigate]);

  const handleMarkAllRead = async () => {
    try {
      await markNotificationsAsRead(language);
      // Backend updates unread counts. All fetched notifications can be treated as read
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm(t('clearAllNotificationsConfirm'))) {
      return;
    }
    try {
      setIsLoading(true);
      const res = await clearAllNotificationsApi(language);
      if (res.code === 200) {
        setNotifications([]);
        setPagination(null);
      }
    } catch (err) {
      console.error('Clear all error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const res = await deleteNotificationApi(id, language);
      if (res.code === 200) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      setIsToggling(true);
      const res = await toggleNotificationStatusApi(language);
      if (res.code === 200 && res.data) {
        const nextVal = res.data.is_notify;
        setIsNotifiable(nextVal);

        // Sync with local session
        const session = getSession();
        if (session) {
          session.is_notifiable = nextVal;
          localStorage.setItem('user_session', JSON.stringify(session));
        }
      }
    } catch (err) {
      console.error('Toggle notifications error:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const getIcon = (type: string) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('order') || t.includes('received')) return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    if (t.includes('processing') || t.includes('prepare')) return <Package className="w-5 h-5 text-indigo-500" />;
    if (t.includes('shipped') || t.includes('delivery')) return <Truck className="w-5 h-5 text-blue-500" />;
    if (t.includes('points') || t.includes('loyalty')) return <Award className="w-5 h-5 text-amber-500" />;
    return <Bell className="w-5 h-5 text-gray-500" />;
  };

  const getIconBg = (type: string) => {
    const t = String(type || '').toLowerCase();
    if (t.includes('order') || t.includes('received')) return 'bg-emerald-50';
    if (t.includes('processing') || t.includes('prepare')) return 'bg-indigo-50';
    if (t.includes('shipped') || t.includes('delivery')) return 'bg-blue-50';
    if (t.includes('points') || t.includes('loyalty')) return 'bg-amber-50';
    return 'bg-gray-50';
  };

  const formatNotificationDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('منذ') || dateStr.includes('ago') || isNaN(Date.parse(dateStr))) {
      return dateStr;
    }
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === 'ar' ? 'ar-KW' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa]" dir={dir}>
      <div className="container mx-auto ">

        {/* Page Title Header */}
        <div className="mb-6 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              <ArrowRight className={`w-5 h-5 text-gray-800 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
            </button>
            <h2 className="text-[22px] font-black text-[#1a1a1a] font-sans tracking-tight leading-tight">
              {t('notifications')}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-end sm:self-auto">
            {/* Toggle switch */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-gray-100 shadow-sm select-none">
              <span className="text-[11px] font-bold text-gray-600">
                {t('receiveNotifications')}
              </span>
              <button
                onClick={handleToggleNotifications}
                disabled={isToggling}
                className={`w-9 h-5 rounded-full flex items-center p-0.5 transition-colors cursor-pointer focus:outline-none ${isNotifiable ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isNotifiable ? (dir === 'rtl' ? '-translate-x-4' : 'translate-x-4') : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-full transition-colors text-[11px] font-bold text-red-600 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3.5 items-start animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="bg-white rounded-[20px] p-8 shadow-2xs border border-gray-100 text-center">
            <p className="text-gray-500 font-medium">
              {t('failedToLoadNotifications')}
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && !isError && (
          notifications.length === 0 ? (
            <div className="bg-white rounded-[20px] p-8 shadow-2xs border border-gray-100 flex flex-col items-center justify-center text-center mt-4">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-bold text-[15px] text-gray-900 mb-2">
                {t('noNotificationsYet')}
              </h3>
              <p className="text-[13px] text-gray-500 leading-relaxed font-medium">
                {t('noNotificationsDesc')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-gray-200 transition-all flex items-start justify-between gap-4"
                >
                  <div className="flex gap-3.5 items-start flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col gap-0.5 mb-1.5 text-right">
                        <h4 className="font-bold text-[14px] text-gray-900">
                          {isArabic ? notif.title : notif.data?.title?.en || notif.title}
                        </h4>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {formatNotificationDate(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-gray-700 text-right font-medium">
                        {isArabic ? notif.body : notif.data?.body?.en || notif.body}
                      </p>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteNotification(notif.id)}
                    className="w-8 h-8 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Pagination */}
        {!isLoading && !isError && pagination && pagination.last_page > 1 && (
          <div className="flex flex-col items-center mt-12 gap-3">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-black transition-colors cursor-pointer"
              >
                {dir === 'rtl' ? <ChevronRight className="w-4 h-4 text-gray-600" /> : <ChevronLeft className="w-4 h-4 text-gray-600" />}
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: pagination.last_page }).map((_, idx) => {
                  const p = idx + 1;
                  const isActive = p === page;
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-full text-xs font-black transition-all cursor-pointer border ${isActive ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-transparent text-gray-600 border-gray-200 hover:border-gray-400'
                        }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                disabled={page === pagination.last_page}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm disabled:opacity-40 hover:border-black transition-colors cursor-pointer"
              >
                {dir === 'rtl' ? <ChevronLeft className="w-4 h-4 text-gray-600" /> : <ChevronRight className="w-4 h-4 text-gray-600" />}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              {t('pageOf').replace('{page}', String(page)).replace('{lastPage}', String(pagination.last_page))}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
