'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: { id?: number | string; title: string; lat: number; lng: number; map_desc: string; notes: string }) => void;
  language: string;
  initialAddress?: { id: number; title: string; lat: number; lng: number; map_desc: string; notes: string } | null;
}

export function AddressModal({ isOpen, onClose, onSave, language, initialAddress }: AddressModalProps) {
  const isArabic = language === 'ar';
  
  const [title, setTitle] = useState('');
  const [latVal, setLatVal] = useState(29.375859);
  const [lngVal, setLngVal] = useState(47.977405);
  const [mapDesc, setMapDesc] = useState('');
  const [notes, setNotes] = useState('');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Leaflet CSS and JS dynamically from CDN
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setLeafletLoaded(true);
      };
      document.body.appendChild(script);
    } else {
      if ((window as any).L) {
        setLeafletLoaded(true);
      }
    }
  }, []);

  // Fetch address description from lat/lng
  const fetchAddressDesc = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=${language}`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.display_name) {
          setMapDesc(json.display_name);
        }
      }
    } catch (err) {
      console.error('Failed to geocode coordinates:', err);
    }
  };

  const setCoordinates = (lat: number, lng: number) => {
    setLatVal(lat);
    setLngVal(lng);
    fetchAddressDesc(lat, lng);
  };

  // Sync state when modal opens or initial address changes
  useEffect(() => {
    if (isOpen) {
      if (initialAddress) {
        setTitle(initialAddress.title || '');
        setLatVal(initialAddress.lat || 29.375859);
        setLngVal(initialAddress.lng || 47.977405);
        setMapDesc(initialAddress.map_desc || '');
        setNotes(initialAddress.notes || '');
      } else {
        setTitle('');
        setLatVal(29.375859);
        setLngVal(47.977405);
        setMapDesc('');
        setNotes('');
        // Reverse geocode default coordinates initially
        fetchAddressDesc(29.375859, 47.977405);
      }
      setErrorMsg('');
    }
  }, [isOpen, initialAddress]);

  // Map Initialization
  useEffect(() => {
    if (isOpen && leafletLoaded) {
      const L = (window as any).L;
      if (!L) return;

      const initialLat = initialAddress?.lat || 29.375859;
      const initialLng = initialAddress?.lng || 47.977405;

      // Clean up previous map if exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const mapContainer = document.getElementById('leaflet-map');
      if (!mapContainer) return;

      // Initialize map
      const map = L.map('leaflet-map').setView([initialLat, initialLng], 13);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
      }).addTo(map);

      // Create draggable marker
      const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
      markerRef.current = marker;

      // On map click
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoordinates(lat, lng);
      });

      // On marker drag
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setCoordinates(position.lat, position.lng);
      });

      // Recalculate size to render properly in flex/modals
      setTimeout(() => {
        map.invalidateSize();
      }, 300);

      return () => {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      };
    }
  }, [isOpen, leafletLoaded, initialAddress]);

  const handleSave = () => {
    if (!title.trim()) {
      setErrorMsg(isArabic ? 'يرجى إدخال اسم العنوان (مثال: البيت)' : 'Please enter an address title (e.g. Home)');
      return;
    }
    if (!mapDesc.trim()) {
      setErrorMsg(isArabic ? 'يرجى تحديد الموقع على الخريطة' : 'Please select a location on the map');
      return;
    }

    onSave({
      id: initialAddress?.id,
      title,
      lat: latVal,
      lng: lngVal,
      map_desc: mapDesc,
      notes,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h3 className="font-extrabold text-sm text-gray-900">
                {initialAddress
                  ? (isArabic ? 'تعديل العنوان' : 'Edit Address')
                  : (isArabic ? 'إضافة عنوان جديد' : 'Add New Address')}
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 select-none cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto no-scrollbar flex-1">
              {/* Title input */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-700 mb-1.5">
                  {isArabic ? 'اسم العنوان (مثال: البيت، العمل)' : 'Address Title (e.g., Home, Office)'}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isArabic ? 'أدخل اسم العنوان' : 'Enter address title'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a1a1a] focus:bg-white outline-none transition-all text-xs font-bold"
                />
              </div>

              {/* Map block */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-700 mb-1.5">
                  {isArabic ? 'تحديد الموقع على الخريطة' : 'Select Location on Map'}
                </label>
                <div className="relative w-full h-[220px] bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden">
                  {!leafletLoaded ? (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      {isArabic ? 'جاري تحميل الخريطة...' : 'Loading map...'}
                    </div>
                  ) : (
                    <div id="leaflet-map" className="w-full h-full" style={{ zIndex: 1 }}></div>
                  )}
                </div>
              </div>

              {/* Map Description (dynamic reverse-geocoded description) */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-700 mb-1.5">
                  {isArabic ? 'العنوان الجغرافي (من الخريطة)' : 'Map Location Description'}
                </label>
                <textarea
                  value={mapDesc}
                  onChange={(e) => setMapDesc(e.target.value)}
                  placeholder={isArabic ? 'تحديد الموقع سيملأ هذا الحقل' : 'Selecting a location will populate this field'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a1a1a] focus:bg-white outline-none transition-all text-xs font-medium resize-none h-16 leading-relaxed"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-extrabold text-gray-700 mb-1.5">
                  {isArabic ? 'تفاصيل إضافية (شقة، دور، ملاحظات)' : 'Additional Notes (Apartment, floor, notes)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isArabic ? 'مثال: الدور الثالث، شقة 12' : 'e.g. Floor 3, apt 12'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1a1a1a] focus:bg-white outline-none transition-all text-xs font-bold"
                />
              </div>

              {errorMsg && (
                <p className="text-[11px] text-red-500 font-extrabold animate-pulse">{errorMsg}</p>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer select-none"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 bg-[#1a1a1a] text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-colors cursor-pointer select-none"
              >
                {isArabic ? 'حفظ العنوان' : 'Save Address'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
