'use client';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import { useFavoritesQuery } from '../hooks/useFavoritesQuery';
import { Heart, Loader2 } from 'lucide-react';
import { useNavigate } from '../lib/navigation';
import { motion, AnimatePresence } from 'motion/react';
import type { ApiProduct } from '../api/types';
import type { Product } from '../types';

interface FavoritesProps {
  onNavigateHome: () => void;
}

const mapApiProductToProduct = (p: ApiProduct): Product => {
  return {
    id: String(p.id),
    name: p.name,
    price: p.price,
    originalPrice: p.old_price ?? undefined,
    image: p.image ?? '',
    badge: p.discount_percentage ? `-${p.discount_percentage}%` : undefined,
  };
};

export function Favorites({ onNavigateHome }: FavoritesProps) {
  const { favorites } = useStore();
  const { dir, language, t } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const token = typeof window !== 'undefined' ? localStorage.getItem('api_token') : null;
  const { data: favoritesData, isLoading: queryLoading } = useFavoritesQuery(1);

  const isUnauthenticated = !token || (favoritesData && (favoritesData.key === 'unauthenticated' || favoritesData.code === 401));
  const isLoading = !!token && queryLoading;

  const favoriteProducts = favoritesData?.key === 'success' && favoritesData.data
    ? favoritesData.data.products
        .map(mapApiProductToProduct)
        .filter((product) => favorites.includes(String(product.id)))
    : [];

  if (isUnauthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-[var(--store-secondary-color)]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2 font-sans">
          {isArabic ? 'سجل الدخول لعرض المفضلة' : 'Login to View Favorites'}
        </h2>
        <p className="text-gray-500 mb-8 max-w-[280px] font-sans leading-relaxed text-sm">
          {isArabic
            ? 'يرجى تسجيل الدخول إلى حسابك لعرض المنتجات التي قمت بحفظها.'
            : 'Please login to your account to view the products you have saved.'}
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full max-w-[280px] py-4 text-black rounded-xl font-bold hover:brightness-95 transition-all font-sans"
          style={{ backgroundColor: 'var(--store-secondary-color)' }}
        >
          {isArabic ? 'تسجيل الدخول' : 'Login'}
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--store-secondary-color)]" />
      </div>
    );
  }

  if (favoriteProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-[var(--store-secondary-color)]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2 font-sans">
          {t('noFavoritesTitle')}
        </h2>
        <p className="text-gray-500 mb-8 max-w-[280px] font-sans leading-relaxed">
          {t('noFavoritesDesc')}
        </p>
        <button
          onClick={() => {
            onNavigateHome();
            navigate('/home');
          }}
          className="w-full max-w-[280px] py-4 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-black transition-colors font-sans"
        >
          {t('backToShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6 font-sans">{t('favorites')}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {favoriteProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
