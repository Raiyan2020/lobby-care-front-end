'use client';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import { Percent } from 'lucide-react';
import { useNavigate } from '../lib/navigation';

export function Offers() {
  const { products, categories } = useStore();
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();

  const isArabic = language === 'ar';

  // Read active products where isOffer is true and category is active
  const offerProducts = products.filter(p => {
    const isProductActive = p.active !== false;
    const cat = categories.find(c => c.id === p.categoryId);
    const isCategoryActive = !cat || cat.active !== false;
    return isProductActive && isCategoryActive && p.isOffer;
  });

  if (offerProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center select-none" dir={dir}>
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Percent className="w-10 h-10 text-[var(--store-secondary-color)]" />
        </div>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2 font-sans">
          {isArabic ? 'لا توجد عروض حالياً' : 'No offers available right now'}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-[280px] font-sans leading-relaxed">
          {isArabic 
            ? 'تابعنا قريباً لاكتشاف أحدث العروض والخصومات.' 
            : 'Check back soon for the latest offers and discounts.'}
        </p>
        <button 
          onClick={() => navigate('/home')}
          className="w-full max-w-[280px] py-4 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-black transition-colors font-sans cursor-pointer text-sm"
        >
          {isArabic ? 'العودة للتسوق' : 'Back to Shopping'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24" dir={dir}>
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-sans">
        {isArabic ? 'العروض' : 'Offers'}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {offerProducts.map(product => {
          const Card = ProductCard as any;
          return <Card key={product.id} product={product} />;
        })}
      </div>
    </div>
  );
}
