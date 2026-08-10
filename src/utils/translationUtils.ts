export const getTranslatedProduct = (product: any, language: 'ar' | 'en') => {
  if (!product) return product;
  const id = product.id;
  
  // Product Translations
  const transMap: Record<string, { nameEn: string, nameAr: string, descAr?: string, descEn?: string }> = {
    'o1': {
      nameAr: 'عطر ميدنايت عود',
      nameEn: 'Midnight Oud Parfum',
      descAr: 'عطر رجالي فاخر بلمسة العنبر والعود الفواح لجاذبية تدوم طويلاً.',
      descEn: 'A luxury fragrance with bold notes of warm amber, woody oud, and premium spices.'
    },
    'o2': {
      nameAr: 'كرونوغراف كلاسيك',
      nameEn: 'Classic Chronograph',
      descAr: 'ساعة رجالية أنيقة بتصميم رياضي كلاسيكي يناسب جميع الأوقات.',
      descEn: 'An elegant timepiece featuring classic styling and chronographic complexity.'
    },
    'o3': {
      nameAr: 'حقيبة كروس جلدية',
      nameEn: 'Leather Crossbody Bag',
      descAr: 'حقيبة يد عملية مصنوعة من الجلد الطبيعي الممتاز بملمس ناعم وعمر مديد.',
      descEn: 'Practical shoulder bag handcrafted from premium leather with secure gold hardware.'
    },
    'o4': {
      nameAr: 'إيليغانس أو دو برفان',
      nameEn: 'Elegance Eau De Parfum',
      descAr: 'عطر نسائي مفعم بالأنوثة يجمع بين نفحات الياسمين والفاكهة المنعشة.',
      descEn: 'Feminine, radiant perfume blending notes of jasmine, warm vanilla, and sweet citrus.'
    },
    'm1': {
      nameAr: 'ساعة ذهبية سيجنتشر',
      nameEn: 'Signature Gold Watch',
      descAr: 'ساعة يد عصرية ملفتة بلونها الذهبي اللامع ومقاومتها العالية للمياه.',
      descEn: 'Distinguished watch with an 18K gold-plated band, mineral glass, and water resistance.'
    },
    'm2': {
      nameAr: 'نظارات روز جولد',
      nameEn: 'Rose Gold Sunglasses',
      descAr: 'نظارات شمسية بعدسات واقية ممتازة من أشعة الشمس فوق البنفسجية وتصميم عصري.',
      descEn: 'Contemporary sunglasses styled in premium rose-gold frame with UV-400 protection.'
    },
    'm3': {
      nameAr: 'مجموعة العناية بالبشرة',
      nameEn: 'Hydrating Skincare Kit',
      descAr: 'مجموعة متكاملة مخصصة لترطيب وتغذية البشرة بعناصر فيتامينية طبيعية.',
      descEn: 'Premium skincare collection formulated for skin nourishment, hydration, and glow.'
    },
    'm4': {
      nameAr: 'عطر كلاسيك نوار',
      nameEn: 'Classic Noir Parfum',
      descAr: 'تحفة عطرية فريدة تمزج الأخشاب الفاخرة مع الكراميل للمسة ملئية بالغموض.',
      descEn: 'Masterpiece fragrance combining deep woody undertones, fresh cedar, and rare spices.'
    },
    't1': {
      nameAr: 'حقيبة توت بسيطة',
      nameEn: 'Minimalist Tote Bag',
      descAr: 'حقيبة يومية مريحة وواسعة تتسع لجميع أساسياتك بتصميم عصري وألوان محايدة.',
      descEn: 'Effortless daytime tote bag with multiple inner pockets and comfortable wide straps.'
    },
    't2': {
      nameAr: 'كولونيا نسيم البحر',
      nameEn: 'Ocean Breeze Cologne',
      descAr: 'عطر صيفي منعش مستوحى من نسيم البحر المالح والحمضيات الباردة لطاقة متجددة.',
      descEn: 'Refreshing summer cologne drawing notes from marine salt, sage, and cool lime.'
    },
    't3': {
      nameAr: 'حقيبة مخملية فاخرة',
      nameEn: 'Luxury Velvet Pouch',
      descAr: 'حقيبة صغيرة ناعمة مصنوعة من المخمل الفاخر لحفظ إكسسواراتك ومستحضراتك الثمينة.',
      descEn: 'Soft makeup pouch in vibrant velvet designed for securely holding absolute essentials.'
    },
    't4': {
      nameAr: 'أقراط ماسية',
      nameEn: 'Diamond Stud Earrings',
      descAr: 'أقراط ذهبية ناعمة مرصعة بفصوص ألماسية متلألئة تضفي بهجة فورية لجميع مناسباتك.',
      descEn: 'Glistening diamond stud earrings set in solid sterling silver to bring effortless joy.'
    }
  };

  // Badge Translations
  const badgeMap: Record<string, { ar: string, en: string }> = {
    '٣٣٪-': { ar: '٣٣٪-', en: '-33%' },
    '-33%': { ar: '٣٣٪-', en: '-33%' },
    'عرض': { ar: 'عرض', en: 'Offer' },
    'Offer': { ar: 'عرض', en: 'Offer' },
    'تخفيض': { ar: 'تخفيض', en: 'Sale' },
    'Sale': { ar: 'تخفيض', en: 'Sale' },
    '٢٦٪-': { ar: '٢٦٪-', en: '-26%' },
    '-26%': { ar: '٢٦٪-', en: '-26%' },
    'نار': { ar: 'نار', en: 'Hot' },
    'Hot': { ar: 'نار', en: 'Hot' },
    'تريند': { ar: 'تريند', en: 'Trending' },
    'Trending': { ar: 'تريند', en: 'Trending' },
  };

  const translated = { ...product };

  // Translate Name and Description
  if (transMap[id]) {
    translated.name = language === 'ar' ? transMap[id].nameAr : transMap[id].nameEn;
    const desc = language === 'ar' ? transMap[id].descAr : transMap[id].descEn;
    if (desc) {
      translated.description = desc;
    }
  } else {
    // Dynamic products or fallback
    if (language === 'ar') {
      translated.name = product.name || '';
      translated.description = product.description || '';
    } else {
      translated.name = product.nameEn || product.name || '';
      translated.description = product.descriptionEn || product.description || '';
    }
  }

  // Explicit overrides if nameEn/descriptionEn are provided dynamically at runtime
  if (language === 'en') {
    if (product.nameEn) {
      translated.name = product.nameEn;
    }
    if (product.descriptionEn) {
      translated.description = product.descriptionEn;
    }
  } else {
    if (product.name) {
      translated.name = product.name;
    }
    if (product.description) {
      translated.description = product.description;
    }
  }

  // Translate Badge
  if (product.badge) {
    if (badgeMap[product.badge]) {
      translated.badge = language === 'ar' ? badgeMap[product.badge].ar : badgeMap[product.badge].en;
    }
  }

  return translated;
};

export const getTranslatedCategory = (category: any, language: 'ar' | 'en') => {
  if (!category) return category;
  
  const translated = { ...category };
  
  if (language === 'ar') {
    translated.name = category.name || '';
  } else {
    translated.name = category.nameEn || category.name || '';
  }
  
  return translated;
};
