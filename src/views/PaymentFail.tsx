'use client';
import { motion } from 'motion/react';
import { XCircle, ShoppingBag, RefreshCcw, HeadphonesIcon } from 'lucide-react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';

export function PaymentFail() {
  const navigate = useNavigate();
  const { dir, language } = useLanguage();
  const isArabic = language === 'ar';

  return (
    <div
      className="bg-[#fafafa] dark:bg-[#121214] min-h-screen py-10 px-4 select-none"
      dir={dir}
    >
      <div className="max-w-md mx-auto space-y-5">

        {/* ── Hero failure card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="bg-white dark:bg-neutral-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-white/5 text-center space-y-5"
        >
          {/* Animated X icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 150, delay: 0.15 }}
            className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto"
          >
            <XCircle className="w-11 h-11 text-red-500" strokeWidth={1.8} />
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
              {isArabic ? 'فشلت عملية الدفع' : 'Payment Failed'}
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[270px] mx-auto leading-relaxed">
              {isArabic
                ? 'لم تُكتمل عملية الدفع. لم يتم خصم أي مبلغ من حسابك.'
                : 'Your payment was not completed. No amount has been charged to your account.'}
            </p>
          </div>

          {/* Reason hint */}
          <div className="p-3.5 bg-red-50/60 dark:bg-red-900/10 border border-red-100 dark:border-red-800/20 rounded-xl text-center">
            <p className="text-[11px] font-bold text-red-500 dark:text-red-400 leading-relaxed">
              {isArabic
                ? '⚠️ قد يكون السبب: رصيد غير كافٍ، بطاقة منتهية الصلاحية، أو رفض من البنك.'
                : '⚠️ Possible reasons: insufficient funds, expired card, or bank rejection.'}
            </p>
          </div>
        </motion.div>

        {/* ── What to do card ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-gray-50 dark:border-white/5">
            <h2 className="text-xs font-extrabold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
              {isArabic ? 'ماذا تفعل الآن؟' : 'What to do next?'}
            </h2>
          </div>
          <div className="px-5 py-4 space-y-3.5">
            {[
              {
                icon: '💳',
                ar: 'تحقق من بيانات بطاقتك والرصيد المتاح.',
                en: 'Check your card details and available balance.',
              },
              {
                icon: '🔄',
                ar: 'حاول الدفع مرة أخرى باستخدام نفس الطريقة أو طريقة مختلفة.',
                en: 'Retry the payment using the same or a different method.',
              },
              {
                icon: '📞',
                ar: 'تواصل مع البنك إذا استمرت المشكلة.',
                en: 'Contact your bank if the problem persists.',
              },
              {
                icon: '🛒',
                ar: 'سلة التسوق محفوظة — يمكنك إتمام الطلب في أي وقت.',
                en: 'Your cart is still saved — complete your order anytime.',
              },
            ].map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: isArabic ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.07 }}
                className="flex items-start gap-3"
              >
                <span className="text-base leading-none mt-0.5 shrink-0">{tip.icon}</span>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                  {isArabic ? tip.ar : tip.en}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── CTA buttons ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.45 }}
          className="space-y-3 pb-6"
        >
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:shadow-md text-white"
            style={{ backgroundColor: 'var(--store-secondary-color)' }}
          >
            <RefreshCcw className="w-4 h-4" />
            <span>{isArabic ? 'إعادة المحاولة' : 'Try Again'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/contact')}
            className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-700 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <HeadphonesIcon className="w-4 h-4" />
            <span>{isArabic ? 'تواصل مع الدعم' : 'Contact Support'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="w-full text-gray-400 dark:text-gray-500 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:text-gray-600 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isArabic ? 'متابعة التسوق' : 'Continue Shopping'}</span>
          </button>
        </motion.div>

      </div>
    </div>
  );
}
