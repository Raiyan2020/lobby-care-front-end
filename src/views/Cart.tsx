'use client';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useStore } from '../contexts/StoreContext';
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight, ShoppingBag, MapPin, Edit2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Price } from '../components/Price';
import { getTranslatedProduct } from '../utils/translationUtils';
import { updateCartItemApi, removeCartItemApi, clearCartApi } from '../api/cart';
import { useInvalidateCart } from '../hooks/useCartQuery';
import { addAddressApi, updateAddressApi, deleteAddressApi } from '../api/address';
import { useAddressesQuery, useInvalidateAddresses } from '../hooks/useAddressesQuery';
import { AddressModal } from '../components/AddressModal';
import { getSession } from '../utils/auth';
import { toast } from 'sonner';

interface CartProps {
  onNavigateHome: () => void;
}

export function Cart({ onNavigateHome }: CartProps) {
  const navigate = useNavigate();
  const { cart, updateCartQuantity, removeFromCart, clearCart, products } = useStore();
  const { dir, t, language } = useLanguage();
  const [productToRemove, setProductToRemove] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Address Management State & Hooks
  const [session, setSession] = useState(() => getSession());
  const isLoggedIn = !!session?.isLoggedIn;

  const { data: addressesData, isLoading: isLoadingAddresses } = useAddressesQuery();
  const invalidateAddresses = useInvalidateAddresses();

  const addresses = addressesData?.data?.addresses || [];
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<any | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const syncAddressesToLocalStorage = (list: any[]) => {
    const mapped = list.map(addr => ({
      id: String(addr.id),
      name: addr.title,
      governorate: '',
      area: addr.title,
      block: '',
      house: '',
      details: `${addr.map_desc} (${addr.notes})`
    }));
    localStorage.setItem('user_addresses', JSON.stringify(mapped));
  };

  useEffect(() => {
    if (isLoggedIn && addresses.length > 0) {
      const savedSelectedId = localStorage.getItem('selected_address_id');
      const exists = addresses.some(a => String(a.id) === savedSelectedId);
      if (savedSelectedId && exists) {
        setSelectedAddressId(Number(savedSelectedId));
      } else {
        setSelectedAddressId(addresses[0].id);
        localStorage.setItem('selected_address_id', String(addresses[0].id));
      }
      syncAddressesToLocalStorage(addresses);
    } else {
      setSelectedAddressId(null);
      localStorage.removeItem('selected_address_id');
      localStorage.setItem('user_addresses', '[]');
    }
  }, [addressesData, isLoggedIn]);

  const handleSaveAddress = async (addr: { id?: number | string; title: string; lat: number; lng: number; map_desc: string; notes: string }) => {
    try {
      if (addr.id) {
        // Update Address
        await updateAddressApi(addr.id, addr, language);
      } else {
        // Add Address
        const res = await addAddressApi(addr, language);
        if (res && res.data) {
          setSelectedAddressId(res.data.id);
          localStorage.setItem('selected_address_id', String(res.data.id));
          setValidationError(null);
        }
      }
      invalidateAddresses();
      setIsAddressModalOpen(false);
      setEditingAddress(null);
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddressApi(addressToDelete.id, language);
      invalidateAddresses();
      setAddressToDelete(null);
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const invalidateCart = useInvalidateCart();

  const debounceUpdateQuantity = (cartItemId: string, newQty: number) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    updateCartQuantity(cartItemId, newQty);

    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        await updateCartItemApi(cartItemId, newQty);
        await invalidateCart();
      } catch (err) {
        console.error('Failed to update cart item quantity:', err);
        toast.error(err instanceof Error ? err.message : t('addToCartError'));
        await invalidateCart();
      }
    }, 500);
  };

  const handleMinusClick = (cartItemId: string, quantity: number) => {
    if (quantity === 1) {
      setProductToRemove(cartItemId);
    } else {
      debounceUpdateQuantity(cartItemId, quantity - 1);
    }
  };

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

  const deliveryFee = totalItems > 0 ? 15 : 0; // Example fixed delivery fee
  const total = subtotal + deliveryFee;

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">{t('emptyCartTitle')}</h2>
        <p className="text-gray-500 mb-8">{t('emptyCartDesc')}</p>
        <button
          onClick={onNavigateHome}
          className="bg-[#1a1a1a] text-white px-8 py-4 rounded-xl font-bold hover:bg-black transition-colors w-full max-w-xs active:scale-[0.98]"
        >
          {t('backToShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa]">
      <div className="container mx-auto px-4 md:px-6 py-4">

        {/* Title Bar */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#1a1a1a]">{t('cartTitle')}</h2>
          <div className="flex items-center gap-3">
            <span className="bg-gray-100 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
              {totalItems} {totalItems === 1 ? t('item') : t('items')}
            </span>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center"
              title={language === 'ar' ? 'مسح السلة' : 'Clear Cart'}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two Column Layout for Desktop, Stacked for Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const translatedProduct = getTranslatedProduct(item.product, language);
              const productExists = products.some(p => p.id === item.product.id);
              const cartItemId = item.id || item.product.id;

              return (
                <div
                  key={cartItemId}
                  onClick={() => {
                    if (productExists) {
                      navigate(`/product/${item.product.id}`);
                    }
                  }}
                  className={`bg-white rounded-[20px] p-[14px] shadow-sm border border-gray-100 flex gap-3 transition-all duration-200 select-none ${productExists
                    ? 'cursor-pointer hover:bg-gray-50/50 hover:border-gray-200 hover:shadow-md active:scale-[0.99]'
                    : 'opacity-80'
                    }`}
                >
                  <div className="w-[96px] h-[96px] bg-gray-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                    <img src={translatedProduct.image} alt={translatedProduct.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex flex-col flex-1 justify-between py-0.5">
                    <div>
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <h3 className="font-bold text-[#1a1a1a] text-[13px] line-clamp-2 leading-tight flex-1">
                          {translatedProduct.name}
                        </h3>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductToRemove(cartItemId);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-2 -mt-1 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-[18px] h-[18px]" />
                        </button>
                      </div>

                      {item.selectedOptionType ? (
                        <div className="mb-2.5 flex items-center">
                          <span className="text-[12px] font-medium text-gray-500">
                            {language === 'ar' ? item.selectedOptionLabelAr : item.selectedOptionLabelEn}: <span className="font-bold text-gray-700 mx-1">{language === 'ar' ? item.selectedOptionValueAr : item.selectedOptionValueEn}</span>
                          </span>
                        </div>
                      ) : (
                        (!['افتراضي', 'Default'].includes(item.selectedSize || 'افتراضي') ||
                          !['افتراضي', 'Default'].includes(item.selectedColor || 'افتراضي')) && (
                          <div className="mb-2.5 flex items-center">
                            <span className="text-[12px] font-medium text-gray-500">
                              {item.selectedSize && !['افتراضي', 'Default'].includes(item.selectedSize) && (
                                <>{language === 'ar' ? 'المقاس:' : 'Size:'} <span className="font-bold text-gray-700 mx-0.5">{item.selectedSize}</span></>
                              )}
                              {item.selectedSize && !['افتراضي', 'Default'].includes(item.selectedSize) && item.selectedColor && !['افتراضي', 'Default'].includes(item.selectedColor) && (
                                <span className="mx-2 text-gray-300">|</span>
                              )}
                              {item.selectedColor && !['افتراضي', 'Default'].includes(item.selectedColor) && (
                                <>{language === 'ar' ? 'اللون:' : 'Color:'} <span className="font-bold text-gray-700 mx-0.5">{item.selectedColor}</span></>
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-col">
                        <div className="text-[15px] font-black text-[var(--store-secondary-color)] leading-none mb-1">
                          {(() => {
                            let extraPrice = 0;
                            if (item.product.optionType === 'size' || item.product.optionType === 'color') {
                              const opt = item.product.productOptions?.find(o => o.id === item.variantId);
                              if (opt) extraPrice = opt.extraPrice || 0;
                            }
                            return <Price amount={translatedProduct.price + extraPrice} />;
                          })()}
                        </div>
                        {translatedProduct.originalPrice && translatedProduct.originalPrice > translatedProduct.price && (
                          <div className="text-[11px] font-bold text-gray-400">
                            {(() => {
                              let extraPrice = 0;
                              if (item.product.optionType === 'size' || item.product.optionType === 'color') {
                                const opt = item.product.productOptions?.find(o => o.id === item.variantId);
                                if (opt) extraPrice = opt.extraPrice || 0;
                              }
                              return <Price amount={translatedProduct.originalPrice + extraPrice} isOldPrice={true} />;
                            })()}
                          </div>
                        )}
                      </div>

                      {(() => {
                        let stock = item.product.stock ?? 999;
                        if (item.product.optionType === 'size' || item.product.optionType === 'color') {
                          const matchedOpt = item.product.productOptions?.find(opt => opt.id === item.variantId);
                          if (matchedOpt && matchedOpt.stock !== undefined) stock = Math.min(stock, matchedOpt.stock);
                        }
                        const isAtMaxStock = item.quantity >= stock;
                        return (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1 border border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMinusClick(cartItemId, item.quantity);
                                }}
                                className="w-[34px] h-[34px] flex items-center justify-center rounded-md bg-white shadow-sm text-gray-600 hover:text-[#1a1a1a] cursor-pointer"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="font-bold text-[13px] w-5 text-center">{item.quantity}</span>
                              <button
                                disabled={isAtMaxStock}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  debounceUpdateQuantity(cartItemId, item.quantity + 1);
                                }}
                                className={`w-[34px] h-[34px] flex items-center justify-center rounded-md bg-white shadow-sm transition-colors ${isAtMaxStock ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:text-[#1a1a1a] cursor-pointer'}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary (Sticky on Desktop) */}
          <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">

            {/* Address Selection Section */}
            {isLoggedIn ? (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <h3 className="font-bold text-[15px] text-gray-900">
                    {t('deliveryAddress')}
                  </h3>
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('addAddress')}
                    </button>
                  )}
                </div>

                {isLoadingAddresses ? (
                  <div className="py-4 text-center text-xs text-gray-400">
                    {t('loadingAddresses')}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="py-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAddress(null);
                        setIsAddressModalOpen(true);
                      }}
                      className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-dashed border-gray-200 hover:border-gray-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-indigo-600" />
                      {t('addAddressOnly')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
                    {addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            localStorage.setItem('selected_address_id', String(addr.id));
                            setValidationError(null);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${isSelected
                            ? 'border-[var(--store-secondary-color)] bg-[var(--store-secondary-color)]/10 shadow-sm '
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'border-[var(--store-secondary-color)] bg-[var(--store-secondary-color)]' : 'border-gray-300'
                            }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>

                          <div className="flex-1 space-y-1 pr-12 min-w-0">
                            <p className="text-xs font-black text-gray-900 truncate">
                              {addr.title || t('savedAddress')}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium line-clamp-1 leading-relaxed">
                              {addr.map_desc}
                            </p>
                            {addr.notes && (
                              <p className="text-[10px] text-gray-500 font-bold line-clamp-1">
                                {addr.notes}
                              </p>
                            )}
                          </div>

                          <div className={`absolute top-3.5 ${dir === 'rtl' ? 'left-3' : 'right-3'} flex items-center gap-1.5`}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAddress(addr);
                                setIsAddressModalOpen(true);
                              }}
                              className="p-1 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-lg transition-colors cursor-pointer"
                              title={t('editLabel')}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAddressToDelete(addr);
                              }}
                              className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title={t('deleteLabel')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
                <p className="text-xs font-bold text-gray-700 leading-relaxed">
                  {t('signInToManageAddresses')}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('auth_redirect', '/cart');
                    navigate('/login');
                  }}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {t('signIn')}
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg mb-4">{t('orderSummary')}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t('productCount')}</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('subtotal')}</span>
                  <span className="font-medium text-[#1a1a1a]">
                    <Price amount={subtotal + totalDiscount} />
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-medium">
                    <span>{language === 'ar' ? 'إجمالي الخصم' : 'Total Discount'}</span>
                    <span>
                      <span className="text-[11px] font-bold mx-1">{language === 'ar' ? '(وفرت' : '(Saved'}</span>
                      <Price amount={totalDiscount} />
                      <span className="text-[11px] font-bold mx-1">{language === 'ar' ? ')' : ')'}</span>
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-[#1a1a1a]">
                  <span>{t('delivery')}</span>
                  <span className="font-medium">
                    <Price amount={deliveryFee} />
                  </span>
                </div>

                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold">{t('total')}</span>
                  <span className="font-black text-lg text-[var(--store-secondary-color)]">
                    <Price amount={total} />
                  </span>
                </div>
              </div>
            </div>

            {validationError && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 p-3.5 rounded-xl border border-red-100 mb-4 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px] font-semibold leading-relaxed">{validationError}</p>
              </div>
            )}
            <div>
              <button
                onClick={() => {
                  if (isLoggedIn && !selectedAddressId) {
                    setValidationError(t('selectAddressValidationError'));
                    return;
                  }
                  setValidationError(null);
                  navigate('/checkout');
                }}
                className="w-full bg-[#1a1a1a] text-[#ffffff] py-4 rounded-xl font-bold text-lg hover:bg-black transition-colors active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {t('checkout')}
              </button>
            </div>
          </div>

        </div>

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

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-y-0 left-1/2 -translate-x-1/2 w-full z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowClearConfirm(false)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-[24px] p-6 w-[84%] max-w-[320px] relative z-10 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <h3 className="text-[22px] font-bold text-[#1a1a1a] mb-1.5 font-sans">
              {language === 'ar' ? 'تفريغ السلة' : 'Clear Cart'}
            </h3>
            <p className="text-gray-500 mb-6 font-medium text-[15px] leading-relaxed font-sans">
              {language === 'ar'
                ? 'هل أنت متأكد من رغبتك في حذف جميع المنتجات من السلة؟'
                : 'Are you sure you want to remove all products from the cart?'}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 h-[50px] bg-gray-50 text-gray-800 rounded-xl font-bold text-[16px] hover:bg-gray-100 transition-colors font-sans"
              >
                {t('cancel')}
              </button>
              <button
                onClick={async () => {
                  clearCart();
                  setShowClearConfirm(false);
                  try {
                    await clearCartApi();
                    await invalidateCart();
                  } catch (err) {
                    console.error("Failed to clear cart:", err);
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

      {/* Address Management Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => {
          setIsAddressModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        language={language}
        initialAddress={editingAddress}
      />

      {/* Delete Address Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {language === 'ar' ? 'حذف العنوان' : 'Delete Address'}
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              {language === 'ar'
                ? 'هل أنت متأكد أنك تريد حذف هذا العنوان؟'
                : 'Are you sure you want to delete this address?'}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors cursor-pointer text-xs"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20 cursor-pointer text-xs"
              >
                {language === 'ar' ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
