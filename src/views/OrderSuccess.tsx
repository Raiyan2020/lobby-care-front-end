'use client';
import { useNavigate } from '../lib/navigation';
import { motion } from 'motion/react';
import { CheckCircle, ShoppingBag, ClipboardList, Info, HelpCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Price } from '../components/Price';
import { getSession } from '../utils/auth';

export function OrderSuccess() {
  const navigate = useNavigate();
  const { dir, language } = useLanguage();
  const isArabic = language === 'ar';

  // Read order and justSignedUp from sessionStorage (set by Checkout.tsx)
  let order: Record<string, any> | null = null;
  let justSignedUp = false;
  try {
    const rawOrder = sessionStorage.getItem('last_order');
    if (rawOrder) order = JSON.parse(rawOrder);
    justSignedUp = sessionStorage.getItem('just_signed_up') === 'true';
  } catch { /* ignore */ }

  if (!order) {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
      if (savedOrders && savedOrders.length > 0) {
        order = savedOrders[0];
      }
    } catch (e) {
      // Fallback
    }
  }

  const session = getSession();
  const isLoggedIn = !!session?.isLoggedIn;

  const handleContinueShopping = () => {
    navigate('/home');
  };

  const handleViewOrders = () => {
    navigate('/account');
  };

  // If there's no order found, let's show a graceful redirect state
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center" dir={dir}>
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <HelpCircle className="w-8 h-8 text-neutral-300" />
        </div>
        <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">
          {isArabic ? 'لم يتم العثور على طلب' : 'No Order Found'}
        </h2>
        <p className="text-gray-400 text-xs mb-6 max-w-xs leading-relaxed">
          {isArabic ? 'يبدو أنك لم تقم بطلب أي منتج حالياً، أو تم الانتقال لهذه الصفحة مباشرة.' : 'It looks like no order has been initiated in this session yet.'}
        </p>
        <button
          type="button"
          onClick={handleContinueShopping}
          className="bg-[#1a1a1a] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-colors w-full max-w-xs cursor-pointer text-xs"
        >
          {isArabic ? 'العودة للرئيسية' : 'Go Home'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-[80vh] py-10 px-5 select-none" dir={dir}>
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Verification Success Celebration Indicator */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15, delay: 0.1 }}
            className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500"
          >
            <CheckCircle className="w-9 h-9" />
          </motion.div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-gray-900 leading-normal">
              {isArabic ? 'تم استلام طلبك بنجاح' : 'Order Received Successfully'}
            </h2>
            <p className="text-[13px] text-gray-500 max-w-[270px] mx-auto leading-relaxed font-medium">
              {order.paymentMethodId === 'payment_link'
                ? (isArabic ? 'سيتم إرسال رابط الدفع لك بعد مراجعة الطلب.' : 'A payment link will be sent to you after the order is reviewed.')
                : (isArabic ? 'سنقوم بتجهيز طلبك والتواصل معك قريباً للتأكيد.' : 'We will prepare your order and contact you soon.')}
            </p>
          </div>

          {/* Account save reward point callout check */}
          {justSignedUp && (
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-center">
              <p className="text-[11px] text-indigo-600 font-bold leading-relaxed">
                🎉 {isArabic ? 'مبارك! تم إنشاء حسابك وحفظ عنوانك بنجاح.' : 'Awesome! Your account is created & and shipping saved successfully.'}
              </p>
              <p className="text-[10px] text-indigo-400 mt-1">
                {isArabic ? 'لقد ربحت 50 نقطة مكافأة ترحيبية في رصيدك!' : 'You have earned 50 signup reward bonus points in your wallet!'}
              </p>
            </div>
          )}
        </div>

        {/* Invoice reference summary card */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-xs font-extrabold text-gray-900 border-b border-gray-50 pb-2">
            {isArabic ? 'بيانات الفاتورة والطلب' : 'Invoice Details'}
          </h3>

          <div className="space-y-2.5 text-xs text-gray-600 font-sans">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{isArabic ? 'رقم الطلب' : 'Order Reference'}</span>
              <span className="font-bold text-gray-950 font-mono tracking-wide">{order.id}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">{isArabic ? 'الإجمالي' : 'Total Invoice Sum'}</span>
              <span className="font-extrabold text-indigo-600">
                <Price amount={order.total} />
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">{isArabic ? 'طريقة الدفع' : 'Payment Type'}</span>
              <span className="font-bold text-gray-950">{order.paymentMethod}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">{isArabic ? 'حالة الطلب' : 'Dispatch Status'}</span>
              <span className="font-extrabold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-[10px]">
                {isArabic ? 'قيد التجهيز' : 'Processing'}
              </span>
            </div>

            <div className="flex justify-between items-start pt-2 border-t border-gray-50 text-[11px] leading-relaxed">
              <span className="text-gray-400 shrink-0">{isArabic ? 'العنوان' : 'Shipment to'}</span>
              <span className="text-gray-600 text-left font-serif max-w-[200px]" style={{ direction: 'rtl' }}>
                {order.address}
              </span>
            </div>
          </div>
        </div>

        {/* Buttons navigation area */}
        <div className="space-y-3 pt-2">
          
          <button
            type="button"
            onClick={handleViewOrders}
            className="w-full bg-[#1a1a1a] hover:bg-black text-white py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{isArabic ? 'عرض طلباتي ورصيدي' : 'Show My Orders & Wallet'}</span>
          </button>

          <button
            type="button"
            onClick={handleContinueShopping}
            className="w-full bg-[#ffffff] border border-gray-200 text-gray-700 hover:bg-gray-50 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isArabic ? 'متابعة التسوق' : 'Continue Shopping'}</span>
          </button>

        </div>

      </div>
    </div>
  );
}
