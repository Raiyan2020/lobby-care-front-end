'use client';
import { useState, useEffect } from 'react';
import { useNavigate } from '../lib/navigation';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowRight, MapPin, Edit2, Trash2, Home, Check, Loader2 } from 'lucide-react';
import { AddressModal } from '../components/AddressModal';
import { addAddressApi, updateAddressApi, deleteAddressApi, BackendAddress } from '../api/address';
import { useAddressesQuery, useInvalidateAddresses } from '../hooks/useAddressesQuery';

export function Addresses() {
  const { dir, language } = useLanguage();
  const navigate = useNavigate();
  const isArabic = language === 'ar';

  const { data: addressesData, isLoading } = useAddressesQuery();
  const invalidateAddresses = useInvalidateAddresses();

  const addresses = addressesData?.data?.addresses || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<BackendAddress | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<BackendAddress | null>(null);

  const syncAddressesToLocalStorage = (list: BackendAddress[]) => {
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
    if (addressesData?.data?.addresses) {
      syncAddressesToLocalStorage(addressesData.data.addresses);
    }
  }, [addressesData]);

  const handleSaveAddress = async (addrObj: any) => {
    try {
      if (editingAddress) {
        // Update existing
        await updateAddressApi(editingAddress.id, addrObj, language);
      } else {
        // Add new
        await addAddressApi(addrObj, language);
      }
      invalidateAddresses();
      setIsModalOpen(false);
      setEditingAddress(null);
    } catch (e) {
      console.error('Failed to save address:', e);
    }
  };

  const handleEditClick = (address: BackendAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleCreateNewClick = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!addressToDelete) return;
    try {
      await deleteAddressApi(addressToDelete.id, language);
      invalidateAddresses();
      setAddressToDelete(null);
    } catch (e) {
      console.error('Failed to delete address:', e);
    }
  };

  return (
    <div className="flex flex-col pb-24 pt-4 bg-[#fafafa]" dir={dir}>
      <div className="container mx-auto px-5 md:px-6 py-4 ">

        {/* Page Title Header */}
        <div className="mb-6 mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/account')}
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-50 transition-colors shadow-sm shrink-0"
            >
              <ArrowRight className={`w-5 h-5 text-gray-800 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
            </button>
            <h2 className="text-[22px] font-black text-[#1a1a1a] font-sans tracking-tight">
              {isArabic ? 'عناويني' : 'My Addresses'}
            </h2>
          </div>
          <button
            onClick={handleCreateNewClick}
            className="hidden md:flex bg-[#1a1a1a] text-white px-6 py-2.5 rounded-xl font-bold items-center justify-center gap-2 hover:bg-black transition-colors shadow-sm text-xs cursor-pointer"
          >
            {isArabic ? 'إنشاء عنوان جديد' : 'Create New Address'}
          </button>
        </div>

        {/* Mobile-only create button */}
        <button
          onClick={handleCreateNewClick}
          className="w-full md:hidden bg-[#1a1a1a] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors mb-4 shadow-sm text-xs"
        >
          {isArabic ? 'إنشاء عنوان جديد' : 'Create New Address'}
        </button>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Loader2 className="w-10 h-10 text-[#1a1a1a] animate-spin mb-4" />
            <p className="text-gray-500 text-sm font-bold">{isArabic ? 'جاري تحميل العناوين...' : 'Loading addresses...'}</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isArabic ? 'لا توجد عناوين محفوظة حالياً' : 'No saved addresses yet'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-[250px] leading-relaxed">
              {isArabic ? 'أضف عنوانك لتسريع عملية الطلب في المرات القادمة.' : 'Add your address to make future checkout faster.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {addresses.map((addr, index) => (
              <div key={addr.id} className="bg-white rounded-[20px] p-5 shadow-2xs border border-gray-100 relative flex flex-col justify-between h-full min-h-[280px]">
                <div>
                  {index === 0 && (
                    <div className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} bg-indigo-50 border border-indigo-100 text-indigo-600 px-3 py-1 rounded-md text-[10px] font-bold flex items-center gap-1.5`}>
                      <Check className="w-3 h-3" />
                      {isArabic ? 'العنوان الافتراضي' : 'Default Address'}
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                      <Home className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-[15px] text-gray-900">{addr.title || (isArabic ? 'المنزل' : 'Home')}</h3>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {isArabic ? 'عنوان محفوظ' : 'Saved Address'}
                      </p>
                    </div>
                  </div>

                  {addr.map_desc && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isArabic ? 'العنوان الجغرافي' : 'Map Location'}</span>
                        <span className="text-[12px] font-medium text-gray-700 leading-relaxed line-clamp-3">{addr.map_desc}</span>
                      </div>
                    </div>
                  )}

                  {addr.notes && (
                    <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isArabic ? 'تفاصيل إضافية' : 'Additional Notes'}</span>
                        <span className="text-[12px] font-bold text-gray-800 leading-relaxed truncate">{addr.notes}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="w-full h-[1px] bg-gray-50 mb-4"></div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditClick(addr)}
                      className="flex-1 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-[13px] cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                    <button
                      onClick={() => setAddressToDelete(addr)}
                      className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-[13px] cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isArabic ? 'حذف' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        language={language}
        initialAddress={editingAddress}
      />

      {/* Delete Confirmation Modal */}
      {addressToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="text-xl font-black text-gray-900 mb-2">{isArabic ? 'حذف العنوان' : 'Delete Address'}</h3>
            <p className="text-gray-500 mb-6 text-sm">{isArabic ? 'هل أنت متأكد أنك تريد حذف هذا العنوان؟' : 'Are you sure you want to delete this address?'}</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAddressToDelete(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20"
              >
                {isArabic ? 'حذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
