'use client';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import { Sparkles } from 'lucide-react';
import { useNavigate } from '../lib/navigation';

export function TrendingProducts() {
  const { products, categories } = useStore();
  const { dir, language } = useLanguage();
  const navigate = useNavigate();

  const isArabic = language === 'ar';

  // Read active products where isTrending is true and category is active
  const trendingProducts = products.filter(p => {
    const isProductActive = p.active !== false;
    const cat = categories.find(c => c.id === p.categoryId);
    const isCategoryActive = !cat || cat.active !== false;
    return isProductActive && isCategoryActive && p.isTrending;
  });

  if (trendingProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center select-none" dir={dir}>
        <h2 className="text-xl font-bold text-[#1a1a1a] mb-2 font-sans md:text-2xl">
          {isArabic ? 'لا توجد منتجات هبة حالياً' : 'No trending products right now'}
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-[280px] font-sans leading-relaxed">
          {isArabic
            ? 'تابعنا قريباً لاكتشاف المنتجات الأكثر رواجاً.'
            : 'Check back soon to discover the most popular products.'}
        </p>
        <button
          onClick={() => navigate('/home')}
          className="w-full max-w-[280px] py-4 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-black transition-colors font-sans cursor-pointer text-sm shadow-md"
        >
          {isArabic ? 'العودة للتسوق' : 'Back to Shopping'}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24" dir={dir}>
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-sans">
        {isArabic ? 'منتجات الهبة' : 'Trending Products'}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {trendingProducts.map(product => (
          <div key={product.id}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
