'use client';
/**
 * LOBBY CARE home page — Figma node 5:36.
 *
 * Section order (top → bottom):
 *   Hero banner        8:7503   ← home.banners[0]
 *   Category strip     7:7237   ← home.categories
 *   منتجات مميزة        5:378    ← home.featured_products (falls back to most_ordered)
 *   Promo banner       5:1067   ← home.banners[1]
 *   أحدث العروض         5:1068   ← home.latest_offers
 *   Trust strip        5:1069   (static copy)
 *   App download       5:1070   (static copy — the newsletter half is omitted)
 *   Footer             5:1071
 */
import { ArrowLeft, ShieldCheck, Truck, CreditCard, Headphones, Sparkles, LayoutGrid, Tags } from 'lucide-react';
import type { ApiBanner, ApiCategory, ApiProduct } from '../api/types';
import type { HomeLayoutProps } from './HomeLayoutProps';
import { useLanguage } from '../contexts/LanguageContext';
import { useNavigate } from '../lib/navigation';
import { LobbyProductCard } from './lobbycare/LobbyProductCard';
import { StoreFooter } from './StoreFooter';

// ── Static copy that has no API counterpart ────────────────────────────────

const HERO_FALLBACK = {
  titleAr: 'جمال آسيوي.. مستوحى من الطبيعة',
  titleEn: 'Asian beauty, inspired by nature',
  bodyAr: 'اكتشفي أسرار الأعشاب الآسيوية للعناية بالبشرة والشعر والجسم. تركيبات طبيعية لنتائج فعالة وآمنة.',
  bodyEn: 'Discover the secrets of Asian herbs for skin, hair and body. Natural formulas for effective, safe results.',
};

const PROMO_FALLBACK = {
  titleAr: 'عروض تصل إلى 30%',
  titleEn: 'Up to 30% off',
  bodyAr: 'على مجموعة مختارة من السيرومات والتونرات وواقيات الشمس الكورية حتى نهاية الشهر.',
  bodyEn: 'On selected Korean serums, toners and sunscreens until the end of the month.',
};

const TRUST = [
  { Icon: ShieldCheck, titleAr: 'منتجات أصلية 100%', titleEn: '100% authentic', bodyAr: 'مستوردة مباشرة من الموزعين المعتمدين.', bodyEn: 'Imported directly from authorised distributors.' },
  { Icon: Truck, titleAr: 'توصيل سريع داخل الكويت', titleEn: 'Fast delivery in Kuwait', bodyAr: 'خلال 24–48 ساعة لجميع المحافظات.', bodyEn: 'Within 24–48 hours to all governorates.' },
  { Icon: CreditCard, titleAr: 'دفع آمن', titleEn: 'Secure payment', bodyAr: 'كي نت، فيزا، ماستركارد وآبل باي.', bodyEn: 'KNET, Visa, Mastercard and Apple Pay.' },
  { Icon: Headphones, titleAr: 'دعم عملاء متواصل', titleEn: 'Always-on support', bodyAr: 'من 9 ص حتى 9 م.', bodyEn: 'From 9am to 9pm.' },
];

// ── Small building blocks ──────────────────────────────────────────────────

/** The "عرض الكل" affordance shared by every section header on this page. */
function ViewAllButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex shrink-0 items-center gap-2 text-[15px] font-semibold text-[var(--lc-green-deep)] transition-opacity hover:opacity-80 cursor-pointer"
    >
      <ArrowLeft className="h-[17px] w-[17px]" />
      <span dir="auto">{label}</span>
    </button>
  );
}

function SectionHeading({
  title,
  subtitle,
  onViewAll,
  viewAllLabel,
}: {
  title: string;
  subtitle: string;
  onViewAll: () => void;
  viewAllLabel: string;
}) {
  return (
    <div  className="flex justify-between gap-6 px-5 lg:px-20">
      <div className="flex flex-col ">
        <h2 dir="auto" className="text-[26px] font-bold leading-tight text-[var(--lc-ink)] lg:text-[34px]">
          {title}
        </h2>
        <p dir="auto" className="pt-2 text-[15px] leading-[25.5px] text-[var(--lc-muted)]">
          {subtitle}
        </p>
      </div>
      <ViewAllButton onClick={onViewAll} label={viewAllLabel} />
    </div>
  );
}

function ProductGrid({ products, bestSellerIds }: { products: ApiProduct[]; bestSellerIds: Set<number> }) {
  return (
    <div className="grid grid-cols-1 gap-6 px-5 pt-9 sm:grid-cols-2 lg:grid-cols-3 lg:px-20 xl:grid-cols-4">
      {products.map((product) => (
        <LobbyProductCard key={product.id} product={product} bestSeller={bestSellerIds.has(product.id)} />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 px-5 pt-9 sm:grid-cols-2 lg:grid-cols-3 lg:px-20 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[16px] border border-[var(--lc-border)] bg-white">
          <div className="aspect-square w-full animate-pulse bg-[var(--lc-surface)]" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-[var(--lc-surface)]" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-[var(--lc-surface)]" />
            <div className="h-11 w-full animate-pulse rounded-[10px] bg-[var(--lc-surface)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Layout ─────────────────────────────────────────────────────────────────

export function LobbyCareHomeLayout({
  banners,
  categories,
  featuredProducts,
  latestOffers,
  mostOrdered,
  isLoading,
}: HomeLayoutProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  // The API splits its `banners` array across the two banner slots in the design.
  const heroBanner: ApiBanner | undefined = banners?.[0];
  const promoBanner: ApiBanner | undefined = banners?.[1];

  // `featured_products` is empty on the current backend — fall back to the
  // most-ordered list so the section still has something to show.
  const featured = featuredProducts.length > 0 ? featuredProducts : mostOrdered;
  const bestSellerIds = new Set(mostOrdered.map((p) => p.id));

  const heroTitle = heroBanner?.title || (isArabic ? HERO_FALLBACK.titleAr : HERO_FALLBACK.titleEn);
  const heroBody = heroBanner?.description || (isArabic ? HERO_FALLBACK.bodyAr : HERO_FALLBACK.bodyEn);
  const promoTitle = promoBanner?.title || (isArabic ? PROMO_FALLBACK.titleAr : PROMO_FALLBACK.titleEn);
  const promoBody = promoBanner?.description || (isArabic ? PROMO_FALLBACK.bodyAr : PROMO_FALLBACK.bodyEn);

  return (
    <div className="flex w-full flex-col bg-white">
      {/* ── Hero — node 8:7503 ─────────────────────────────────────────── */}
      <section className="px-5 pt-8 lg:px-20 lg:pt-16">
        <div className="relative overflow-hidden rounded-[24px] border border-[#c2c8bf] bg-[#f5f3f3] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          {heroBanner?.image && (
            <img src={heroBanner.image} alt={heroTitle} className="absolute inset-0 h-full w-full object-cover" />
          )}
          {/* Legibility scrim behind the copy (copy sits at the end edge) */}
          {heroBanner?.image && (
            <div className="absolute inset-0 bg-gradient-to-l from-white/85 via-white/60 to-transparent" />
          )}

          {/* Copy sits on the reading-start edge (right in Arabic), clear of the
              product composition that the banner artwork keeps on the far side. */}
          <div className="relative flex min-h-[280px] items-center justify-start px-6 py-10 lg:min-h-[350px] lg:px-12">
            <div className="flex max-w-[560px] flex-col items-start gap-6 text-start">
              <h1 dir="auto" className="text-[28px] font-bold leading-[1.15] text-[var(--lc-ink-hero)] lg:text-[40px]">
                {heroTitle}
              </h1>
              <p dir="auto" className="text-[18px] leading-[1.35] text-[#424842] lg:text-[28px]">
                {heroBody}
              </p>
              <button
                onClick={() => navigate('/products')}
                className="rounded-[8px] bg-[var(--lc-green)] px-8 py-3 text-[18px] text-white transition-opacity hover:opacity-90 lg:text-[24px] cursor-pointer"
              >
                {isArabic ? 'تسوقي الآن' : 'Shop now'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip — node 7:7237 ───────────────────────────────── */}
      <section className="pt-16 lg:pt-20">
        <div className="flex gap-3 px-5 pb-4 lg:px-20">
          <button
            onClick={() => navigate('/categories')}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[var(--lc-surface)] px-4 py-3 text-[15px] font-semibold text-[var(--lc-ink)] transition-shadow hover:shadow-[0_6px_18px_rgba(31,31,31,0.08)] sm:flex-none sm:min-w-40"
          >
            <LayoutGrid className="h-5 w-5 text-[var(--lc-green-deep)]" strokeWidth={1.7} />
            <span>{isArabic ? 'الأقسام' : 'Categories'}</span>
          </button>
          <button
            onClick={() => navigate('/brands')}
            className="flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[12px] bg-[var(--lc-surface)] px-4 py-3 text-[15px] font-semibold text-[var(--lc-ink)] transition-shadow hover:shadow-[0_6px_18px_rgba(31,31,31,0.08)] sm:flex-none sm:min-w-40"
          >
            <Tags className="h-5 w-5 text-[var(--lc-green-deep)]" strokeWidth={1.7} />
            <span>{isArabic ? 'الماركات' : 'Brands'}</span>
          </button>
        </div>
        <div
          data-testid="home-category-strip"
          dir={isArabic ? 'rtl' : 'ltr'}
          className="flex snap-x justify-start gap-4 overflow-x-auto px-5 pb-2 lg:px-20 no-scrollbar"
        >
          {categories.map((category: ApiCategory) => (
            <button
              key={category.id}
              data-category-id={category.id}
              onClick={() => navigate(`/categories?id=${category.id}`)}
              className="flex h-[185px] w-[168px] shrink-0 snap-start cursor-pointer flex-col items-center justify-between rounded-[16px] bg-[var(--lc-surface)] px-6 py-4 transition-shadow hover:shadow-[0_6px_18px_rgba(31,31,31,0.08)]"
            >
              <span className="flex flex-1 items-center justify-center overflow-hidden">
                {category.image ? (
                  <img src={category.image} alt={category.name} className="max-h-[100px] w-auto object-contain" />
                ) : (
                  <Sparkles className="h-12 w-12 text-[var(--lc-green)]" strokeWidth={1.3} />
                )}
              </span>
              <span dir="auto" className="line-clamp-2 text-center text-[20px] leading-[27.2px] text-[var(--lc-ink)]">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── منتجات مميزة — node 5:378 ──────────────────────────────────── */}
      {(isLoading || featured.length > 0) && (
        <section className="py-16 lg:py-[72px]">
          <SectionHeading
            title={isArabic ? 'منتجات مميزة' : 'Featured products'}
            subtitle={
              isArabic
                ? 'مختارة بعناية من أكثر الماركات الكورية والآسيوية ثقة.'
                : 'Hand-picked from the most trusted Korean and Asian brands.'
            }
            onViewAll={() => navigate('/trending-products')}
            viewAllLabel={isArabic ? 'عرض الكل' : 'View all'}
          />
          {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={featured} bestSellerIds={bestSellerIds} />}
        </section>
      )}

      {/* ── Promo banner — node 5:1067 ─────────────────────────────────── */}
      <section className="px-5 lg:px-20">
        <div dir="ltr" className="flex flex-col overflow-hidden rounded-[24px] lg:flex-row">
          <div className="flex flex-col items-start justify-center gap-0 bg-[var(--lc-green-light)] p-8 lg:h-[497px] lg:w-[619px] lg:p-12">
            <span className="rounded-full bg-[var(--lc-green)] px-3 py-1 text-[13px] font-semibold text-white" dir="auto">
              {isArabic ? 'عرض محدود' : 'Limited offer'}
            </span>
            <h3 dir="auto" className="pt-5 text-[30px] font-bold leading-tight text-[var(--lc-ink)] lg:text-[38px]">
              {promoTitle}
            </h3>
            <p dir="auto" className="max-w-[384px] pt-3 text-[16px] leading-[27.2px] text-[var(--lc-muted)]">
              {promoBody}
            </p>
            <button
              onClick={() => navigate('/offers')}
              className="mt-8 h-14 rounded-[12px] bg-[var(--lc-green)] px-8 text-[16px] font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              {isArabic ? 'تسوقي العروض' : 'Shop offers'}
            </button>
          </div>

          <div className="min-h-[240px] flex-1 bg-[var(--lc-surface)] lg:h-[497px]">
            {promoBanner?.image ? (
              <img src={promoBanner.image} alt={promoTitle} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Sparkles className="h-16 w-16 text-[var(--lc-green)]/40" strokeWidth={1.2} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── أحدث العروض — node 5:1068 ──────────────────────────────────── */}
      {(isLoading || latestOffers.length > 0) && (
        <section className="py-16 lg:py-[72px]">
          <SectionHeading
            title={isArabic ? 'أحدث العروض' : 'Latest offers'}
            subtitle={
              isArabic
                ? 'مختارة بعناية من أكثر الماركات الكورية والآسيوية ثقة.'
                : 'Hand-picked from the most trusted Korean and Asian brands.'
            }
            onViewAll={() => navigate('/offers')}
            viewAllLabel={isArabic ? 'عرض الكل' : 'View all'}
          />
          {isLoading ? <ProductGridSkeleton /> : <ProductGrid products={latestOffers} bestSellerIds={bestSellerIds} />}
        </section>
      )}

      {/* ── Trust strip — node 5:1069 ──────────────────────────────────── */}
      <section className="px-5 pt-6 lg:px-20">
        <div className="grid grid-cols-1 gap-8 rounded-[20px] border border-[var(--lc-border)] bg-[var(--lc-surface)] px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map(({ Icon, titleAr, titleEn, bodyAr, bodyEn }) => (
            // Icon sits on the far side of the copy, per node 5:954.
            <div key={titleEn} className="flex items-start gap-4">
              <div className="flex flex-1 flex-col items-start text-start">
                <p dir="auto" className="text-[16px] font-semibold leading-[27.2px] text-[var(--lc-ink)]">
                  {isArabic ? titleAr : titleEn}
                </p>
                <p dir="auto" className="pt-1 text-[14px] leading-[22.75px] text-[var(--lc-muted)]">
                  {isArabic ? bodyAr : bodyEn}
                </p>
              </div>
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-white">
                <Icon className="h-[22px] w-[22px] text-[var(--lc-green)]" strokeWidth={1.6} />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── App download — node 5:1009 (newsletter half intentionally omitted) ── */}
      <section className="px-5 pb-20 pt-24 lg:px-20">
        <div className="flex flex-col items-center justify-start gap-9 rounded-[20px] border border-[var(--lc-border)] bg-[var(--lc-green-light)] px-6 py-12 lg:flex-row">
          <div className="flex w-full max-w-[344px] flex-col items-start gap-6 text-start">
            <h3 dir="auto" className="text-[24px] font-bold text-[var(--lc-ink)] lg:text-[30px]">
              {isArabic ? 'حمّل تطبيق لوبي كير' : 'Download the Lobby Care app'}
            </h3>
            <p dir="auto" className="text-[15px] leading-[25.5px] text-[var(--lc-muted)]">
              {isArabic
                ? 'تتبعي طلبك، واحصلي على عروض حصرية للتطبيق فقط، وتسوقي أسرع في أي وقت.'
                : 'Track your order, get app-only offers and shop faster any time.'}
            </p>
            <div dir="ltr" className="flex flex-wrap items-center gap-3">
              {[
                { badge: '', store: 'App Store' },
                { badge: '', store: 'Google Play' },
              ].map(({ store }) => (
                <span
                  key={store}
                  className="flex h-[52px] items-center gap-3 rounded-[12px] bg-[var(--lc-ink)] px-5 text-white"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-white/15 text-[13px]">▲</span>
                  <span className="flex flex-col leading-none">
                    <span className="text-[10px] leading-[12.5px] opacity-70">Download on</span>
                    <span className="text-[14px] font-semibold leading-[17.5px]">{store}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <StoreFooter />
    </div>
  );
}
