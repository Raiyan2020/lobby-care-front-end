'use client';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, MapPin, CreditCard, Package, Loader2, Receipt, ExternalLink, Download } from 'lucide-react';
import { Price } from '../components/Price';
import { fetchOrderDetail } from '../api/orders';
import { OrderDetailData } from '../api/types';
import { getSession } from '../utils/auth';
import { useStore } from '../contexts/StoreContext';

export function OrderDetails() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const { products } = useStore();
  const isArabic = language === 'ar';

  const [order, setOrder] = useState<OrderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.isLoggedIn) {
      navigate('/login', { replace: true });
      return;
    }

    if (!id) {
      navigate('/orders', { replace: true });
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    fetchOrderDetail(id, language)
      .then((res) => {
        if (!isMounted) return;
        if (res.code === 200 && res.data) {
          setOrder(res.data);
        } else {
          setIsError(true);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setIsError(true);
        console.error('Failed to fetch order details:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, language, navigate]);

  const getStatusColor = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'مكتمل' || s === 'completed') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'قيد التجهيز' || s === 'processing' || s === 'new' || s === 'جديد') return 'bg-amber-50 text-amber-600 border-amber-100';
    if (s === 'تم الشحن' || s === 'shipped') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (s === 'ملغي' || s === 'cancelled') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const formattedStr = dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr;
      return new Date(formattedStr).toLocaleString(isArabic ? 'ar-KW' : 'en-US');
    } catch (e) {
      return dateStr;
    }
  };

  const getProductImage = (productId: number): string => {
    const matched = products.find(p => String(p.id) === String(productId));
    if (!matched) return '';
    if (typeof matched.image === 'string') return matched.image;
    return (matched.image as any)?.src || '';
  };

  const session = getSession();
  const customerName = session?.name || (isArabic ? 'صاحب الحساب' : 'Account Owner');
  const customerPhone = session?.phone || session?.phoneNumber || '';

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#fafafa]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400 mb-2" />
        <p className="text-xs text-gray-400 font-medium">
          {isArabic ? 'جاري تحميل تفاصيل الطلب...' : 'Loading order details...'}
        </p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-[#fafafa] px-6 text-center">
        <p className="text-gray-500 font-medium mb-4">
          {isArabic ? 'تعذر تحميل تفاصيل الطلب، يرجى المحاولة مجدداً' : 'Failed to load order details. Please try again.'}
        </p>
        <button
          onClick={() => navigate('/orders')}
          className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-xl font-bold text-xs"
        >
          {isArabic ? 'العودة للطلبات' : 'Back to Orders'}
        </button>
      </div>
    );
  }

  const deliveryFee = Math.max(0, order.total - order.subtotal);

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa]" dir={dir}>
      <div className="container mx-auto ">

        {/* Page Title Header */}
        <div className="mb-6 mt-2 flex items-center gap-3 bg-[#fafafa] pb-4 sticky top-0 z-10">
          <button
            onClick={() => navigate('/orders')}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <ArrowRight className={`w-5 h-5 text-gray-800 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-[17px] font-black text-[#1a1a1a] font-sans tracking-tight">
              {isArabic ? 'تفاصيل الطلب' : 'Order Details'}
            </h2>
            <span className="text-[11px] font-bold text-gray-500" dir="ltr">{order.order_number || `#${order.id}`}</span>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Products list */}
          <div className="w-full order-2 lg:order-1 lg:col-span-8">
            <div className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100">
              <h3 className="text-[13px] font-black text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-400" />
                {isArabic ? 'المنتجات' : 'Products'} ({order.items?.length || 0})
              </h3>

              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                      <img
                        src={getProductImage(item.product_id)}
                        alt={isArabic ? item.product_name.ar : item.product_name.en}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-[13px] font-bold text-gray-800 line-clamp-1 mb-1">
                        {isArabic ? item.product_name.ar : item.product_name.en}
                      </span>

                      {item.selected_attributes && item.selected_attributes.length > 0 && (
                        <div className="flex flex-wrap gap-1 text-[11px] text-gray-500 font-medium mb-1.5">
                          {item.selected_attributes.map((attr, attrIdx) => {
                            const name = isArabic ? attr.attribute_name.ar : attr.attribute_name.en;
                            const val = isArabic ? attr.value_name.ar : attr.value_name.en;
                            const priceDiff = attr.price > 0 ? ` (+${attr.price} KWD)` : '';
                            return (
                              <span key={attrIdx} className="bg-gray-50 dark:bg-neutral-800 px-2 py-0.5 rounded text-[10px]">
                                {name}: <span className="font-bold text-gray-700 dark:text-gray-300">{val}{priceDiff}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                          {isArabic ? 'الكمية:' : 'Qty:'} {item.quantity}
                        </span>
                        <span className="text-[13px] font-black text-gray-900">
                          <Price amount={item.unit_price} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>



            {/* Invoice Card */}
            {order.invoice && (
              <div className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100 mt-6 animate-in fade-in duration-200">
                <h3 className="text-[13px] font-black text-gray-900 mb-4 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  {isArabic ? 'تفاصيل الفاتورة' : 'Invoice Details'}
                </h3>
                <div className="flex flex-col md:flex-row gap-5 items-center">
                  {order.invoice.qr_code_url && (
                    <div className="shrink-0 p-2 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:scale-[1.02] transition-transform duration-200">
                      <img
                        src={order.invoice.qr_code_url}
                        alt="Invoice QR Code"
                        className="w-24 h-24 object-contain"
                      />
                    </div>
                  )}
                  <div className="flex-1 w-full flex flex-col justify-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] text-gray-400 font-bold mb-0.5">
                        {isArabic ? 'رقم الفاتورة' : 'Invoice Number'}
                      </span>
                      <span className="text-[14px] font-black text-gray-900 font-sans tracking-wide">
                        {order.invoice.invoice_number}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {order.invoice.web_view_url && (
                        <a
                          href={order.invoice.web_view_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'عرض الفاتورة' : 'View'}</span>
                        </a>
                      )}
                      {order.invoice.pdf_download_url && (
                        <a
                          href={order.invoice.pdf_download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-[var(--store-secondary-color)]/10 hover:bg-[var(--store-secondary-color)]/20 border border-[var(--store-secondary-color)]/20 rounded-xl text-xs font-bold text-[var(--store-secondary-color)] transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      )}
                      {order.invoice.image_download_url && (
                        <a
                          href={order.invoice.image_download_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/60 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isArabic ? 'صورة' : 'Image'}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Status & Delivery info */}
          <div className="w-full order-1 lg:order-2 lg:col-span-4 space-y-4 lg:sticky lg:top-24">

            {/* Status Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100 flex flex-col items-center justify-center">
              <div className={`px-4 py-2 rounded-xl border text-[13px] font-black mb-2 ${getStatusColor(order.status_label || order.status)}`}>
                {order.status_label || order.status}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">
                {isArabic ? 'تاريخ الطلب:' : 'Order Date:'} {formatDate(order.created_at)}
              </span>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100">
              <h3 className="text-[13px] font-black text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                {isArabic ? 'معلومات التوصيل' : 'Delivery Information'}
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 font-medium mb-0.5">{isArabic ? 'الاسم' : 'Name'}</span>
                  <span className="text-[13px] font-bold text-gray-800">{customerName}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 font-medium mb-0.5">{isArabic ? 'رقم الهاتف' : 'Phone'}</span>
                  <span className="text-[13px] font-bold text-gray-800" dir="ltr">{customerPhone}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] text-gray-400 font-medium mb-0.5">{isArabic ? 'العنوان' : 'Address'}</span>
                  <span className="text-[13px] font-medium text-gray-700 leading-relaxed">
                    {order.address
                      ? `${order.address.title} - ${order.address.map_desc} ${order.address.notes ? `(${order.address.notes})` : ''}`
                      : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100">
              <h3 className="text-[13px] font-black text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                {isArabic ? 'معلومات الدفع' : 'Payment Information'}
              </h3>

              <div className="flex items-center justify-between mt-2 py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-600 font-medium">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</span>
                <span className="text-[13px] font-bold text-gray-800">
                  {order.payment_method
                    ? (isArabic ? order.payment_method.name.ar : order.payment_method.name.en)
                    : ''}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-600 font-medium">{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span className="text-[13px] font-bold text-gray-800">
                  <Price amount={order.subtotal} />
                </span>
              </div>

              {order.loyalty_points_earned > 0 && (
                <div className="flex items-center justify-between mt-2 py-2 border-b border-gray-50 text-indigo-600">
                  <span className="text-[13px] font-medium">{isArabic ? 'نقاط الولاء المكتسبة' : 'Loyalty Points Earned'}</span>
                  <span className="text-[13px] font-bold">+{order.loyalty_points_earned}</span>
                </div>
              )}

              <div className="flex items-center justify-between mt-2 py-2 border-b border-gray-50">
                <span className="text-[13px] text-gray-600 font-medium">{isArabic ? 'رسوم التوصيل' : 'Delivery Fee'}</span>
                <span className="text-[13px] font-bold text-gray-800">
                  <Price amount={deliveryFee} />
                </span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-3">
                <span className="text-[15px] text-gray-900 font-black">{isArabic ? 'الإجمالي' : 'Total'}</span>
                <span className="text-[16px] font-black text-gray-900">
                  <Price amount={order.total} />
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
