import { Product, Banner } from './types';
import { Language } from './i18n';
// @ts-ignore
import EleganceImage from './assets/images/regenerated_image_1780687158587.png';
// @ts-ignore
import ClassicNoirImage from './assets/images/regenerated_image_1780688511309.png';
// @ts-ignore
import OceanBreezeImage from './assets/images/regenerated_image_1780688990561.png';
// @ts-ignore
import VelvetPouchImage from './assets/images/regenerated_image_1780688992736.png';

export const getBanners = (lang: Language): Banner[] => [
  {
    id: 'b1',
    image: 'https://cdn.pixabay.com/photo/2018/02/16/02/03/pocket-watch-3156771_1280.jpg',
    title: 'عطور فاخرة',
    subtitle: 'اكتشف مجموعتنا الحصرية',
    titleEn: 'Luxury Perfumes',
    subtitleEn: 'Discover our exclusive collection',
  },
  {
    id: 'b2',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800',
    title: 'ساعات أصلية',
    subtitle: 'أناقة خالدة',
    titleEn: 'Original Watches',
    subtitleEn: 'Timeless elegance',
  },
  {
    id: 'b3',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
    title: 'تخفيضات الإكسسوارات',
    subtitle: 'خصم حتى ٤٠٪',
    titleEn: 'Accessories Sale',
    subtitleEn: 'Up to 40% off',
  },
];

export const getLatestOffers = (lang: Language): Product[] => [
  {
    id: 'o1',
    name: lang === 'ar' ? 'عطر ميدنايت عود' : 'Midnight Oud Parfum',
    price: 120,
    originalPrice: 180,
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=400',
    badge: lang === 'ar' ? '٣٣٪-' : '-33%',
    optionType: 'size',
    productOptions: [
      { id: 'o1-20', nameAr: '20 ML', nameEn: '20 ML', extraPrice: 0, stock: 20, isActive: true },
      { id: 'o1-50', nameAr: '50 ML', nameEn: '50 ML', extraPrice: 2, stock: 15, isActive: true },
      { id: 'o1-100', nameAr: '100 ML', nameEn: '100 ML', extraPrice: 4, stock: 8, isActive: true }
    ]
  },
  {
    id: 'o2',
    name: lang === 'ar' ? 'كرونوغراف كلاسيك' : 'Classic Chronograph',
    price: 250,
    originalPrice: 320,
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=400',
    badge: lang === 'ar' ? 'عرض' : 'Offer',
    optionType: 'size',
    productOptions: [
      { id: 'o2-20', nameAr: '20 ML', nameEn: '20 ML', extraPrice: 0, stock: 20, isActive: true },
      { id: 'o2-50', nameAr: '50 ML', nameEn: '50 ML', extraPrice: 2, stock: 15, isActive: true },
      { id: 'o2-100', nameAr: '100 ML', nameEn: '100 ML', extraPrice: 4, stock: 8, isActive: true }
    ]
  },
  {
    id: 'o3',
    name: lang === 'ar' ? 'حقيبة كروس جلدية' : 'Leather Crossbody Bag',
    price: 185,
    originalPrice: 240,
    image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=400',
    badge: lang === 'ar' ? 'تخفيض' : 'Sale',
  },
  {
    id: 'o4',
    name: lang === 'ar' ? 'إيليغانس أو دو برفان' : 'Elegance Eau De Parfum',
    price: 95,
    originalPrice: 130,
    image: EleganceImage,
    badge: lang === 'ar' ? '٢٦٪-' : '-26%',
  },
];

export const getMostOrdered = (lang: Language): Product[] => [
  {
    id: 'm1',
    name: lang === 'ar' ? 'ساعة ذهبية سيجنتشر' : 'Signature Gold Watch',
    price: 340,
    image: 'https://images.unsplash.com/photo-1585123334904-845d60e97b29?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviews: 124,
  },
  {
    id: 'm2',
    name: lang === 'ar' ? 'نظارات روز جولد' : 'Rose Gold Sunglasses',
    price: 110,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviews: 89,
  },
  {
    id: 'm3',
    name: lang === 'ar' ? 'مجموعة العناية بالبشرة' : 'Hydrating Skincare Kit',
    price: 85,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviews: 210,
  },
  {
    id: 'm4',
    name: lang === 'ar' ? 'عطر كلاسيك نوار' : 'Classic Noir Parfum',
    price: 145,
    image: ClassicNoirImage,
    rating: 5.0,
    reviews: 432,
  },
];

export const getTrending = (lang: Language): Product[] => [
  {
    id: 't1',
    name: lang === 'ar' ? 'حقيبة توت بسيطة' : 'Minimalist Tote Bag',
    price: 75,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&q=80&w=400',
    badge: lang === 'ar' ? 'نار' : 'Hot',
  },
  {
    id: 't2',
    name: lang === 'ar' ? 'كولونيا نسيم البحر' : 'Ocean Breeze Cologne',
    price: 90,
    image: OceanBreezeImage,
  },
  {
    id: 't3',
    name: lang === 'ar' ? 'حقيبة مخملية فاخرة' : 'Luxury Velvet Pouch',
    price: 45,
    image: VelvetPouchImage,
    badge: lang === 'ar' ? 'تريند' : 'Trending',
  },
  {
    id: 't4',
    name: lang === 'ar' ? 'أقراط ماسية' : 'Diamond Stud Earrings',
    price: 450,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=400',
  },
];
