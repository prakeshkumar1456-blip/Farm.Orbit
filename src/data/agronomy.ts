import type { IrrigationType, LanguageCode, SoilType, TargetRegion } from '../types/farm';

export const TARGET_REGIONS: TargetRegion[] = [
  {
    id: 'haldia',
    name: 'Haldia',
    nameHi: 'हल्दिया',
    nameBn: 'হলদিয়া',
    district: 'Purba Medinipur, West Bengal',
    lat: 22.0667,
    lon: 88.0698,
    descriptionEn: 'Coastal industrial & alluvial delta farmland near Haldi River.',
    descriptionHi: 'हल्दी नदी के पास तटीय जलोढ़ कृषि क्षेत्र।',
    descriptionBn: 'হলদি নদীর তীরবর্তী উপকূলীয় পলিমাটির কৃষি এলাকা।',
  },
  {
    id: 'tamluk',
    name: 'Tamluk',
    nameHi: 'तमलुक',
    nameBn: 'তমলুক',
    district: 'Purba Medinipur, West Bengal',
    lat: 22.2855,
    lon: 87.9212,
    descriptionEn: 'Rupnarayan river basin known for paddy, betel vine, and winter vegetables.',
    descriptionHi: 'रूपनारायण नदी बेसिन, धान, पान और सर्दियों की सब्जियों के लिए प्रसिद्ध।',
    descriptionBn: 'রূপনারায়ণ অববাহিকা—ধান, পান ও শীতকালীন সবজি চাষের জন্য পরিচিত।',
  },
  {
    id: 'purba-medinipur',
    name: 'Purba Medinipur (Contai)',
    nameHi: 'पूर्व मेदिनीपुर (कांथी)',
    nameBn: 'পূর্ব মেদিনীপুর (কাঁথি)',
    district: 'Purba Medinipur, West Bengal',
    lat: 21.7782,
    lon: 87.7525,
    descriptionEn: 'Southern coastal plain of Purba Medinipur with paddy and rabi pulses.',
    descriptionHi: 'पूर्व मेदिनीपुर का दक्षिणी तटीय मैदान, धान और रबी दलहन क्षेत्र।',
    descriptionBn: 'পূর্ব মেদিনীপুরের দক্ষিণ উপকূলীয় সমভূমি—ধান ও রবি ডালশস্যের এলাকা।',
  },
];

export const CROP_OPTIONS = [
  { id: 'aman_paddy', en: 'Aman Paddy (Monsoon Rice)', hi: 'अमन धान (खरीफ)', bn: 'আমন ধান (বর্ষাকালীন)' },
  { id: 'boro_paddy', en: 'Boro Paddy (Winter/Summer Rice)', hi: 'बोरो धान (गर्मी)', bn: 'বোরো ধান (শীত/গ্রীষ্ম)' },
  { id: 'mustard', en: 'Mustard / Toria', hi: 'सरसों / तोरिया', bn: 'সরিষা / তোরি' },
  { id: 'green_gram', en: 'Green Gram (Moong)', hi: 'मूंग दाल', bn: 'মুগ ডাল' },
  { id: 'potato', en: 'Potato / Rabi Vegetables', hi: 'आलू / रबी सब्जियां', bn: 'আলু / শীতের সবজি' },
  { id: 'sesame', en: 'Sesame (Til)', hi: 'तिल', bn: 'তিল' },
];

export interface RotationContext {
  locationLabel: string;
  soilType: SoilType;
  irrigation: IrrigationType;
  soilWetnessPct: number | null;
  rain30d: number | null;
  tempC: number | null;
  lang: LanguageCode;
}

export interface RotationOption {
  id: string;
  title: Record<LanguageCode, string>;
  waterDemand: 'low' | 'medium' | 'high';
  window: Record<LanguageCode, string>;
  image: string;
  benefits: Record<LanguageCode, string[]>;
  limitations: Record<LanguageCode, string[]>;
  whySuggested: (ctx: RotationContext) => string;
}

export interface SeasonalPlanStep {
  season: Record<LanguageCode, string>;
  crop: Record<LanguageCode, string>;
  note: Record<LanguageCode, string>;
}

const OPT_GREEN_GRAM: RotationOption = {
  id: 'green_gram',
  title: {
    en: 'Green Gram (Moong / Pulse)',
    hi: 'मूंग दाल (दलहन फसल)',
    bn: 'মুগ ডাল (ডালশস্য)',
  },
  waterDemand: 'low',
  window: {
    en: 'Late Winter to Pre-Monsoon (Feb–Apr, 65–75 days)',
    hi: 'फरवरी से अप्रैल (65–75 दिन)',
    bn: 'ফেব্রুয়ারি থেকে এপ্রিল (৬৫–৭৫ দিন)',
  },
  image: '/src/assets/images/crop_pulses_mustard_1794649965427.jpg',
  benefits: {
    en: [
      'Fixes natural nitrogen in soil, lowering fertilizer costs for the next paddy crop.',
      'Requires far less water than Boro paddy when rainfall is low or irrigation is limited.',
    ],
    hi: [
      'मिट्टी में प्राकृतिक नाइट्रोजन बढ़ाती है, जिससे अगली धान फसल में खाद कम लगती है।',
      'कम बारिश या सीमित सिंचाई में बोरो धान की तुलना में बहुत कम पानी लेती है।',
    ],
    bn: [
      'মাটিতে প্রাকৃতিক নাইট্রোজেন যোগ করে, ফলে পরের ধানে সার কম লাগে।',
      'কম বৃষ্টি বা সীমিত সেচের অবস্থায় বোরো ধানের চেয়ে অনেক কম জল লাগে।',
    ],
  },
  limitations: {
    en: [
      'Sensitive to pre-monsoon Nor’wester waterlogging; maintain field drainage channels.',
      'Check local soil salinity before sowing in coastal Haldia or Contai creek plots.',
    ],
    hi: [
      'तेज आंधी-बारिश से जलभराव होने पर फसल को नुकसान हो सकता है; जल निकासी नाली रखें।',
      'हल्दिया व कांथी के तटीय खारे खेतों में बुवाई से पहले मिट्टी के खारेपन की जांच करें।',
    ],
    bn: [
      'কালবৈশাখীর জলাবদ্ধতায় ক্ষতি হতে পারে; জমিতে জল নিকাশি নালা রাখুন।',
      'হলদিয়া ও কাঁথির উপকূলীয় জমিতে বপনের আগে মাটির লবণাক্ততা যাচাই করুন।',
    ],
  },
  whySuggested: (ctx) => {
    const soilHint =
      ctx.soilType === 'coastal_saline'
        ? ctx.lang === 'hi'
          ? 'खारी मिट्टी में हल्की सिंचाई और मेड़ निकासी के साथ जांचें।'
          : ctx.lang === 'bn'
          ? 'লবণাক্ত জমিতে হালকা সেচ ও নিকাশিসহ পরীক্ষা করে বপন করুন।'
          : 'On coastal saline soil, pair with drainage bunds and local KVK variety checks.'
        : '';
    if (ctx.lang === 'hi') {
      return `नासा डेटा में 30-दिन की बारिश ${ctx.rain30d ?? '—'} मिमी और सतही नमी ${ctx.soilWetnessPct ?? '—'}% है। कम पानी की जरूरत के कारण मूंग एक व्यावहारिक दलहन विकल्प है। ${soilHint}`;
    }
    if (ctx.lang === 'bn') {
      return `NASA তথ্যে গত ৩০ দিনের বৃষ্টি ${ctx.rain30d ?? '—'} মিমি এবং উপরের মাটির আর্দ্রতা ${ctx.soilWetnessPct ?? '—'}%। কম জলের চাহিদার কারণে মুগ ডাল একটি উপযোগী বিকল্প। ${soilHint}`;
    }
    return `Observed 30-day rainfall is ${ctx.rain30d ?? '—'} mm with ${ctx.soilWetnessPct ?? '—'}% surface soil wetness. Low water demand makes Green Gram practical to explore. ${soilHint}`;
  },
};

const OPT_MUSTARD: RotationOption = {
  id: 'mustard',
  title: {
    en: 'Yellow / Brown Mustard (Rabi Oilseed)',
    hi: 'पीली / भूरी सरसों (रबी तिलहन)',
    bn: 'সরিষা (রবি তৈলবীজ)',
  },
  waterDemand: 'low',
  window: {
    en: 'Post-Aman Rabi Window (Nov–Feb, 85–100 days)',
    hi: 'नवंबर से फरवरी (85–100 दिन)',
    bn: 'নভেম্বর থেকে ফেব্রুয়ারি (৮৫–১০০ দিন)',
  },
  image: '/src/assets/images/crop_pulses_mustard_1794649965427.jpg',
  benefits: {
    en: [
      'Uses residual post-monsoon moisture right after Aman paddy harvest.',
      'Breaks continuous paddy pest and weed cycles while providing edible oilseed.',
    ],
    hi: [
      'अमन धान के बाद मिट्टी में बची हुई नमी से ही अच्छी तरह उग सकती है।',
      'लगातार धान उगाने से बढ़ने वाले कीट और खरपतवार के चक्र को तोड़ती है।',
    ],
    bn: [
      'আমন ধান কাটার পর মাটিতে থাকা অবশিষ্ট রস ব্যবহার করেই চাষ করা যায়।',
      'একটানা ধান চাষের ফলে হওয়া পোকা ও আগাছার চক্র ভেঙে দেয়।',
    ],
  },
  limitations: {
    en: [
      'Cannot tolerate standing water in low-lying clay basins.',
      'High humidity (>84%) favors aphids and Alternaria leaf spot; monitor leaves weekly.',
    ],
    hi: [
      'निचले जलभराव वाले खेतों में सरसों नहीं टिकती।',
      'अधिक नमी (>84%) रहने पर माहू (चेपा) का खतरा बढ़ता है; साप्ताहिक जांच करें।',
    ],
    bn: [
      'জল জমা নিচু জমিতে সরিষা ভালো হয় না।',
      'বেশি আর্দ্রতায় (>৮৪%) জাবপোকার ঝুঁকি বাড়ে; সপ্তাহে অন্তত একবার পাতা দেখুন।',
    ],
  },
  whySuggested: (ctx) => {
    if (ctx.lang === 'hi') {
      return `अभी हवा का तापमान ~${ctx.tempC ?? '—'} °C और सतही नमी ~${ctx.soilWetnessPct ?? '—'}% है — हल्की जुताई या शून्य-जुताई से रबी सरसों की बुवाई जांची जा सकती है।`;
    }
    if (ctx.lang === 'bn') {
      return `বর্তমান তাপমাত্রা ~${ctx.tempC ?? '—'} °C এবং মাটির আর্দ্রতা ~${ctx.soilWetnessPct ?? '—'}% — রবি মরসুমে অবশিষ্ট রস কাজে লাগিয়ে সরিষা বিবেচনা করা যায়।`;
    }
    return `With air temperature around ${ctx.tempC ?? '—'} °C and surface wetness at ${ctx.soilWetnessPct ?? '—'}%, residual moisture after monsoon paddy can support timely Rabi mustard.`;
  },
};

const OPT_SESAME: RotationOption = {
  id: 'sesame',
  title: {
    en: 'Sesame / Til (Heat-Tolerant Oilseed)',
    hi: 'तिल (कम पानी वाली गर्मी फसल)',
    bn: 'তিল (কম জলের গ্রীষ্মকালীন তৈলবীজ)',
  },
  waterDemand: 'low',
  window: {
    en: 'Late Winter to Summer (Feb–May, 80–90 days)',
    hi: 'फरवरी से मई (80–90 दिन)',
    bn: 'ফেব্রুয়ারি থেকে মে (৮০–৯০ দিন)',
  },
  image: '/src/assets/images/crop_aman_paddy_1794649964972.jpg',
  benefits: {
    en: [
      'Tolerates warmer land surface temperatures better than leafy vegetables.',
      'Deep taproot accesses subsoil moisture when surface soil dries.',
    ],
    hi: [
      'गर्म तापमान को सब्जियों की तुलना में बेहतर सहन कर सकती है।',
      'गहरी जड़ होने से ऊपरी मिट्टी सूखने पर भी नीचे की नमी ले सकती है।',
    ],
    bn: [
      'বেশি তাপমাত্রা সহ্য করতে পারে এবং গভীর শিকড় নিচের স্তরের রস টেনে নিতে পারে।',
      'কম সেচে গ্রীষ্মকালীন আবর্তনের জন্য উপযোগী।',
    ],
  },
  limitations: {
    en: [
      'Very sensitive to standing water after summer storms; sow on raised beds or drained loam.',
      'Needs weeding during the first 25 days.',
    ],
    hi: [
      'गर्मी की आंधी-बारिश में पानी भरने से जड़ सड़ सकती है; निकासी नाली बनाएं।',
      'शुरुआती 25 दिनों में निराई-गुड़ाई जरूरी होती है।',
    ],
    bn: [
      'ঝড়বৃষ্টিতে জল দাঁড়ালে শিকড় পচে যায়; নিকাশি নালা রাখা জরুরি।',
      'প্রথম ২৫ দিনে আগাছা পরিষ্কার রাখা প্রয়োজন।',
    ],
  },
  whySuggested: (ctx) => {
    if (ctx.lang === 'hi') {
      return `${ctx.locationLabel} में 30-दिन की बारिश ${ctx.rain30d ?? '—'} मिमी है — यदि आपके पास ट्यूबवेल सिंचाई नहीं है तो तिल कम पानी वाला टिकाऊ विकल्प है।`;
    }
    if (ctx.lang === 'bn') {
      return `${ctx.locationLabel}-এ গত ৩০ দিনের বৃষ্টি ${ctx.rain30d ?? '—'} মিমি — পর্যাপ্ত সেচ না থাকলে তিল একটি টেকসই কম-জলের বিকল্প।`;
    }
    return `In ${ctx.locationLabel} (${ctx.rain30d ?? '—'} mm over 30 days), Sesame is a resilient low-water option especially where assured tubewell irrigation is unavailable.`;
  },
};

const OPT_VEGETABLE_POTATO: RotationOption = {
  id: 'potato_veg',
  title: {
    en: 'Potato / Winter Vegetables (Ridge-Furrow)',
    hi: 'आलू / रबी सब्जियां (मेड़ विधि)',
    bn: 'আলু / শীতকালীন সবজি (ভেলী পদ্ধতি)',
  },
  waterDemand: 'medium',
  window: {
    en: 'Winter Rabi Window (Nov–Feb, 85–110 days)',
    hi: 'नवंबर से फरवरी (85–110 दिन)',
    bn: 'নভেম্বর থেকে ফেব্রুয়ারি (৮৫–১১০ দিন)',
  },
  image: '/src/assets/images/hero_bengal_farmland_1794649965184.jpg',
  benefits: {
    en: [
      'Uses far less water than summer Boro paddy while diversifying seasonal food and market crops.',
      'Well suited to well-drained sandy-loam or alluvial ridges in Tamluk and Panskura belts.',
    ],
    hi: [
      'गर्मी के बोरो धान की तुलना में कम पानी में उगती है और खेत की विविधता बढ़ाती है।',
      'तमलुक और मेदिनीपुर के अच्छे जल निकासी वाले दोमट खेतों के लिए उपयुक्त।',
    ],
    bn: [
      'বোরো ধানের চেয়ে অনেক কম জলে চাষ হয় এবং ফসলের বৈচিত্র্য বাড়ায়।',
      'তমলুক ও মেদিনীপুরের জল নিকাশিযুক্ত দোআঁশ মাটিতে ভালো মানায়।',
    ],
  },
  limitations: {
    en: [
      'Requires 3–4 light irrigations (pond/canal/tubewell) and well-drained soil without waterlogging.',
      'Higher seed and input care required; watch for late blight during foggy high-humidity mornings.',
    ],
    hi: [
      'इसके लिए 3–4 हल्की सिंचाई और अच्छी जल निकासी वाली मिट्टी जरूरी है।',
      'कोहरे और अधिक नमी में झुलसा रोग की निगरानी करनी पड़ती है।',
    ],
    bn: [
      '৩–৪ বার হালকা সেচ ও ভালো জল নিকাশি ব্যবস্থা প্রয়োজন।',
      'কুয়াশা ও বেশি আর্দ্রতায় নাবি ধসা রোগের দিকে নজর রাখা দরকার।',
    ],
  },
  whySuggested: (ctx) => {
    const irrWarning =
      ctx.irrigation === 'rainfed'
        ? ctx.lang === 'hi'
          ? 'ध्यान दें: केवल बारिश पर निर्भर खेत में बिना हल्की सिंचाई के यह जोखिम भरा हो सकता है।'
          : ctx.lang === 'bn'
          ? 'সতর্কতা: সম্পূর্ণ বৃষ্টিনির্ভর জমিতে হালকা সেচ ছাড়া এটি ঝুঁকিপূর্ণ হতে পারে।'
          : 'Note: On strictly rainfed plots without light irrigation, prefer Mustard or Pulses instead.'
        : '';
    if (ctx.lang === 'hi') {
      return `तमलुक/पूर्व मेदिनीपुर की जलोढ़ मिट्टी में हल्की सिंचाई होने पर आलू या सब्जियां धान-आधारित चक्र को तोड़ती हैं। ${irrWarning}`;
    }
    if (ctx.lang === 'bn') {
      return `সেচের সুবিধা থাকলে পলি-দোআঁশ জমিতে আলু বা শীতের সবজি ধানের একঘেয়ে চাষ ভাঙতে সাহায্য করে। ${irrWarning}`;
    }
    return `Where light pond or tubewell irrigation and drained loam exist, winter vegetables break paddy monoculture with lower water use than Boro rice. ${irrWarning}`;
  },
};

const OPT_AMAN_PADDY: RotationOption = {
  id: 'aman_paddy',
  title: {
    en: 'Salt/Submergence-Tolerant Aman Paddy (Kharif)',
    hi: 'सहनशील अमन धान (खरीफ)',
    bn: 'সহনশীল আমন ধান (খরিফ)',
  },
  waterDemand: 'high',
  window: {
    en: 'Monsoon Kharif (Jun–Nov, 125–145 days)',
    hi: 'मानसून खरीफ (जून–नवंबर, 125–145 दिन)',
    bn: 'বর্ষাকালীন খরিফ (জুন–নভেম্বর, ১২৫–১৪৫ দিন)',
  },
  image: '/src/assets/images/crop_aman_paddy_1794649964972.jpg',
  benefits: {
    en: [
      'Matches Purba Medinipur’s monsoon rainfall peak cleanly after winter pulses/oilseeds.',
      'Previous legume/pulse crop leaves residual soil nitrogen that supports early tillering.',
    ],
    hi: [
      'रबी दलहन/तिलहन के बाद मानसून की बारिश का सबसे बेहतर उपयोग करती है।',
      'पिछली दलहन फसल से मिट्टी में बची नाइट्रोजन धान की शुरुआती बढ़वार में मदद करती है।',
    ],
    bn: [
      'শীতকালীন ডাল বা সরিষার পর বর্ষার বৃষ্টির সঠিক ব্যবহার করে।',
      'আগের ডালশস্যের অবশিষ্ট নাইট্রোজেন ধানের প্রাথমিক বৃদ্ধিতে সাহায্য করে।',
    ],
  },
  limitations: {
    en: [
      'Coastal basins in Haldia and Contai face cyclone/waterlogging or tidal salinity — consult KVK for local tolerant varieties.',
    ],
    hi: [
      'हल्दिया और कांथी के तटीय क्षेत्रों में जलभराव या खारेपन के अनुसार सहनशील किस्म चुनें।',
    ],
    bn: [
      'হলদিয়া ও কাঁথির উপকূলীয় জমিতে জলমগ্নতা বা লবণাক্ততা সহনশীল জাত বেছে নিন।',
    ],
  },
  whySuggested: (ctx) => {
    if (ctx.lang === 'hi') {
      return `रबी/जायद में सरसों, मूंग या तिल उगाने के बाद मानसून के लिए धान स्वाभाविक अगली कड़ी है (30-दिन बारिश: ${ctx.rain30d ?? '—'} मिमी)।`;
    }
    if (ctx.lang === 'bn') {
      return `রবি বা গ্রীষ্মে সরিষা, মুগ বা তিল চাষের পর বর্ষা মরসুমে আমন ধান স্বাভাবিক পরবর্তী ফসল (৩০ দিনের বৃষ্টি: ${ctx.rain30d ?? '—'} মিমি)।`;
    }
    return `Following winter oilseeds or summer pulses, monsoon Aman paddy completes the annual coastal cycle (recent 30d rain: ${ctx.rain30d ?? '—'} mm).`;
  },
};

export function getRotationOptionsForCrop(cropId: string, irrigation: IrrigationType): RotationOption[] {
  let options: RotationOption[];
  switch (cropId) {
    case 'aman_paddy':
      options = [OPT_MUSTARD, OPT_GREEN_GRAM, OPT_VEGETABLE_POTATO];
      break;
    case 'boro_paddy':
      options = [OPT_GREEN_GRAM, OPT_SESAME, OPT_AMAN_PADDY];
      break;
    case 'mustard':
      options = [OPT_GREEN_GRAM, OPT_SESAME, OPT_AMAN_PADDY];
      break;
    case 'green_gram':
      options = [OPT_AMAN_PADDY, OPT_MUSTARD, OPT_SESAME];
      break;
    case 'potato':
      options = [OPT_GREEN_GRAM, OPT_SESAME, OPT_AMAN_PADDY];
      break;
    case 'sesame':
      options = [OPT_AMAN_PADDY, OPT_MUSTARD, OPT_GREEN_GRAM];
      break;
    default:
      options = [OPT_GREEN_GRAM, OPT_MUSTARD, OPT_SESAME];
  }

  // Prioritize lower-water crops first when rainfed or irrigation is unknown
  if (irrigation === 'rainfed') {
    return [...options].sort((a, b) => {
      const rank = { low: 0, medium: 1, high: 2 };
      return rank[a.waterDemand] - rank[b.waterDemand];
    });
  }
  return options;
}

export function getSeasonalRotationPlan(
  soilType: SoilType,
  irrigation: IrrigationType
): SeasonalPlanStep[] {
  const isSaline = soilType === 'coastal_saline';
  const hasTubewell = irrigation === 'tubewell' || irrigation === 'canal_pond';

  return [
    {
      season: {
        en: 'Kharif (Jun – Nov)',
        hi: 'खरीफ (जून – नवंबर)',
        bn: 'খরিফ (জুন – নভেম্বর)',
      },
      crop: {
        en: isSaline ? 'Salt-Tolerant Aman Paddy' : 'Aman Paddy (Monsoon Rice)',
        hi: isSaline ? 'खारेपन सहनशील अमन धान' : 'अमन धान (खरीफ)',
        bn: isSaline ? 'লবণ-সহনশীল আমন ধান' : 'আমন ধান (বর্ষা)',
      },
      note: {
        en: 'Uses natural monsoon rain; keep bund drainage ready for heavy rain events.',
        hi: 'मानसून की बारिश का उपयोग; भारी बारिश में जल निकासी की व्यवस्था रखें।',
        bn: 'বর্ষার বৃষ্টির ব্যবহার; ভারী বৃষ্টিতে জল নিকাশি ব্যবস্থা রাখুন।',
      },
    },
    {
      season: {
        en: 'Rabi (Nov – Feb)',
        hi: 'रबी (नवंबर – फरवरी)',
        bn: 'রবি (নভেম্বর – ফেব্রুয়ারি)',
      },
      crop: {
        en: hasTubewell ? 'Mustard or Potato / Winter Vegetables' : 'Mustard / Zero-Till Lentil',
        hi: hasTubewell ? 'सरसों या आलू / रबी सब्जियां' : 'सरसों / कम पानी दलहन',
        bn: hasTubewell ? 'সরিষা বা আলু / শীতের সবজি' : 'সরিষা / কম জলের ডাল',
      },
      note: {
        en: 'Captures residual post-monsoon soil moisture immediately after Aman harvest.',
        hi: 'धान कटने के तुरंत बाद बची हुई मिट्टी की नमी का उपयोग करती है।',
        bn: 'আমন ধান কাটার পর মাটিতে থাকা অবশিষ্ট রস কাজে লাগায়।',
      },
    },
    {
      season: {
        en: 'Pre-Kharif / Zaid (Feb – May)',
        hi: 'जायद / गर्मी (फरवरी – मई)',
        bn: 'প্রাক-খরিফ / গ্রীষ্ম (ফেব্রুয়ারি – মে)',
      },
      crop: {
        en: 'Green Gram (Moong) or Sesame (Til)',
        hi: 'मूंग दाल या तिल',
        bn: 'মুগ ডাল অথবা তিল',
      },
      note: {
        en: 'Replenishes nitrogen (Moong) or uses minimal water (Til) before monsoon returns.',
        hi: 'मानसून से पहले मिट्टी में नाइट्रोजन बढ़ाती है (मूंग) या कम पानी में उगती है (तिल)।',
        bn: 'বর্ষার আগে মাটিতে নাইট্রোজেন বাড়ায় (মুগ) বা কম জলে চাষ হয় (তিল)।',
      },
    },
  ];
}
