'use client';
import { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from '../lib/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Phone,
  MapPin,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  X,
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Price } from '../components/Price';
import { getSession } from '../utils/auth';
import { useTermsQuery } from '../hooks/useTermsQuery';
import { AddressObject } from '../types';
import { AddressModal } from '../components/AddressModal';
import { fetchPaymentMethods } from '../api/general';
import { checkoutApi } from '../api/checkout';
import { PaymentMethod } from '../api/types';



interface PaymentOption {
  id: string;
  nameAr: string;
  nameEn: string;
  image: string;
}


export function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, products, updateProduct, settings } = useStore();
  const { dir, language, t } = useLanguage();
  const { terms, isLoading: isTermsLoading } = useTermsQuery();

  const [session, setSession] = useState(getSession());
  const isLoggedIn = !!session?.isLoggedIn;

  // Guest Details State
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  // Address Dialog Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // Selected saved address (either for guest or user)
  const [selectedAddress, setSelectedAddress] = useState<AddressObject | null>(null);
  const [userAddresses, setUserAddresses] = useState<AddressObject[]>([]);

  // Payment State
  const [paymentMethodId, setPaymentMethodId] = useState<string | number>('');

  // Loaded and filtered active payment methods from backend
  const [activePaymentMethods, setActivePaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        setIsLoadingPayments(true);
        const list = await fetchPaymentMethods(language);
        setActivePaymentMethods(list);
        if (list.length > 0) {
          setPaymentMethodId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load payment methods:', err);
      } finally {
        setIsLoadingPayments(false);
      }
    };
    loadPayments();
  }, [language]);

  // Automatically clear selected method if it is disabled
  useEffect(() => {
    if (paymentMethodId && !activePaymentMethods.some(pm => String(pm.id) === String(paymentMethodId))) {
      setPaymentMethodId('');
    }
  }, [paymentMethodId, activePaymentMethods]);

  // Terms Checkbox & Modals
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Form Validation & Process States
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Soft Sign Up Popup
  const [showSoftSignUp, setShowSoftSignUp] = useState(false);
  const [tempOrderId, setTempOrderId] = useState<string>('');

  // Payment gateway redirect toast
  const [paymentRedirectToast, setPaymentRedirectToast] = useState(false);

  // Load user data on mount
  useEffect(() => {
    if (isLoggedIn) {
      const saved = localStorage.getItem('user_addresses');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Convert simpler stored format into AddressObject
          const mapped: AddressObject[] = parsed.map((item: any) => {
            if (item.details && !item.governorate) {
              return {
                id: item.id || Math.random().toString(),
                name: item.name || 'العنوان',
                governorate: '',
                area: item.name || '',
                block: '',
                house: '',
                details: item.details
              };
            }
            return item;
          });
          setUserAddresses(mapped);
          if (mapped.length > 0) {
            const savedSelectedId = localStorage.getItem('selected_address_id');
            const found = mapped.find(a => String(a.id) === savedSelectedId);
            setSelectedAddress(found || mapped[0]);
          }
        } catch (e) {
          setUserAddresses([]);
        }
      }
    }
  }, [isLoggedIn]);

  // Cart calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    let extraPrice = 0;
    if (item.product.optionType === 'size' || item.product.optionType === 'color') {
      const opt = item.product.productOptions?.find(o => o.id === item.variantId);
      if (opt) extraPrice = opt.extraPrice || 0;
    }
    return sum + ((item.product.price + extraPrice) * item.quantity);
  }, 0);

  const totalDiscount = cart.reduce((sum, item) => {
    if (item.product.originalPrice && item.product.originalPrice > item.product.price) {
      return sum + ((item.product.originalPrice - item.product.price) * item.quantity);
    }
    return sum;
  }, 0);
  const deliveryFee = totalItems > 0 ? 15 : 0;
  const total = subtotal + deliveryFee;

  // Format Helper for numbers
  const isArabic = language === 'ar';

  const formatPhone = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    return cleaned.slice(0, 8);
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGuestPhone(formatPhone(e.target.value));
  };

  const handleOpenLogin = () => {
    localStorage.setItem('auth_redirect', '/checkout');
    navigate('/login');
  };

  const handleSaveAddress = (addr: { id?: number | string; title: string; lat: number; lng: number; map_desc: string; notes: string }) => {
    const newAddrObj: AddressObject = {
      id: String(addr.id || Math.random().toString()),
      name: addr.title,
      details: addr.notes ? `${addr.map_desc} (${addr.notes})` : addr.map_desc,
      governorate: '',
      area: addr.title,
      block: '',
      house: '',
    };

    if (isLoggedIn) {
      // Save directly to user account localStorage
      const updated = [...userAddresses, newAddrObj];
      setUserAddresses(updated);
      setSelectedAddress(newAddrObj);

      // Save simplified style to matches page expectations
      const simplifiedForAccount = updated.map(addr => ({
        id: addr.id,
        name: addr.name,
        details: addr.details,
        governorate: addr.governorate,
        area: addr.area,
        block: addr.block,
        house: addr.house
      }));
      localStorage.setItem('user_addresses', JSON.stringify(simplifiedForAccount));
    } else {
      setSelectedAddress(newAddrObj);
    }

    setIsAddressModalOpen(false);
  };

  const generateIdempotencyKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 30; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  const handlePlaceOrder = async () => {
    setValidationError(null);

    // Validation
    if (!isLoggedIn) {
      if (!guestName.trim()) {
        setValidationError(isArabic ? 'يرجى إدخال الاسم بالكامل' : 'Please enter your full name');
        return;
      }
      if (!guestPhone.trim() || guestPhone.length < 8) {
        setValidationError(isArabic ? 'يرجى إدخال رقم هاتف كويتي صالح من 8 أرقام' : 'Please enter a valid 8-digit Kuwaiti phone number');
        return;
      }
    }

    if (!selectedAddress) {
      setValidationError(isArabic ? 'يرجى تحديد أو إضافة عنوان توصيل' : 'Please add or select a delivery address');
      return;
    }

    if (!paymentMethodId) {
      setValidationError(isArabic ? 'يرجى تحديد طريقة الدفع' : 'Please select a payment method');
      return;
    }

    if (!agreeTerms) {
      setValidationError(isArabic ? 'يجب الموافقة على الشروط والأحكام أولاً' : 'You must agree to the Terms and Conditions');
      return;
    }

    setIsLoading(true);

    if (isLoggedIn) {
      try {
        const idempotencyKey = generateIdempotencyKey();
        const res = await checkoutApi(selectedAddress.id, paymentMethodId, idempotencyKey);

        if (res.key === 'success' && res.data) {
          // If the response contains a payment gateway URL, redirect there
          if (res.data.payment_url) {
            clearCart();
            setIsLoading(false);
            setPaymentRedirectToast(true);
            setTimeout(() => {
              window.location.href = res.data.payment_url!;
            }, 1800);
            return;
          }

          clearCart();

          const orderData = res.data.order;
          const matchedMethod = activePaymentMethods.find(p => String(p.id) === String(paymentMethodId));
          const finalOrder = {
            id: String(orderData.id),
            orderId: String(orderData.id),
            date: new Date(orderData.created_at).toLocaleDateString(isArabic ? 'ar-KW' : 'en-US'),
            createdAt: orderData.created_at,
            status: orderData.status === 'new' ? 'PROCESSING' : orderData.status.toUpperCase(),
            itemsCount: totalItems,
            total: orderData.total,
            subtotal: orderData.subtotal,
            subtotalBeforeDiscount: orderData.subtotal,
            totalDiscount: 0,
            delivery: deliveryFee,
            customerName: session?.name || 'صاحب الحساب',
            phoneNumber: session?.phone || session?.phoneNumber || '',
            address: orderData.address
              ? `${orderData.address.map_desc} (${orderData.address.notes || ''})`
              : selectedAddress.details,
            paymentMethodId: String(paymentMethodId),
            paymentMethod: matchedMethod?.name || '',
            products: cart.map(item => {
              let extraPrice = 0;
              if (item.product.optionType === 'size' || item.product.optionType === 'color') {
                const opt = item.product.productOptions?.find(o => o.id === item.variantId);
                if (opt) extraPrice = opt.extraPrice || 0;
              }
              return {
                id: item.product.id,
                nameAr: item.product.name,
                nameEn: item.product.nameEn || item.product.name,
                image: item.product.image,
                selectedOptionType: item.selectedOptionType,
                selectedOptionLabelAr: item.selectedOptionLabelAr,
                selectedOptionLabelEn: item.selectedOptionLabelEn,
                selectedOptionValueAr: item.selectedOptionValueAr,
                selectedOptionValueEn: item.selectedOptionValueEn,
                size: item.selectedSize && !['افتراضي', 'Default'].includes(item.selectedSize) ? item.selectedSize : '',
                color: item.selectedColor && !['افتراضي', 'Default'].includes(item.selectedColor) ? item.selectedColor : '',
                price: item.product.price + extraPrice,
                quantity: item.quantity,
                variantId: item.variantId || ''
              };
            })
          };

          const existingOrdersStr = localStorage.getItem('user_orders') || '[]';
          let updatedOrders = [];
          try {
            updatedOrders = JSON.parse(existingOrdersStr);
          } catch (e) {
            updatedOrders = [];
          }
          updatedOrders.unshift(finalOrder);
          localStorage.setItem('user_orders', JSON.stringify(updatedOrders));

          sessionStorage.setItem('last_order', JSON.stringify(finalOrder));

          if (orderData.loyalty_points_earned) {
            const currentPoints = Number(localStorage.getItem('user_points') || '0');
            localStorage.setItem('user_points', String(currentPoints + orderData.loyalty_points_earned));
          }

          setIsLoading(false);
          navigate('/order-success', { state: { order: finalOrder } });
        } else {
          setIsLoading(false);
          const errMsg = res.msg || (isArabic ? 'حدث خطأ أثناء إرسال الطلب' : 'Failed to place order');
          setValidationError(errMsg);
        }
      } catch (err: any) {
        setIsLoading(false);
        setValidationError(isArabic ? 'عذراً، فشل الاتصال بالخادم' : 'Server connection failed');
        console.error('Checkout error:', err);
      }
      return;
    }

    // Fallback Mock flow for Guest Users
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);

    // Create Demo Order object
    const createdOrderId = `ez-${Math.floor(100000 + Math.random() * 900000)}`;
    const finalCustomerName = guestName;
    const finalPhone = `+965 ${guestPhone}`;

    const newOrder = {
      id: createdOrderId,
      orderId: createdOrderId,
      date: new Date().toLocaleDateString(isArabic ? 'ar-KW' : 'en-US'),
      createdAt: new Date().toISOString(),
      status: 'PROCESSING' as const,
      itemsCount: totalItems,
      total: total,
      subtotal: subtotal,
      subtotalBeforeDiscount: subtotal + totalDiscount,
      totalDiscount: totalDiscount,
      delivery: deliveryFee,
      customerName: finalCustomerName,
      phoneNumber: finalPhone,
      address: selectedAddress.details,
      paymentMethodId: String(paymentMethodId),
      paymentMethod: activePaymentMethods.find(p => String(p.id) === String(paymentMethodId))?.name || '',
      products: cart.map(item => {
        let extraPrice = 0;
        if (item.product.optionType === 'size' || item.product.optionType === 'color') {
          const opt = item.product.productOptions?.find(o => o.id === item.variantId);
          if (opt) extraPrice = opt.extraPrice || 0;
        }

        return {
          id: item.product.id,
          nameAr: item.product.name,
          nameEn: item.product.nameEn || item.product.name,
          image: item.product.image,
          selectedOptionType: item.selectedOptionType,
          selectedOptionLabelAr: item.selectedOptionLabelAr,
          selectedOptionLabelEn: item.selectedOptionLabelEn,
          selectedOptionValueAr: item.selectedOptionValueAr,
          selectedOptionValueEn: item.selectedOptionValueEn,
          size: item.selectedSize && !['افتراضي', 'Default'].includes(item.selectedSize) ? item.selectedSize : '',
          color: item.selectedColor && !['افتراضي', 'Default'].includes(item.selectedColor) ? item.selectedColor : '',
          price: item.product.price + extraPrice,
          quantity: item.quantity,
          variantId: item.variantId || ''
        };
      })
    };

    // Save orders list
    const existingOrdersStr = localStorage.getItem('user_orders') || '[]';
    let updatedOrders = [];
    try {
      updatedOrders = JSON.parse(existingOrdersStr);
    } catch (e) {
      updatedOrders = [];
    }

    updatedOrders.unshift(newOrder);
    localStorage.setItem('user_orders', JSON.stringify(updatedOrders));
    sessionStorage.setItem('last_order', JSON.stringify(newOrder));

    // Clear local store cart state
    clearCart();

    // Route successfully or prompt soft sign up
    setTempOrderId(createdOrderId);
    setShowSoftSignUp(true);
  };

  const handleSoftSignUpAccept = () => {
    // Automatically create session and save their information
    const fullName = guestName;
    const cleanNum = `+965 ${guestPhone}`;

    // Create local account
    const userSession = {
      phoneNumber: cleanNum,
      isLoggedIn: true,
      createdAt: new Date().toISOString(),
      name: fullName
    };

    localStorage.setItem('user_session', JSON.stringify(userSession));

    // Convert their selected guest address to saved addresses on account
    if (selectedAddress) {
      const simplified = [{
        id: selectedAddress.id,
        name: isArabic ? 'البيت' : 'Home', // set name nicely or use region
        details: selectedAddress.details
      }];
      localStorage.setItem('user_addresses', JSON.stringify(simplified));
    }

    // Add extra points for registering on signup
    localStorage.setItem('user_points', '50'); // 50 Welcome bonus points

    // Close prompt and route
    setShowSoftSignUp(false);

    // Load state
    const savedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    const matchingOrder = savedOrders.find((o: any) => o.id === tempOrderId) || savedOrders[0];

    navigate('/order-success', { state: { order: matchingOrder, justSignedUp: true } });
  };

  const handleSoftSignUpDecline = () => {
    setShowSoftSignUp(false);
    const savedOrders = JSON.parse(localStorage.getItem('user_orders') || '[]');
    const matchingOrder = savedOrders.find((o: any) => o.id === tempOrderId) || savedOrders[0];

    navigate('/order-success', { state: { order: matchingOrder } });
  };

  if (cart.length === 0 && !showSoftSignUp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center select-none" dir={dir}>
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <MapPin className="w-8 h-8 text-neutral-300" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">
          {isArabic ? 'سلة المشتريات فارغة' : 'Your cart is empty'}
        </h2>
        <p className="text-neutral-400 text-sm mb-6 max-w-xs leading-relaxed">
          {isArabic ? 'أضف بعض المنتجات الرائعة أولاً لتتمكن من إتمام عملية التوصيل والدفع.' : 'Add some incredible products to your shopping cart to request custom checkout.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="bg-[#1a1a1a] text-[#ffffff] px-8 py-3.5 rounded-xl font-bold hover:bg-black transition-colors w-full max-w-xs animate-bounce cursor-pointer text-sm"
        >
          {isArabic ? 'العودة للتسوق' : 'Back to Shopping'}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#fafafa] min-h-[85vh] py-6 px-4 select-none relative" dir={dir}>

      {/* Payment Gateway Redirect Toast */}
      <AnimatePresence>
        {paymentRedirectToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="fixed inset-0 z-[9999] flex items-end justify-center pb-10 px-4 pointer-events-none"
          >
            <div className="bg-[#1a1a1a] text-white rounded-2xl shadow-2xl px-5 py-4 flex items-center gap-4 max-w-sm w-full pointer-events-auto">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0 animate-spin">
                <Loader2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-snug">
                  {isArabic ? 'جارٍ التوجيه إلى بوابة الدفع…' : 'Redirecting to payment gateway…'}
                </p>
                <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                  {isArabic ? 'الدفع قيد المراجعة، يرجى الانتظار.' : 'Payment is under review. Please wait.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-md mx-auto space-y-6">

        {/* Navigation Indicator / Header */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-100 shadow-sm cursor-pointer hover:bg-gray-50"
          >
            {isArabic ? <ArrowRight className="w-5 h-5 text-gray-800" /> : <ArrowLeft className="w-5 h-5 text-gray-800" />}
          </button>
          <h2 className="text-xl font-black text-gray-900">{isArabic ? 'طلب جديد وعنوان التوصيل' : 'Checkout & Delivery Settings'}</h2>
        </div>

        {/* 1. Login Prompt Card (Guests only) */}
        {!isLoggedIn && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-extrabold text-gray-900">
                  {isArabic ? 'هل لديك حساب؟' : 'Already have an account?'}
                </p>
                <p className="text-xs text-gray-400">
                  {isArabic ? 'سجل دخولك لتتمكن من الطلب أسرع' : 'Sign in for rapid checkout rates'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenLogin}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/55 px-3 py-2 rounded-xl transition-all cursor-pointer"
            >
              {isArabic ? 'سجل دخولك' : 'Sign In'}
            </button>
          </div>
        )}

        {/* 2. Customer Contact Form (Guests only) */}
        {!isLoggedIn && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">
              {isArabic ? 'بيانات العميل المستلم' : 'Customer Delivery Details'}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">{isArabic ? 'الاسم بالكامل' : 'Full Name'}</label>
                <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-white transition-all overflow-hidden h-11">
                  <User className="w-4 h-4 text-gray-400 absolute right-3 lg:right-4 left-auto pointer-events-none" />
                  <input
                    type="text"
                    value={guestName}
                    onChange={e => setGuestName(e.target.value)}
                    placeholder={isArabic ? 'الاسم الثلاثي أو الكامل' : 'Your full name'}
                    className="w-full h-full pr-10 pl-4 bg-transparent outline-none text-xs font-bold text-[#1a1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">{isArabic ? 'رقم الهاتف' : 'Contact Phone Number'}</label>
                <div className="relative flex items-center bg-gray-50 border border-gray-100 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-white transition-all overflow-hidden h-11" style={{ direction: 'ltr' }}>
                  <div className="flex items-center gap-1 px-3 bg-gray-100 border-r border-gray-100 h-full text-gray-700 font-bold text-xs select-none">
                    <span>🇰🇼</span>
                    <span className="font-sans text-[11px]">+965</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    placeholder="XXXXXXXX"
                    value={guestPhone}
                    onChange={handlePhoneChange}
                    className="w-full h-full px-4 bg-transparent outline-none text-xs font-bold text-[#1a1a1a] tracking-wider"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  />
                  <Phone className="w-4 h-4 text-gray-400 absolute right-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Delivery Address Section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2 flex justify-between items-center">
            <span>{isArabic ? 'عنوان التوصيل' : 'Delivery Address'}</span>
            {isLoggedIn && userAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                {isArabic ? '+ عنوان جديد' : '+ New Address'}
              </button>
            )}
          </h3>

          {/* Stored user addresses for selection */}
          {isLoggedIn && userAddresses.length > 0 ? (
            <div className="space-y-2.5">
              {userAddresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddress(addr)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-right flex items-start gap-3 ${selectedAddress?.id === addr.id
                    ? ' !border-[var(--store-secondary-color)] !bg-[var(--store-secondary-color)]/10 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200 bg-white'
                    }`}
                >
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${selectedAddress?.id === addr.id ? 'border-[var(--store-secondary-color)] bg-[var(--store-secondary-color)]' : 'border-gray-300'
                    }`}>
                    {selectedAddress?.id === addr.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="space-y-1 select-none flex-1">
                    <p className="text-xs font-black text-gray-900 select-none">{addr.name || (isArabic ? 'عنوان محفوظ' : 'Saved Address')}</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed font-sans select-none">{addr.details}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : selectedAddress ? (
            /* Selected Guest address or single local user address */
            <div className="p-3.5 rounded-xl border  bg-[var(--store-secondary-color)]/10 relative flex items-start gap-3">
              <MapPin className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="text-xs font-black text-gray-950">{selectedAddress.name}</p>
                <p className="text-[11px] text-gray-400 font-sans leading-relaxed">{selectedAddress.details}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="text-[10px] font-bold text-indigo-600 underline cursor-pointer shrink-0 absolute left-4 top-4"
              >
                {isArabic ? 'تعديل' : 'Edit'}
              </button>
            </div>
          ) : (
            /* Empty state address addition trigger */
            <div
              onClick={() => setIsAddressModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-500 cursor-pointer transition-all bg-[#fafafa]"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-2.5">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="text-xs font-black text-gray-800">{isArabic ? 'إضافة عنوان جديد' : 'Add New Address'}</p>
              <p className="text-[10px] text-gray-400 mt-1 select-none">{isArabic ? 'اضغط لتعبئة تفاصيل السكن والتوصيل بالكويت' : 'Click to specify Kuwait delivery zone'}</p>
            </div>
          )}
        </div>

        {/* 4. Selectable Payment Methods */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">
            {isArabic ? 'طريقة الدفع' : 'Payment Method'}
          </h3>

          <div className="space-y-2.5">
            {(() => {
              const getPaymentIcon = (driver: string): string => {
                switch (driver) {
                  case 'k-net':
                    return 'https://maison-de-noor.com/storage/admin/payment/ejHsWZEA4UPowH2Lr0TIbwJaG26DpLGYJdU9Sf4l.jpg';
                  case 'apple-pay':
                    return 'https://maison-de-noor.com/storage/admin/payment/RzvsSeZhQTBkqJCUYlYzdx6P6NRwFCDIwrLNHHMK.png';
                  case 'dima':
                    return 'https://maison-de-noor.com/storage/admin/payment/6jhQyZX6UGDkx2HM19kTymGxhuI21lPXVr1yE2jO.png';
                  case 'tally':
                    return 'https://www.taly.io/assets/images/taly-footer-logo.svg';
                  case 'cash-on-delivery':
                    return "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='2' y='6' width='20' height='12' rx='2'/%3E%3Ccircle cx='12' cy='12' r='2'/%3E%3Cpath d='M6 12h.01M18 12h.01'/%3E%3C/svg%3E";
                  case 'pay-via-link':
                    return "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E";
                  case 'loyalty-points':
                    return "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a1a1a' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M8 12h8M12 8v8'/%3E%3C/svg%3E";
                  default:
                    return 'https://maison-de-noor.com/storage/admin/payment/TwRrm04W1QhhMTMlIIGehZyymwpji67Shng6odSU.jpg';
                }
              };

              return activePaymentMethods.map((pay) => {
                const isSelected = String(paymentMethodId) === String(pay.id);
                return (
                  <div
                    key={pay.id}
                    onClick={() => setPaymentMethodId(pay.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${isSelected
                      ? 'border-[var(--store-secondary-color)] bg-[var(--store-secondary-color)]/10 shadow-sm'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-[var(--store-secondary-color)] bg-[var(--store-secondary-color)]' : 'border-gray-300'
                        }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs font-black text-gray-800">
                        {pay.name}
                      </span>
                    </div>

                    {/* Normalized premium logo preview container */}
                    <div className="w-12 h-8 rounded-md bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1 overflow-hidden">
                      <img
                        src={pay.image || getPaymentIcon(pay.driver)}
                        alt={pay.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://maison-de-noor.com/storage/admin/payment/TwRrm04W1QhhMTMlIIGehZyymwpji67Shng6odSU.jpg';
                        }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* 5. Summary and Checkout trigger section */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-sm font-black text-gray-900 border-b border-gray-50 pb-2">
            {isArabic ? 'ملخص الفاتورة والطلب' : 'Receipt & Order Abstract'}
          </h3>

          <div className="space-y-2 font-sans">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{isArabic ? 'عدد المنتجات' : 'Products Count'}</span>
              <span className="font-bold text-[#1a1a1a]">
                {totalItems}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{isArabic ? 'المجموع الفرعي' : 'Subtotal'}</span>
              <span className="font-bold text-[#1a1a1a]">
                <Price amount={subtotal + totalDiscount} />
              </span>
            </div>
            {totalDiscount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-600 font-medium">
                <span>{isArabic ? 'إجمالي الخصم' : 'Total Discount'}</span>
                <span>
                  <span className="text-[10px] font-bold mx-1">{isArabic ? '(وفرت' : '(Saved'}</span>
                  <Price amount={totalDiscount} />
                  <span className="text-[10px] font-bold mx-1">{isArabic ? ')' : ')'}</span>
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>{isArabic ? 'التوصيل' : 'Delivery'}</span>
              <span className="font-bold text-[#1a1a1a]">
                <Price amount={deliveryFee} />
              </span>
            </div>
            <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center text-sm">
              <span className="font-extrabold text-gray-950">{isArabic ? 'المبلغ الكلي المستحق' : 'Total Invoice Rate'}</span>
              <span className="font-black text-base text-[var(--store-secondary-color)]">
                <Price amount={total} />
              </span>
            </div>
          </div>
        </div>

        {/* 6. Terms approval checklist and clickable conditions */}
        <div className="flex items-start gap-2.5 px-1">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={agreeTerms}
            onChange={e => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1 cursor-pointer shrink-0"
          />
          <label htmlFor="terms-checkbox" className="text-xs text-gray-500 font-sans leading-relaxed select-none cursor-pointer">
            {isArabic ? (
              <span>
                أوافق بالكامل على {''}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer inline-block"
                >
                  الشروط والأحكام
                </button> {''}
                الخاصة بـ {settings?.storeName} وإتمام التوصيل.
              </span>
            ) : (
              <span>
                I fully accept the {''}
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(true)}
                  className="font-bold text-indigo-600 hover:underline cursor-pointer inline-block"
                >
                  Terms and Conditions
                </button> {''}
                of {settings?.storeNameEn && settings.storeNameEn !== 'Control Panel' ? settings.storeNameEn : 'Al Thawaq Store'} and completing delivery.
              </span>
            )}
          </label>
        </div>

        {/* Error Notification */}
        {validationError && (
          <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[11px] font-semibold leading-relaxed">{validationError}</p>
          </div>
        )}

        {/* Place Order CTA Button */}
        <button
          type="button"
          disabled={isLoading}
          onClick={handlePlaceOrder}
          className="w-full bg-[#1a1a1a] hover:bg-black disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-gray-900/10 active:scale-[0.98] select-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isArabic ? 'جاري إرسال الطلب...' : 'Processing checkout request...'}</span>
            </>
          ) : (
            <span>{isArabic ? 'إتمام الطلب' : 'Place Order'}</span>
          )}
        </button>

      </div>

      {/* Pop Up Modal 1: Add Address Form */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        language={language}
        initialAddress={selectedAddress ? {
          id: isNaN(Number(selectedAddress.id)) ? 0 : Number(selectedAddress.id),
          title: selectedAddress.name || '',
          lat: 29.375859,
          lng: 47.977405,
          map_desc: selectedAddress.details || '',
          notes: ''
        } : null}
      />

      {/* Pop Up Modal 2: Existing Terms and Conditions popup overlay */}
      <AnimatePresence>
        {isTermsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col"
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 shrink-0 shadow-sm bg-white">
                <h3 className="font-extrabold text-sm text-gray-900">{isArabic ? 'الشروط والأحكام' : 'Terms & Conditions'}</h3>
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 select-none cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 flex-1 overflow-y-auto max-h-[50vh] leading-relaxed text-[11px] text-gray-500 space-y-4 text-right no-scrollbar font-sans">
                {isTermsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div
                    className="[&_h3]:text-[13px] [&_h3]:font-black [&_h3]:text-gray-900 [&_h3]:dark:text-white [&_h3]:mt-4 [&_h3]:mb-1.5 [&_h3]:font-sans
                      [&_p]:text-[11px] [&_p]:text-gray-600 [&_p]:dark:text-gray-400 [&_p]:leading-relaxed [&_p]:font-medium [&_p]:mb-3
                      [&_ul]:list-disc [&_ul]:list-inside [&_ul]:space-y-1 [&_ul]:mb-3
                      [&_li]:text-[11px] [&_li]:text-gray-600 [&_li]:dark:text-gray-400"
                    dangerouslySetInnerHTML={{ __html: terms }}
                  />
                )}
              </div>
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(false)}
                  className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-bold text-xs hover:bg-black cursor-pointer"
                >
                  {isArabic ? 'حسناً، قرأت وموافق' : 'I understand & Agree'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pop Up Modal 3: Guest Soft Register Account modal popup */}
      <AnimatePresence>
        {showSoftSignUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-gray-100 flex flex-col relative"
            >

              {/* Minimal accessible X close button */}
              <button
                type="button"
                onClick={handleSoftSignUpDecline}
                className="absolute left-4 top-4 w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full flex items-center justify-center transition-all cursor-pointer select-none"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="p-6 text-center space-y-4 pt-10">
                <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 animate-pulse">
                  <User className="w-7 h-7" />
                </div>

                <h3 className="text-sm font-black text-gray-900 leading-relaxed font-sans">
                  {isArabic ? 'هل تريد حفظ بياناتك للطلب أسرع لاحقاً؟' : 'Save your details for rapid future orders?'}
                </h3>

                <p className="text-[11px] text-gray-400 leading-relaxed max-w-[245px] mx-auto font-sans">
                  {isArabic
                    ? 'احفظ رقمك وعنوانك لتتمكن من الطلب بسرعة في المرات القادمة ودون الحاجة لتكرار إدخال البيانات.'
                    : 'Save your phone number and delivery address to complete your next orders in a single click!'}
                </p>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100 flex justify-center">
                <button
                  type="button"
                  onClick={handleSoftSignUpAccept}
                  className="w-[85%] bg-[#1a1a1a] hover:bg-black text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer shadow-md transition-all select-none"
                >
                  {isArabic ? 'موافق، حفظ الآن' : 'Agree, Save Info'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
