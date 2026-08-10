'use client';
import { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Price } from '../components/Price';
import { fetchOrdersList } from '../api/orders';
import { BackendOrder, ApiPagination } from '../api/types';
import { getSession } from '../utils/auth';

export function Orders() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    fetchOrdersList(page, language)
      .then((res) => {
        if (!isMounted) return;
        if (res.code === 200 && res.data) {
          setOrders(res.data.orders || []);
          setPagination(res.data.pagination || null);
        } else {
          setIsError(true);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsError(true);
        console.error('Failed to fetch orders:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, language, navigate]);

  const getStatusColor = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'مكتمل' || s === 'completed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'قيد التجهيز' || s === 'processing' || s === 'new' || s === 'جديد') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s === 'تم الشحن' || s === 'shipped') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (s === 'ملغي' || s === 'cancelled') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa]" dir={dir}>
      <div className="container mx-auto ">

        {/* Page Title Header */}
        <div className="mb-6 mt-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/account')}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <ArrowRight className={`w-5 h-5 text-gray-800 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
          </button>
          <h2 className="text-[22px] font-black text-[#1a1a1a] font-sans tracking-tight">
            {isArabic ? 'طلباتي السابقة' : 'My Previous Orders'}
          </h2>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100 flex flex-col w-full animate-pulse h-64 justify-between">
                <div className="flex justify-between w-full">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-6 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-10 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {isArabic ? 'حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة لاحقاً.' : 'Failed to load orders. Please try again later.'}
            </p>
          </div>
        )}

        {/* Orders List / Empty state */}
        {!isLoading && !isError && (
          orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isArabic ? 'لا توجد طلبات سابقة حالياً' : 'No previous orders yet'}
              </h3>
              <p className="text-gray-500 mb-8 max-w-[250px] leading-relaxed">
                {isArabic ? 'عند إتمام أول طلب، سيظهر هنا لمتابعته بسهولة.' : 'Once you place your first order, it will appear here for easy tracking.'}
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-[#1a1a1a] text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md hover:bg-black transition-colors cursor-pointer"
              >
                {isArabic ? 'العودة للتسوق' : 'Back to Shopping'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100 flex flex-col items-start w-full justify-between">
                  <div className="w-full">
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 mb-1">{isArabic ? 'رقم الطلب' : 'Order Number'}</span>
                        <span className="font-black text-gray-900 text-[15px]">{order.order_number || `#${order.id}`}</span>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${getStatusColor(order.status_label || order.status)}`}>
                        {order.status_label || order.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full mb-5">
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-medium mb-0.5">{isArabic ? 'تاريخ الطلب' : 'Order Date'}</span>
                        <span className="text-[13px] font-bold text-gray-800">{new Date(order.created_at).toLocaleDateString(isArabic ? 'ar-KW' : 'en-KW')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-medium mb-0.5">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</span>
                        <span className="text-[13px] font-bold text-gray-800">{order.payment_method_name || (isArabic ? 'الدفع الإلكتروني' : 'Online Payment')}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-medium mb-0.5">{isArabic ? 'عدد المنتجات' : 'Products Count'}</span>
                        <span className="text-[13px] font-bold text-gray-800">{order.items_count}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] text-gray-400 font-medium mb-0.5">{isArabic ? 'الإجمالي' : 'Total'}</span>
                        <span className="text-[13px] font-black text-gray-900"><Price amount={order.total} /></span>
                      </div>
                    </div>

                    <div className="w-full h-[1px] bg-gray-50 mb-4"></div>

                    <div className="flex flex-col mb-5 w-full">
                      <span className="text-[11px] text-gray-400 font-medium mb-1">{isArabic ? 'العنوان' : 'Address'}</span>
                      <span className="text-[13px] font-medium text-gray-700 leading-snug line-clamp-1">{order.address}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/orders/${order.id}`)}
                    className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-[#1a1a1a] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-[13px] cursor-pointer"
                  >
                    {isArabic ? 'عرض التفاصيل' : 'View Details'}
                    {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Pagination ── */}
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
              {isArabic ? `صفحة ${page} من ${pagination.last_page}` : `Page ${page} of ${pagination.last_page}`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
