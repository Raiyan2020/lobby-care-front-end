'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '../lib/navigation';
import { useStore } from '../contexts/StoreContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Price } from '../components/Price';
import { animateFlyToCart } from '../utils/cartAnimation';
import { Minus, Plus, ShoppingCart, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ProductCard } from '../components/ProductCard';
import { useProductDetailsQuery } from '../hooks/useProductDetailsQuery';
import { useAddToCart } from '../hooks/useAddToCart';
import { isOutOfStock } from '../utils/stock';
import { updateCartItemApi, removeCartItemApi } from '../api/cart';
import { useInvalidateCart } from '../hooks/useCartQuery';
import type { ApiProduct, ProductAttributeValue } from '../api/types';
import type { Product } from '../types';

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Retrieve global store context for local cart/favorites compatibility
  const { cart, updateCartQuantity, removeFromCart, favorites, toggleFavorite } = useStore();
  const { dir, language, t } = useLanguage();

  // Load product details from server
  const { productDetail, similarProducts, isLoading, isError } = useProductDetailsQuery(id);

  // Load updated useAddToCart hook (calls server cart API)
  const { addToCart: addToServerCart, loadingId } = useAddToCart();

  // State to manage selected attributes (maps attribute_id to selected value)
  const [selectedValues, setSelectedValues] = useState<Record<number, ProductAttributeValue>>({});
  const [activeImage, setActiveImage] = useState<string>('');
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const [validationError, setValidationError] = useState<boolean>(false);
  const [productToRemove, setProductToRemove] = useState<string | null>(null);

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const invalidateCart = useInvalidateCart();

  const debounceUpdateQuantity = (cartItemId: string | number, newQty: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    updateCartQuantity(String(cartItemId), newQty);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        await updateCartItemApi(cartItemId, newQty);
        await invalidateCart();
      } catch (err) {
        console.error('Failed to update cart quantity:', err);
        toast.error(err instanceof Error ? err.message : t('addToCartError'));
        await invalidateCart();
      }
    }, 500);
  };

  // Sync state when details load
  useEffect(() => {
    if (productDetail) {
      // Pre-select default values
      const initialSelections: Record<number, ProductAttributeValue> = {};
      productDetail.default_attributes.forEach(attr => {
        initialSelections[attr.attribute_id] = attr.value;
      });
      setSelectedValues(initialSelections);

      // Pre-select active image
      const defaultImg = productDetail.images.find(img => img.is_default)?.image || productDetail.images[0]?.image || '';
      setActiveImage(defaultImg);
    }
    setValidationError(false);
  }, [productDetail]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="text-gray-500 font-bold flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-[var(--store-secondary-color)] rounded-full animate-spin"></div>
          <span>{language === 'ar' ? 'جاري تحميل المنتج...' : 'Loading product...'}</span>
        </div>
      </div>
    );
  }

  if (isError || !productDetail) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          {language === 'ar' ? 'فشل تحميل المنتج' : 'Failed to load product'}
        </h2>
        <p className="text-gray-500 mb-6">
          {language === 'ar' ? 'المنتج غير موجود أو حدث خطأ أثناء الاتصال بالخادم.' : 'Product not found or connection error.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-[#1a1a1a] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors"
        >
          {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
        </button>
      </div>
    );
  }

  // Combine default attributes and all attributes to construct unified option lists
  const attributeGroups = productDetail.attributes.map(group => {
    const defaultAttr = productDetail.default_attributes.find(da => da.attribute_id === group.attribute_id);
    let combinedValues = [...group.values];

    if (defaultAttr && defaultAttr.value) {
      const defaultValue = {
        ...defaultAttr.value,
        is_default: true,
      };
      if (!combinedValues.some(val => val.id === defaultValue.id)) {
        combinedValues = [defaultValue, ...combinedValues];
      }
    }

    return {
      ...group,
      values: combinedValues,
    };
  });

  // Calculate pricing based on selection
  const extraPrice = Object.values(selectedValues).reduce((sum, val) => sum + (val.price || 0), 0);
  const currentPrice = productDetail.price + extraPrice;
  const oldPrice = productDetail.old_price ? (productDetail.old_price + extraPrice) : null;

  // Determine if there are optional/required attributes not selected
  const needsSelection = attributeGroups.some(group => group.is_required && !selectedValues[group.attribute_id]);

  // Find local cart item matching this selection
  // The local cart item variantId is constructed by joining selected attribute value IDs with a '-'
  const getSelectedOptionId = () => {
    return Object.values(selectedValues).map(v => v.id).sort().join('-');
  };

  const currentOptionId = getSelectedOptionId();
  const cartItem = cart.find(item => item.product.id === String(productDetail.id) && item.variantId === currentOptionId);
  const cartQuantity = cartItem ? cartItem.quantity : 0;
  // Real stock when the API reports it; otherwise fall back to an effectively
  // unlimited ceiling so an endpoint that omits the field cannot block a sale.
  const stock = productDetail.stock ?? 999;
  const soldOut = isOutOfStock(productDetail);
  const isAtMaxStock = cartQuantity >= stock;

  const handleAddToCart = async (e: React.MouseEvent) => {
    if (soldOut) return;

    if (needsSelection) {
      setValidationError(true);
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }

    const valueIds = Object.values(selectedValues).map(v => v.id);

    // 1. Call server-side addToCart API
    const added = await addToServerCart(e, productDetail.id, 1, valueIds, productDetail.stock);
    if (!added) return;

    const img = document.getElementById('product-main-image') as HTMLImageElement;
    if (img) {
      animateFlyToCart(img);
    }
  };

  const isFavorite = favorites.includes(String(productDetail.id));

  const handleFavoriteClick = () => {
    setIsHeartAnimating(true);
    toggleFavorite(String(productDetail.id));
    setTimeout(() => setIsHeartAnimating(false), 300);
  };

  const allImages = productDetail.images.map(img => img.image);

  let computedBadge = '';
  if (productDetail.discount_percentage && productDetail.discount_percentage > 0) {
    computedBadge = language === 'ar' ? `خصم ${productDetail.discount_percentage}%` : `-${productDetail.discount_percentage}%`;
  } else if (productDetail.is_featured) {
    computedBadge = language === 'ar' ? 'المميز' : 'Featured';
  }

  // Map API products to local Product interface shape
  const mapApiProductToProduct = (apiProd: ApiProduct): Product => {
    return {
      id: String(apiProd.id),
      name: apiProd.name,
      nameEn: apiProd.name,
      price: apiProd.price,
      originalPrice: apiProd.old_price ?? undefined,
      image: apiProd.image || '',
      optionType: 'none',
      productOptions: [],
      stock: apiProd.stock,
    };
  };

  return (
    <div className="flex flex-col bg-[#fafafa] min-h-screen pb-32">
      {/* Desktop side-by-side or mobile stacked */}
      <div className="w-full lg:container lg:mx-auto lg:px-6 lg:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8 items-start">

          {/* Image Gallery Column (Span 5 on large screens) */}
          <div className="lg:col-span-5 bg-white lg:rounded-3xl lg:border lg:border-gray-100 lg:shadow-sm p-4 pt-4 pb-6 rounded-b-3xl shadow-sm">
            <div className="relative aspect-square w-full bg-gray-50 rounded-3xl flex items-center justify-center overflow-hidden border border-gray-100 shadow-[inset_0_0_20px_rgba(0,0,0,0.02)]">
              {activeImage && (
                <img
                  id="product-main-image"
                  src={activeImage}
                  alt={productDetail.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />
              )}
              {computedBadge && (
                <div className={`absolute top-4 ${dir === 'rtl' ? 'right-4' : 'left-4'} bg-black/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full z-10`}>
                  {computedBadge}
                </div>
              )}
              <button
                type="button"
                onClick={handleFavoriteClick}
                className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'} w-9 h-9 bg-white/90 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center z-10 transition-all duration-300 ${isHeartAnimating ? 'scale-125' : 'scale-100'}`}
              >
                <Heart className={`w-4 h-4 transition-colors text-[var(--store-secondary-color)] ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {allImages.length > 1 && (
              <div className="px-5 mt-4 flex gap-3 overflow-x-auto no-scrollbar">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${activeImage === img ? 'border-[#1a1a1a]' : 'border-transparent'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details Info Column (Span 7 on large screens) */}
          <div className="lg:col-span-7 px-5 lg:px-0 mt-5 lg:mt-0 space-y-5">
            {/* Title and Price */}
            <div className="bg-white lg:rounded-3xl lg:border lg:border-gray-100 lg:p-6 lg:shadow-sm rounded-none p-0 border-none shadow-none">
              <div className="flex flex-col justify-between items-start mb-2 gap-4">
                <h1 className="text-xl lg:text-2xl font-black text-[#1a1a1a] leading-tight">{productDetail.name}</h1>
                <div className="shrink-0">
                  {oldPrice && oldPrice > currentPrice && (
                    <div className="text-sm font-medium text-gray-400 mt-0.5">
                      <Price amount={oldPrice} isOldPrice={true} />
                    </div>
                  )}
                  <div className="text-xl lg:text-2xl font-medium text-[var(--store-secondary-color)]">
                    <Price amount={currentPrice} />
                  </div>
                </div>
              </div>
            </div>

            {/* Attributes Section */}
            {attributeGroups.length > 0 && (
              <div className="space-y-5">
                {attributeGroups.map(group => {
                  const selectedVal = selectedValues[group.attribute_id];

                  return (
                    <div key={group.attribute_id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <h3 className="font-bold text-sm text-[#1a1a1a] mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-3.5 bg-[var(--store-secondary-color)] rounded-full"></span>
                          {group.name}
                        </span>
                        {group.is_required && (
                          <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-bold">
                            {language === 'ar' ? 'إجباري' : 'Required'}
                          </span>
                        )}
                      </h3>

                      <div className="flex flex-wrap gap-2.5">
                        {group.values.map(val => {
                          const isSelected = selectedVal?.id === val.id;

                          return (
                            <button
                              key={val.id}
                              type="button"
                              onClick={() => {
                                setValidationError(false);
                                setSelectedValues(prev => {
                                  const updated = { ...prev };
                                  if (isSelected && !group.is_required) {
                                    delete updated[group.attribute_id];
                                  } else {
                                    updated[group.attribute_id] = val;
                                  }
                                  return updated;
                                });
                              }}
                              className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${isSelected
                                ? 'border-[var(--store-secondary-color)] bg-[var(--store-secondary-color)] text-white shadow-md'
                                : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              <span>{val.name}</span>
                              {val.price > 0 && (
                                <span className={`text-[11px] font-bold ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                                  +{<Price amount={val.price} />}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {validationError && (
                  <div className="text-xs font-bold text-red-500 animate-pulse bg-red-50 p-3 rounded-xl border border-red-100">
                    {language === 'ar'
                      ? 'يرجى اختيار الخيارات الإجبارية أولاً'
                      : 'Please select required options first'}
                  </div>
                )}
              </div>
            )}

            {/* Full Description Section */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[#1a1a1a] mb-3 text-sm flex items-center gap-2">
                <div className="w-1.5 h-4 bg-[var(--store-secondary-color)] rounded-full"></div>
                {language === 'ar' ? 'وصف المنتج' : 'Product Description'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {productDetail.description || (language === 'ar' ? 'تم اختيار هذا المنتج بعناية ليناسب العملاء الباحثين عن المنتجات الأصلية ذات الجودة العالية.' : 'This product is carefully curated for customers seeking high-quality original items.')}
              </p>
            </div>
          </div>

        </div>

        {/* Similar Products (Span full container below columns) */}
        {similarProducts.length > 0 && (
          <div className="px-5 lg:px-0 mt-8 relative z-20 pb-4">
            <h3 className="font-bold text-lg text-[#1a1a1a] mb-4">{language === 'ar' ? 'منتجات مشابهة' : 'Related Products'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similarProducts.map(rp => (
                <div
                  key={rp.id}
                  onClick={() => {
                    navigate(`/product/${rp.id}`);
                  }}
                  className="cursor-pointer"
                >
                  <ProductCard product={mapApiProductToProduct(rp)} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full bg-white border-t border-gray-100 p-3 pb-4 sm:p-4 sm:pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 box-border min-h-[72px] flex flex-col justify-center">
        {cartQuantity > 0 && isAtMaxStock && (
          <div className="text-amber-600 text-[11px] text-center font-bold mb-2 animate-pulse bg-amber-50 py-1 px-2.5 rounded-lg border border-amber-200">
            {language === 'ar'
              ? `الكمية المتوفرة لهذا الخيار هي ${stock} فقط`
              : `Available quantity for this option is only ${stock}`}
          </div>
        )}
        <AnimatePresence mode="wait">
          {cartQuantity === 0 ? (
            <motion.div
              key="add-btn"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <button
                type="button"
                disabled={loadingId === productDetail.id || soldOut}
                aria-disabled={soldOut}
                onClick={handleAddToCart}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all min-w-0 box-border select-none border ${soldOut
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  : needsSelection
                    ? 'bg-gray-100/80 text-gray-700 border-gray-200 cursor-pointer shadow-sm hover:bg-gray-200'
                    : 'bg-[#1a1a1a] border-transparent text-white shadow-lg shadow-black/10 cursor-pointer active:scale-[0.98]'
                  }`}
              >
                <ShoppingCart className={`w-5 h-5 shrink-0 ${needsSelection || soldOut ? 'text-gray-500' : ''}`} />
                <span className="text-sm sm:text-base whitespace-nowrap shrink-0">
                  {soldOut
                    ? t('outOfStock')
                    : loadingId === productDetail.id
                    ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...')
                    : needsSelection
                      ? (language === 'ar' ? 'اختر الخيارات أولاً' : 'Choose options first')
                      : t('addToCart')}
                </span>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="qty-ctrl"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between bg-gray-50/90 rounded-2xl p-1.5 border border-gray-200/60 shadow-sm w-full gap-2 box-border"
            >
              <button
                type="button"
                onClick={() => {
                  if (cartQuantity === 1 && cartItem) {
                    setProductToRemove(cartItem.id || '');
                  } else if (cartItem) {
                    debounceUpdateQuantity(cartItem.id || '', cartQuantity - 1);
                  }
                }}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-[#1a1a1a] shadow-md text-white hover:bg-black active:scale-90 transition-all cursor-pointer select-none shrink-0 font-bold"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="flex-1 flex justify-center items-center">
                <span className="font-extrabold text-2xl text-[#1a1a1a] select-none text-center leading-none">
                  {cartQuantity}
                </span>
              </div>

              <button
                type="button"
                disabled={isAtMaxStock}
                onClick={() => {
                  if (cartItem) {
                    debounceUpdateQuantity(cartItem.id || '', cartQuantity + 1);
                  }
                }}
                className={`w-11 h-11 flex items-center justify-center rounded-xl shadow-md text-white transition-all select-none shrink-0 font-bold ${isAtMaxStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#1a1a1a] hover:bg-black active:scale-90 cursor-pointer'}`}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      {productToRemove && (
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setProductToRemove(null)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-[24px] p-6 w-[84%] max-w-[320px] relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-1.5 font-sans">{t('deleteProductTitle')}</h3>
            <p className="text-gray-500 mb-6 font-medium text-[15px] leading-relaxed font-sans">
              {t('deleteProductConfirm')}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setProductToRemove(null)}
                className="flex-1 h-[50px] bg-gray-50 text-gray-800 rounded-xl font-bold text-[16px] hover:bg-gray-100 transition-colors font-sans"
              >
                {t('cancel')}
              </button>
              <button
                onClick={async () => {
                  if (productToRemove) {
                    const tempId = productToRemove;
                    removeFromCart(tempId);
                    setProductToRemove(null);
                    try {
                      await removeCartItemApi(tempId);
                      await invalidateCart();
                    } catch (err) {
                      console.error("Failed to delete cart item:", err);
                    }
                  }
                }}
                className="flex-1 h-[50px] bg-red-50 text-red-600 rounded-xl font-bold text-[16px] hover:bg-red-100 transition-colors font-sans"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
