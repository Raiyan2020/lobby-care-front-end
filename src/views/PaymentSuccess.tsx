'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import {
  CheckCircle,
  ShoppingBag,
  ClipboardList,
  Package,
  MapPin,
  CreditCard,
  Loader2,
  AlertCircle,
  Receipt,
  Star,
} from 'lucide-react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchOrderDetail } from '../api/orders';
import { Price } from '../components/Price';
import type { OrderDetailData } from '../api/types';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { dir, language } = useLanguage();
  const isArabic = language === 'ar';
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setIsError(true);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    fetchOrderDetail(orderId, language)
      .then((res) => {
        setOrder(res.data);
      })
      .catch(() => setIsError(true))
      .finally(() => setIsLoading(false));
  }, [orderId, language]);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4" dir={dir}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        >
          <Loader2 className="w-10 h-10 text-[var(--store-secondary-color)]" />
        </motion.div>
        <p className="text-sm font-semibold text-gray-400">
          {isArabic ? 'جارٍ تحميل تفاصيل الطلب…' : 'Loading your order details…'}
        </p>
      </div>
    );
  }

  // ── Error / no ID state ──────────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-5" dir={dir}>
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-black text-gray-800">
            {isArabic ? 'تعذّر تحميل بيانات الطلب' : 'Could not load order'}
          </h2>
          <p className="text-xs text-gray-400 max-w-[260px] leading-relaxed">
            {isArabic
              ? 'يُرجى التحقق من حالة طلبك من صفحة الطلبات.'
              : 'Please check your order status from the orders page.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/account')}
          className="bg-[#1a1a1a] text-white px-8 py-3 rounded-xl font-bold text-xs cursor-pointer"
        >
          {isArabic ? 'عرض طلباتي' : 'View My Orders'}
        </button>
      </div>
    );
  }

  const paymentName =
    language === 'ar' ? order.payment_method?.name?.ar : order.payment_method?.name?.en;
  const addressLabel = order.address?.title || order.address?.map_desc || '—';

  return (
    <div
      className="bg-[#fafafa] dark:bg-[#121214] min-h-screen py-8 px-4 select-none"
      dir={dir}
    >
      <div className="max-w-md mx-auto space-y-4">

        {/* ── Hero success card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-7 shadow-sm border border-gray-100 dark:border-white/5 text-center space-y-4"
        >
          {/* Animated checkmark */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 160, delay: 0.15 }}
            className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto"
          >
            <CheckCircle className="w-11 h-11 text-green-500" strokeWidth={1.8} />
          </motion.div>

          <div className="space-y-1.5">
            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
              {isArabic ? '🎉 تمّت عملية الدفع بنجاح!' : '🎉 Payment Successful!'}
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[270px] mx-auto leading-relaxed">
              {isArabic
                ? 'تم تأكيد طلبك وسنبدأ بتجهيزه فوراً.'
                : 'Your order is confirmed and we&apos;ll start processing it right away.'}
            </p>
          </div>

          {/* Order number badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-50 dark:bg-neutral-800 rounded-full border border-gray-100 dark:border-white/5">
            <Receipt className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-black text-gray-500 dark:text-gray-400 tracking-wider font-mono">
              #{order.order_number}
            </span>
          </div>
        </motion.div>

        {/* ── Invoice details card ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-gray-50 dark:border-white/5">
            <h2 className="text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              {isArabic ? 'تفاصيل الطلب' : 'Order Summary'}
            </h2>
          </div>

          <div className="px-5 py-4 space-y-3 text-xs">
            {/* Order ID */}
            <Row
              icon={<Receipt className="w-3.5 h-3.5 text-gray-400" />}
              label={isArabic ? 'رقم الطلب' : 'Order ID'}
              value={<span className="font-mono font-black text-gray-900 dark:text-white">{order.id}</span>}
            />

            {/* Status */}
            <Row
              icon={<Package className="w-3.5 h-3.5 text-gray-400" />}
              label={isArabic ? 'حالة الطلب' : 'Status'}
              value={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800/30">
                  {order.status_label}
                </span>
              }
            />

            {/* Payment status */}
            <Row
              icon={<CreditCard className="w-3.5 h-3.5 text-gray-400" />}
              label={isArabic ? 'حالة الدفع' : 'Payment'}
              value={
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/30">
                  {order.payment_status_label}
                </span>
              }
            />

            {/* Payment method */}
            <Row
              icon={<CreditCard className="w-3.5 h-3.5 text-gray-400" />}
              label={isArabic ? 'طريقة الدفع' : 'Payment Method'}
              value={<span className="font-bold text-gray-700 dark:text-gray-300">{paymentName}</span>}
            />

            {/* Address */}
            <Row
              icon={<MapPin className="w-3.5 h-3.5 text-gray-400" />}
              label={isArabic ? 'عنوان التوصيل' : 'Delivery Address'}
              value={
                <span className="text-gray-600 dark:text-gray-400 text-right leading-relaxed max-w-[160px]">
                  {addressLabel}
                </span>
              }
            />

            <div className="h-px bg-gray-50 dark:bg-white/5" />

            {/* Subtotal */}
            <Row
              label={isArabic ? 'المجموع الفرعي' : 'Subtotal'}
              value={<span className="font-bold text-gray-700 dark:text-gray-300"><Price amount={order.subtotal} /></span>}
            />

            {/* Tax */}
            {order.tax_value > 0 && (
              <Row
                label={isArabic ? `ضريبة (${order.tax_rate}%)` : `Tax (${order.tax_rate}%)`}
                value={<span className="text-gray-500 dark:text-gray-400"><Price amount={order.tax_value} /></span>}
              />
            )}

            {/* Total */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-white/5">
              <span className="text-sm font-black text-gray-800 dark:text-white">
                {isArabic ? 'الإجمالي' : 'Total'}
              </span>
              <span className="text-base font-black" style={{ color: 'var(--store-secondary-color)' }}>
                <Price amount={order.total} />
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Order items ────────────────────────────────────────────────────── */}
        {order.items && order.items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-gray-50 dark:border-white/5">
              <h2 className="text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                {isArabic ? 'المنتجات' : 'Items'} ({order.items.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {order.items.map((item) => {
                const name = language === 'ar' ? item.product_name?.ar : item.product_name?.en;
                return (
                  <div key={item.id} className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-gray-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {isArabic ? `الكمية: ${item.quantity}` : `Qty: ${item.quantity}`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 shrink-0">
                      <Price amount={item.line_total} />
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Loyalty points earned ─────────────────────────────────────────── */}
        {order.loyalty_points_earned > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.4 }}
            className="flex items-center gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/20"
          >
            <Star className="w-5 h-5 text-amber-500 shrink-0" fill="currentColor" />
            <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
              {isArabic
                ? `🏆 ربحت ${order.loyalty_points_earned} نقطة مكافأة من هذا الطلب!`
                : `🏆 You earned ${order.loyalty_points_earned} loyalty points from this order!`}
            </p>
          </motion.div>
        )}

        {/* ── CTA buttons ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 }}
          className="space-y-3 pb-6"
        >
          <button
            type="button"
            onClick={() => navigate('/account')}
            className="w-full bg-[#1a1a1a] dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-[#1a1a1a] py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{isArabic ? 'عرض طلباتي' : 'View My Orders'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isArabic ? 'متابعة التسوق' : 'Continue Shopping'}</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}

// ── Helper sub-component ──────────────────────────────────────────────────────
function Row({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
        {icon}
        <span className="text-[11px]">{label}</span>
      </div>
      <div className="text-right">{value}</div>
    </div>
  );
}
