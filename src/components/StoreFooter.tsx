'use client';
/**
 * LOBBY CARE footer — Figma node 5:1071.
 *
 * Brand blurb + four link columns, then a bottom bar with the copyright and
 * the accepted payment rails.
 */
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from '../lib/navigation';

interface FooterLink {
  ar: string;
  en: string;
  path: string;
}

interface FooterColumn {
  ar: string;
  en: string;
  links: FooterLink[];
}

const COLUMNS: FooterColumn[] = [
  {
    ar: 'السياسات',
    en: 'Policies',
    links: [
      { ar: 'سياسة الخصوصية', en: 'Privacy Policy', path: '/terms-privacy' },
      { ar: 'الشروط والأحكام', en: 'Terms & Conditions', path: '/terms-privacy' },
      { ar: 'سياسة الشحن', en: 'Shipping Policy', path: '/terms-privacy' },
      { ar: 'سياسة الاسترجاع', en: 'Return Policy', path: '/return-exchange-policy' },
    ],
  },
  {
    ar: 'التسوق',
    en: 'Shop',
    links: [
      { ar: 'العناية بالبشرة', en: 'Skincare', path: '/categories' },
      { ar: 'العناية بالشعر', en: 'Hair Care', path: '/categories' },
      { ar: 'الأعشاب الآسيوية', en: 'Asian Herbs', path: '/categories' },
      { ar: 'المكياج', en: 'Makeup', path: '/categories' },
      { ar: 'العروض', en: 'Offers', path: '/offers' },
    ],
  },
  {
    ar: 'خدمة العملاء',
    en: 'Customer Service',
    links: [
      { ar: 'تواصل معنا', en: 'Contact Us', path: '/contact' },
      { ar: 'الأسئلة الشائعة', en: 'FAQ', path: '/contact' },
      { ar: 'تتبع الطلب', en: 'Track Order', path: '/orders' },
      { ar: 'الإرجاع والاستبدال', en: 'Returns & Exchange', path: '/return-exchange-policy' },
      { ar: 'طرق الدفع', en: 'Payment Methods', path: '/terms-privacy' },
    ],
  },
];

const CONTACT = {
  phone: '+965 5000 1234',
  email: 'care@lobbycare.com',
  addressAr: 'الكويت، حولي، شارع تونس، مجمع لوبي',
  addressEn: 'Kuwait, Hawally, Tunis St., Lobby Complex',
};

const PAYMENTS = ['KNET', 'VISA', 'MASTERCARD', 'APPLE PAY'];

export function StoreFooter() {
  const { language } = useLanguage();
  const { settings } = useStore();
  const navigate = useNavigate();

  const isArabic = language === 'ar';
  const pick = (item: { ar: string; en: string }) => (isArabic ? item.ar : item.en);

  return (
    <footer className="w-full bg-[var(--lc-surface)] border-t border-[var(--lc-border)]">
      <div className="mx-auto max-w-[1440px] px-5 py-14 lg:px-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand blurb — leads the row on the reading-start edge */}
          <div className="lg:col-span-1">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={isArabic ? settings.storeName : settings.storeNameEn}
                className="mb-4 h-[64px] w-auto cursor-pointer object-contain"
                onClick={() => navigate('/')}
              />
            ) : (
              <p className="mb-4 text-lg font-bold text-[var(--lc-ink-hero)]">LOBBY CARE</p>
            )}
            <p dir="auto" className="text-[14px] leading-[22.75px] text-[var(--lc-muted)]">
              {isArabic
                ? 'لوبي كير متجر كويتي متخصص في منتجات العناية الكورية والآسيوية الأصلية، والأعشاب الطبيعية، ومستحضرات الجمال النظيفة.'
                : 'Lobby Care is a Kuwaiti store specialising in authentic Korean and Asian care products, natural herbs and clean beauty.'}
            </p>
          </div>

          {/* Contact column */}
          <div>
            <h4 dir="auto" className="mb-4 text-[16px] font-semibold text-[var(--lc-ink)]">
              {isArabic ? 'تواصل معنا' : 'Contact Us'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0 text-[var(--lc-green)]" />
                <a href={`tel:${CONTACT.phone.replace(/\s/g, '')}`} dir="ltr" className="text-[14px] text-[var(--lc-muted)] hover:text-[var(--lc-green-deep)] transition-colors">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-[var(--lc-green)]" />
                <a href={`mailto:${CONTACT.email}`} dir="ltr" className="text-[14px] text-[var(--lc-muted)] hover:text-[var(--lc-green-deep)] transition-colors">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 w-4 h-4 shrink-0 text-[var(--lc-green)]" />
                <span dir="auto" className="text-[14px] leading-[22.75px] text-[var(--lc-muted)]">
                  {isArabic ? CONTACT.addressAr : CONTACT.addressEn}
                </span>
              </li>
            </ul>
          </div>

          {/* Link columns */}
          {COLUMNS.map((column) => (
            <div key={column.en}>
              <h4 dir="auto" className="mb-4 text-[16px] font-semibold text-[var(--lc-ink)]">
                {pick(column)}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.en}-${link.en}`}>
                    <button
                      onClick={() => navigate(link.path)}
                      dir="auto"
                      className="cursor-pointer text-[14px] text-[var(--lc-muted)] transition-colors hover:text-[var(--lc-green-deep)]"
                    >
                      {pick(link)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--lc-border)]">
        <div className="mx-auto flex max-w-[1440px] flex-col-reverse items-center justify-between gap-4 px-5 py-5 sm:flex-row lg:px-20">
          <p dir="auto" className="text-[13px] text-[var(--lc-muted)]">
            {isArabic
              ? '© 2026 Lobby Care Kuwait. جميع الحقوق محفوظة.'
              : '© 2026 Lobby Care Kuwait. All rights reserved.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {PAYMENTS.map((name) => (
              <span key={name} className="text-[12px] font-medium tracking-wide text-[var(--lc-muted-soft)]">
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
