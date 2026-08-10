'use client';
import { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, Award, Plus, Minus, Clock, RefreshCw, XCircle, AlertTriangle } from 'lucide-react';

interface PointTransaction {
  id: string;
  type: 'earned' | 'redeemed' | 'pending' | 'cancelled' | 'expired';
  date: string;
  orderId?: string;
  amount: number;
  expiryDate?: string;
}

export function Points() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [expiringSoonPoints, setExpiringSoonPoints] = useState(0);


  useEffect(() => {
    let allTx: PointTransaction[] = [];
    let hasRealData = false;

    // Load from orders
    const localOrders = localStorage.getItem('user_orders');
    if (localOrders) {
      try {
        const parsed = JSON.parse(localOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          hasRealData = true;
          parsed.forEach((order: any) => {
            const pointsAmt = Math.floor(order.total || 0);
            if (pointsAmt > 0) {
              const statusEn = order.status === 'مكتمل' ? 'Completed' :
                order.status === 'قيد التجهيز' ? 'Processing' :
                  order.status === 'تم الشحن' ? 'Shipped' :
                    order.status === 'ملغي' ? 'Cancelled' : order.status;

              let type: PointTransaction['type'] = 'pending';
              if (statusEn === 'Completed') type = 'earned';
              else if (statusEn === 'Cancelled') type = 'cancelled';
              else if (statusEn === 'Processing' || statusEn === 'Shipped') type = 'pending';

              const orderDate = new Date(order.date);
              const expiryDate = new Date(orderDate);
              expiryDate.setMonth(expiryDate.getMonth() + 3);

              allTx.push({
                id: `TX-ORD-${order.id}`,
                type,
                date: order.date,
                orderId: order.id,
                amount: pointsAmt,
                ...(type === 'earned' || type === 'pending' ? { expiryDate: expiryDate.toISOString() } : {})
              });
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse user orders for points');
      }
    }

    // Load explicit transactions (like redeemed)
    const localTx = localStorage.getItem('customerPointsTransactions');
    if (localTx) {
      try {
        const parsedTx = JSON.parse(localTx);
        if (Array.isArray(parsedTx) && parsedTx.length > 0) {
          hasRealData = true;
          allTx = [...allTx, ...parsedTx];
        }
      } catch (e) {
        console.error('Failed to parse customer points transactions');
      }
    }

    if (!hasRealData) {
      // Demo Data
      allTx = [
        {
          id: 'TX-1',
          type: 'earned',
          date: '2026-02-15T14:30:00Z',
          orderId: 'ORD-102934',
          amount: 25,
          expiryDate: '2026-05-15T14:30:00Z'
        },
        {
          id: 'TX-2',
          type: 'redeemed',
          date: '2026-03-01T10:00:00Z',
          orderId: 'ORD-103001',
          amount: 10
        },
        {
          id: 'TX-3',
          type: 'earned',
          date: '2026-05-28T09:15:00Z',
          orderId: 'ORD-102935',
          amount: 18,
          expiryDate: '2026-08-28T09:15:00Z'
        }
      ];
    }

    // Sort ascending by date to calculate balances accurately
    allTx.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // De-duplicate just in case
    const uniqueTxMap = new Map<string, PointTransaction>();
    allTx.forEach(tx => uniqueTxMap.set(tx.id, tx));
    const sortedBaseTx = Array.from(uniqueTxMap.values());

    let activePoints: { txId: string, amount: number, expiryDate: Date }[] = [];
    const now = new Date();

    let generatedExpired: PointTransaction[] = [];
    let earned = 0;
    let spent = 0;
    let pending = 0;

    for (const tx of sortedBaseTx) {
      if (tx.type === 'earned') {
        earned += tx.amount;
        if (tx.expiryDate) {
          activePoints.push({
            txId: tx.id,
            amount: tx.amount,
            expiryDate: new Date(tx.expiryDate)
          });
        }
      } else if (tx.type === 'redeemed') {
        spent += tx.amount;
        let remainingToDeduct = tx.amount;
        for (let i = 0; i < activePoints.length; i++) {
          if (remainingToDeduct <= 0) break;
          if (activePoints[i].amount > 0) {
            const deduct = Math.min(activePoints[i].amount, remainingToDeduct);
            activePoints[i].amount -= deduct;
            remainingToDeduct -= deduct;
          }
        }
      } else if (tx.type === 'pending') {
        pending += tx.amount;
      }
    }

    let expiringSoon = 0;
    for (const ap of activePoints) {
      if (ap.amount > 0) {
        if (ap.expiryDate < now) {
          generatedExpired.push({
            id: `EXP-${ap.txId}`,
            type: 'expired',
            date: ap.expiryDate.toISOString(),
            amount: ap.amount,
            expiryDate: ap.expiryDate.toISOString()
          });
          ap.amount = 0; // expired, no longer available
        } else {
          const daysToExpiry = (ap.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
          if (daysToExpiry <= 14) {
            expiringSoon += ap.amount;
          }
        }
      }
    }

    const available = activePoints.reduce((sum, ap) => sum + ap.amount, 0);
    const finalTx = [...sortedBaseTx, ...generatedExpired].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setTransactions(finalTx);
    setTotalEarned(earned);
    setTotalSpent(spent);
    setPendingPoints(pending);
    setAvailablePoints(available);
    setExpiringSoonPoints(expiringSoon);

    // Save balance for potential other uses
    localStorage.setItem('customerPointsBalance', JSON.stringify(available));

  }, []);

  const getTxDetails = (tx: PointTransaction) => {
    switch (tx.type) {
      case 'earned':
        return {
          title: isArabic ? 'كسب نقاط' : 'Points Earned',
          desc: tx.orderId ? (isArabic ? `كسب نقاط من الطلب رقم #${tx.orderId}` : `Points earned from order #${tx.orderId}`) : '',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          icon: <Plus className="w-4 h-4" />,
          sign: '+',
          borderColor: 'border-emerald-100'
        };
      case 'redeemed':
        return {
          title: isArabic ? 'صرف نقاط' : 'Points Redeemed',
          desc: tx.orderId ? (isArabic ? `صرف نقاط على الطلب رقم #${tx.orderId}` : `Points redeemed on order #${tx.orderId}`) : '',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          icon: <Minus className="w-4 h-4" />,
          sign: '-',
          borderColor: 'border-red-100'
        };
      case 'pending':
        return {
          title: isArabic ? 'نقاط معلقة' : 'Pending Points',
          desc: tx.orderId ? (isArabic ? `نقاط معلقة من الطلب رقم #${tx.orderId}` : `Pending points from order #${tx.orderId}`) : '',
          color: 'text-amber-500',
          bgColor: 'bg-amber-50',
          icon: <Clock className="w-4 h-4" />,
          sign: '+',
          borderColor: 'border-amber-100'
        };
      case 'cancelled':
        return {
          title: isArabic ? 'إلغاء نقاط' : 'Points Cancelled',
          desc: tx.orderId ? (isArabic ? `ألغيت نقاط الطلب رقم #${tx.orderId}` : `Points cancelled from order #${tx.orderId}`) : '',
          color: 'text-gray-400',
          bgColor: 'bg-gray-50',
          icon: <XCircle className="w-4 h-4" />,
          sign: '',
          borderColor: 'border-gray-100'
        };
      case 'expired':
        return {
          title: isArabic ? 'نقاط منتهية الصلاحية' : 'Expired Points',
          desc: tx.orderId ? (isArabic ? `نقاط منتهية للطلب رقم #${tx.orderId}` : `Expired points from order #${tx.orderId}`) : '',
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          icon: <XCircle className="w-4 h-4" />,
          sign: '-',
          borderColor: 'border-gray-200'
        };
    }
  };

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa]" dir={dir}>

      {/* Page Title Header */}
      <div className="px-5 mb-6 mt-2 flex items-center gap-3">
        <button
          onClick={() => navigate('/account')}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm shrink-0"
        >
          <ArrowRight className={`w-5 h-5 text-gray-800 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
        </button>
        <h2 className="text-[22px] font-black text-[#1a1a1a] font-sans tracking-tight">
          {isArabic ? 'رصيد نقاطي' : 'My Points Balance'}
        </h2>
      </div>

      <div className="px-5 space-y-4">

        {/* Points Summary Card */}
        <div className="bg-white rounded-[20px] p-[22px] shadow-2xs border border-gray-100 mb-1.5 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--store-primary-color)] opacity-5 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>

          <div className="flex flex-col items-center justify-center py-2 mb-3">
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-2">
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">{isArabic ? 'الرصيد المتاح' : 'Available Balance'}</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-gray-900 tracking-tight">{availablePoints}</span>
              <span className="text-sm font-bold text-gray-400">{isArabic ? 'نقطة' : 'pts'}</span>
            </div>
          </div>

          <div className="w-full h-[1px] bg-gray-50 mb-3"></div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-2 rounded-xl bg-emerald-50 h-[68px]">
              <span className="text-[10px] text-emerald-600 font-bold mb-1 line-clamp-1 leading-snug">{isArabic ? 'إجمالي النقاط المكتسبة' : 'Total Earned'}</span>
              <span className="text-[13px] font-black text-emerald-700">{totalEarned}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-2 rounded-xl bg-gray-50 h-[68px]">
              <span className="text-[10px] text-gray-500 font-bold mb-1 line-clamp-1 leading-snug">{isArabic ? 'إجمالي النقاط المصروفة' : 'Total Spent'}</span>
              <span className="text-[13px] font-black text-gray-700">{totalSpent}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-2 rounded-xl bg-amber-50 h-[68px]">
              <span className="text-[10px] text-amber-600 font-bold mb-1 line-clamp-1 leading-snug">{isArabic ? 'نقاط قيد الانتظار' : 'Pending Points'}</span>
              <span className="text-[13px] font-black text-amber-700">{pendingPoints}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center py-2.5 px-2 rounded-xl bg-orange-50 h-[68px]">
              <span className="text-[10px] text-orange-600 font-bold mb-1 line-clamp-1 leading-snug">{isArabic ? 'نقاط قاربت على الانتهاء' : 'Expiring Soon'}</span>
              <span className="text-[13px] font-black text-orange-700">{expiringSoonPoints}</span>
            </div>
          </div>
        </div>

        {/* Explanation Card */}
        <div className="bg-[#1a1a1a] rounded-[16px] py-3 px-4 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4 text-white" />
          </div>
          <p className="text-[11px] font-medium text-white/90 leading-relaxed">
            {isArabic ? 'تحصل على نقطة واحدة مقابل كل 1 د.ك تصرفه في المتجر.' : 'You earn 1 point for every 1 K.D spent in the store.'}
          </p>
        </div>

        {/* Expiry Notice */}
        <div className="bg-amber-50 border border-amber-100/50 rounded-[14px] p-3 flex gap-3 flex-row items-start">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700/80 leading-relaxed font-medium">
            {isArabic
              ? 'تنتهي صلاحية النقاط بعد 3 أشهر من تاريخ اكتسابها، لذلك احرص على استخدامها قبل انتهاء المدة.'
              : 'Points expire 3 months after they are earned, so make sure to use them before they expire.'}
          </p>
        </div>

        {/* Points History */}
        <div className="pt-2">
          <h3 className="font-black text-[15px] text-gray-900 mb-3 px-1">
            {isArabic ? 'سجل النقاط' : 'Points History'}
          </h3>

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-white rounded-[20px] border border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-gray-300" />
              </div>
              <h3 className="text-[15px] font-bold text-gray-800 mb-1">
                {isArabic ? 'لا يوجد سجل نقاط حالياً' : 'No points history yet'}
              </h3>
              <p className="text-[12px] text-gray-500 max-w-[200px] leading-relaxed">
                {isArabic ? 'عند إتمام أول طلب، ستظهر نقاطك هنا.' : 'Once you complete your first order, your points will appear here.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[20px] p-4 shadow-2xs border border-gray-100">
              <div className="flex flex-col">
                {transactions.map((tx, idx) => {
                  const details = getTxDetails(tx);
                  return (
                    <div key={tx.id} className={`flex items-center justify-between py-3 border-b border-gray-50 last:border-0 ${tx.type === 'cancelled' ? 'opacity-50' : ''}`}>
                      <div className="flex gap-3 items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${details.bgColor} ${details.borderColor}`}>
                          <div className={details.color}>{details.icon}</div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-gray-900 mb-0.5">{details.title}</span>
                          {details.desc && (
                            <span className="text-[11px] font-medium text-gray-500 mb-0.5">{details.desc}</span>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400">
                              {new Date(tx.date).toLocaleDateString(isArabic ? 'ar-KW' : 'en-KW')}
                            </span>
                            {tx.expiryDate && tx.type !== 'expired' && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-[10px] font-bold text-orange-500/80">
                                  {isArabic ? 'ينتهي في:' : 'Expires on:'} {new Date(tx.expiryDate).toLocaleDateString(isArabic ? 'ar-KW' : 'en-KW')}
                                </span>
                              </>
                            )}
                            {tx.type === 'expired' && tx.expiryDate && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-[10px] font-bold text-red-500/80">
                                  {isArabic ? 'انتهت في:' : 'Expired on:'} {new Date(tx.expiryDate).toLocaleDateString(isArabic ? 'ar-KW' : 'en-KW')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-baseline gap-1 ${details.color}`}>
                        <span className="text-[15px] font-black">{details.sign}{tx.amount}</span>
                        <span className="text-[10px] font-bold">{isArabic ? 'نقطة' : 'pts'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
