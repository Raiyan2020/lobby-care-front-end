'use client';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, Phone, Mail, MessageCircle, Instagram, Clock, Info } from 'lucide-react';

export function Contact() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // Read settings from localStorage if available
  const settingsStr = localStorage.getItem('storeSettings');
  const settings = settingsStr ? JSON.parse(settingsStr) : null;

  const phone = settings?.contact?.phone || '+965 55555555';
  const whatsapp = settings?.contact?.whatsapp || '96555555555';
  const email = settings?.contact?.email || 'support@althawaqstore.com';
  const instagram = settings?.social?.instagram || 'https://instagram.com/';

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa]" dir={dir}>
      {/* Page Title Header */}
      <div className="px-5 mb-6 mt-2 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm shrink-0"
        >
          <ArrowRight className={`w-5 h-5 text-gray-800 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
        </button>
        <h2 className="text-[22px] font-black text-[#1a1a1a] font-sans tracking-tight leading-tight">
          {isArabic ? 'تواصل معنا' : 'Contact Us'}
        </h2>
      </div>

      <div className="px-5 space-y-6">

        {/* Intro Hero */}
        <div className="bg-[#1a1a1a] text-white rounded-[20px] p-6 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--store-primary-color)] opacity-20 rounded-full blur-2xl -mt-10 -mr-10 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col">
            <h3 className="text-xl font-black mb-2">{isArabic ? 'تواصل معنا' : 'Contact Us'}</h3>
            <p className="text-[13px] text-gray-300 font-medium leading-relaxed">
              {isArabic
                ? 'نسعد بخدمتك والإجابة على استفساراتك حول المنتجات، الطلبات، التوصيل، أو الإرجاع والتبديل.'
                : 'We are happy to help with product questions, orders, delivery, returns, exchanges, or general support.'}
            </p>
          </div>
        </div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6 text-green-500" />
            </div>
            <h4 className="font-black text-[14px] text-gray-900 mb-1.5">{isArabic ? 'واتساب' : 'WhatsApp'}</h4>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed min-h-[34px]">
              {isArabic ? 'راسلنا مباشرة عبر واتساب لخدمة أسرع.' : 'Message us directly on WhatsApp for faster support.'}
            </p>
            <span className="text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full group-hover:bg-green-100 transition-colors">
              {isArabic ? 'فتح واتساب' : 'Open WhatsApp'}
            </span>
          </a>

          {/* Phone */}
          <a
            href={`tel:${phone}`}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-3">
              <Phone className="w-6 h-6 text-blue-500" />
            </div>
            <h4 className="font-black text-[14px] text-gray-900 mb-1.5">{isArabic ? 'الهاتف' : 'Phone'}</h4>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed min-h-[34px]">
              {isArabic ? 'يمكنك التواصل معنا خلال أوقات العمل.' : 'You can contact us during working hours.'}
            </p>
            <span className="text-[12px] font-bold text-gray-800 dir-ltr">{phone}</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-purple-500" />
            </div>
            <h4 className="font-black text-[14px] text-gray-900 mb-1.5">{isArabic ? 'البريد الإلكتروني' : 'Email'}</h4>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed min-h-[34px]">
              {isArabic ? 'للاستفسارات العامة أو طلبات الدعم.' : 'For general inquiries or support requests.'}
            </p>
            <span className="text-[12px] font-bold text-gray-800 break-all">{email}</span>
          </a>

          {/* Instagram */}
          <a
            href={instagram} target="_blank" rel="noopener noreferrer"
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center mb-3">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
            <h4 className="font-black text-[14px] text-gray-900 mb-1.5">{isArabic ? 'إنستغرام' : 'Instagram'}</h4>
            <p className="text-[11px] text-gray-500 mb-3 leading-relaxed min-h-[34px]">
              {isArabic ? 'تابع جديدنا وعروضنا عبر حسابنا في إنستغرام.' : 'Follow our latest products and offers on Instagram.'}
            </p>
            <span className="text-[11px] font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full group-hover:bg-pink-100 transition-colors">
              {isArabic ? 'فتح إنستغرام' : 'Open Instagram'}
            </span>
          </a>
        </div>

        {/* Working Hours & Notes */}
        <div className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100 space-y-5">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center shrink-0 mt-1">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-gray-900 mb-1.5">{isArabic ? 'أوقات العمل' : 'Working Hours'}</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed font-medium mb-3">
                {isArabic ? 'نستقبل طلباتكم عبر المتجر الإلكتروني طوال اليوم، ويتم الرد على الاستفسارات خلال أوقات العمل الرسمية.' : 'You can place orders through the online store anytime. Customer inquiries are answered during official working hours.'}
              </p>
              <div className="space-y-2 text-[13px] font-medium">
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-800">{isArabic ? 'السبت إلى الخميس' : 'Saturday to Thursday'}</span>
                  <span className="text-gray-600" dir="ltr">10:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="text-gray-800">{isArabic ? 'الجمعة' : 'Friday'}</span>
                  <span className="text-gray-600">{isArabic ? 'حسب توفر فريق الدعم' : 'Based on support team availability'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[1px] bg-gray-100"></div>

          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center shrink-0 mt-1">
              <Info className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-gray-900 mb-1.5">{isArabic ? 'قبل التواصل معنا' : 'Before Contacting Us'}</h3>
              <p className="text-[12px] text-gray-600 leading-relaxed font-medium">
                {isArabic ? 'لخدمتك بشكل أسرع، يرجى تجهيز رقم الطلب ورقم الهاتف المستخدم في الطلب عند الاستفسار عن طلب سابق.' : 'For faster support, please prepare your order number and the phone number used in the order when asking about a previous purchase.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
