import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { LanguageCode, NasaOverviewResponse } from '../types/farm';

interface DataSourcesViewProps {
  language: LanguageCode;
  t: Translations;
  overview: NasaOverviewResponse | null;
}

export function DataSourcesView({ language, t, overview }: DataSourcesViewProps) {
  const smapMeta = overview?.nasaMissions.find((m) => m.shortName === 'SPL3SMP_E');
  const gpmMeta = overview?.nasaMissions.find((m) => m.shortName === 'GPM_3IMERGDF');
  const ecostressMeta = overview?.nasaMissions.find((m) => m.shortName === 'ECO_L2T_LSTE');

  const rows = [
    {
      name: 'NASA POWER (Agroclimatology)',
      url: 'https://power.larc.nasa.gov/docs/',
      measures:
        language === 'hi'
          ? 'हवा तापमान (2 मी), बारिश (PRECTOTCORR), नमी, सतही और जड़ मिट्टी नमी (GWETTOP/GWETROOT), सौर ऊर्जा, सतह तापमान (TS)'
          : language === 'bn'
          ? 'বাতাসের তাপমাত্রা (২ মিটার), বৃষ্টিপাত (PRECTOTCORR), আর্দ্রতা, উপরের ও শিকড় মাটির রস (GWETTOP/GWETROOT), সূর্যালোক ও ভূমি তাপমাত্রা (TS)'
          : 'Air temperature (2m), corrected rainfall, humidity, surface & root-zone soil wetness, solar radiation, land skin temperature',
      resolution: '0.5° × 0.625° (~55 km)',
      latestDate: overview?.nasaPower.latestObservationDate ?? t.sources.liveApiLabel,
      limitation:
        language === 'hi'
          ? 'यह ~55 किमी के क्षेत्र का औसत है और डेटा में 2–4 दिन का अंतर रहता है; यह किसी एक खेत का सेंसर नहीं है।'
          : language === 'bn'
          ? 'এটি ~৫৫ কিমি গ্রিডের গড় মান এবং ২–৪ দিন পেছনে আপডেট হয়; একটি নির্দিষ্ট প্লটের মাটির সেন্সর নয়।'
          : 'Regional ~55 km grid average with a 2–4 day satellite processing lag; does not capture single-plot irrigation differences.',
    },
    {
      name: 'NASA GPM IMERG (GIBS & CMR)',
      url: 'https://gpm.nasa.gov/data/directory',
      measures:
        language === 'hi'
          ? 'उपग्रह आधारित वर्षा परत (मानचित्र) और दैनिक वर्षा ग्रैन्यूल'
          : language === 'bn'
          ? 'স্যাটেলাইট-ভিত্তিক বৃষ্টিপাতের মানচিত্র স্তর ও দৈনিক গ্র্যানিউল'
          : 'Satellite precipitation rate map overlay (NASA GIBS) & daily IMERG granule metadata',
      resolution: '0.1° (~10 km)',
      latestDate: gpmMeta?.latestDate ?? t.sources.gibsCompositeLabel,
      limitation:
        language === 'hi'
          ? 'तेज स्थानीय आंधी-बारिश 10 किमी ग्रिड में अलग दिख सकती है।'
          : language === 'bn'
          ? 'হঠাৎ স্থানীয় বৃষ্টি ১০ কিমি গ্রিডে কিছুটা গড় হয়ে যেতে পারে।'
          : 'Short localized coastal showers can vary inside a 10 km satellite pixel.',
    },
    {
      name: 'NASA SMAP (GIBS & CMR)',
      url: 'https://nsidc.org/data/smap',
      measures:
        language === 'hi'
          ? 'ऊपरी मिट्टी की नमी की उपग्रह परत (मानचित्र)'
          : language === 'bn'
          ? 'উপরের মাটির আর্দ্রতার স্যাটেলাইট মানচিত্র স্তর'
          : 'Surface soil moisture L4 map overlay & radiometer pass dates',
      resolution: '9 km',
      latestDate: smapMeta?.latestDate ?? t.sources.gibsCompositeLabel,
      limitation:
        language === 'hi'
          ? 'सिर्फ ऊपरी ~5 सेमी मिट्टी मापता है; घनी फसल या खड़े पानी वाले धान में सटीकता कम होती है।'
          : language === 'bn'
          ? 'শুধু উপরের ~৫ সেমি মাটি মাপে; ঘন ফসল বা জলমগ্ন ধানের জমিতে সংকেত প্রভাবিত হতে পারে।'
          : 'Measures top ~5 cm only; accuracy drops over flooded rice paddies or very dense canopies.',
    },
    {
      name: 'NASA MODIS Terra NDVI & LST (GIBS)',
      url: 'https://gibs.earthdata.nasa.gov/',
      measures:
        language === 'hi'
          ? '8-दिन फसल हरियाली सूचकांक (NDVI) और दिन की जमीन सतह गर्मी (LST)'
          : language === 'bn'
          ? '৮-দিনের ফসল সবুজ সূচক (NDVI) এবং দিনের ভূমি পৃষ্ঠের তাপমাত্রা (LST)'
          : '8-day vegetation greenness (NDVI) & daytime land surface temperature map overlays',
      resolution: '250 m (NDVI) / 1 km (LST)',
      latestDate: t.sources.rolling8DayLabel,
      limitation:
        language === 'hi'
          ? 'मानसून के घने बादलों में ऑप्टिकल NDVI और LST की परतें बाधित होती हैं।'
          : language === 'bn'
          ? 'বর্ষার ঘন মেঘ থাকলে অপটিক্যাল NDVI ও LST পর্যবেক্ষণ বাধাগ্রস্ত হয়।'
          : 'Cloud cover during Bengal monsoon obstructs optical NDVI & thermal LST retrievals.',
    },
    {
      name: 'NASA ECOSTRESS (CMR)',
      url: 'https://ecostress.jpl.nasa.gov/data',
      measures:
        language === 'hi'
          ? 'जमीन की सतह का तापमान और वाष्पीकरण (70 मी ग्रैन्यूल मेटाडेटा)'
          : language === 'bn'
          ? 'ভূমি পৃষ্ঠের তাপমাত্রা ও বাষ্পীভবন (৭০ মিটার গ্র্যানিউল মেটাডেটা)'
          : 'High-resolution land surface temperature & evapotranspiration pass timestamps',
      resolution: '70 m',
      latestDate: ecostressMeta?.latestDate ?? t.sources.cmrCheckedLabel,
      limitation:
        language === 'hi'
          ? 'ISS कक्षा के कारण रोज एक ही समय पर नहीं गुजरता; पूरा पिक्सेल डेटा डाउनलोड के लिए Earthdata लॉगिन चाहिए।'
          : language === 'bn'
          ? 'ISS কক্ষপথের কারণে প্রতিদিন একই সময়ে পাস হয় না; সরাসরি পিক্সেল ডাউনলোডে Earthdata লগইন লাগে।'
          : 'Irregular ISS overpass intervals; raw GeoTIFF pixel extraction requires authenticated Earthdata download.',
    },
    {
      name: 'ESA Copernicus Sentinel-2 L2A',
      url: 'https://earth-search.aws.element84.com/v1',
      measures:
        language === 'hi'
          ? 'ताजा कम-बादल वाला उपग्रह चित्र, पास तारीख और बादल प्रतिशत'
          : language === 'bn'
          ? 'সর্বশেষ কম-মেঘযুক্ত স্যাটেলাইট ছবি, তারিখ ও মেঘের শতাংশ'
          : 'Latest low-cloud optical pass date, cloud percentage, MGRS tile & preview image',
      resolution: '10 m – 20 m',
      latestDate: overview?.sentinel2.datetime
        ? overview.sentinel2.datetime.slice(0, 10)
        : t.sources.liveApiLabel,
      limitation:
        language === 'hi'
          ? 'तटीय बादल के दिनों में साफ पास मिलने में 5–15 दिन लग सकते हैं।'
          : language === 'bn'
          ? 'উপকূলীয় মেঘলা আবহাওয়ায় পরিষ্কার ছবি পেতে ৫–১৫ দিন লাগতে পারে।'
          : 'Optical sensor cannot see through clouds; clear scenes depend on weather.',
    },
    {
      name: 'Open-Meteo (ERA5-Land + SRTM DEM)',
      url: 'https://open-meteo.com/',
      measures:
        language === 'hi'
          ? 'ताजा मौसम, 0–1 सेमी और 1–3 सेमी मिट्टी नमी, ET0 वाष्पीकरण और जमीन की ऊंचाई (SRTM)'
          : language === 'bn'
          ? 'বর্তমান আবহাওয়া, ০–১ সেমি ও ১–৩ সেমি মাটির আর্দ্রতা, ET0 ও ভূমির উচ্চতা (SRTM)'
          : 'Current weather, hourly soil moisture (0–1 cm, 1–3 cm), FAO ET0, and terrain elevation',
      resolution: '~9–11 km / 90 m DEM',
      latestDate: overview?.openMeteo.observedAt
        ? overview.openMeteo.observedAt.slice(0, 16).replace('T', ' ')
        : t.sources.hourlyLabel,
      limitation:
        language === 'hi'
          ? 'मॉडल आधारित क्षेत्रीय अनुमान — खेत में सिंचाई के तुरंत बाद की नमी अलग हो सकती है।'
          : language === 'bn'
          ? 'মডেল-ভিত্তিক আঞ্চলিক অনুমান — জমিতে সেচ দেওয়ার পরের বাস্তব অবস্থা ভিন্ন হতে পারে।'
          : 'Modelled regional soil estimate — does not reflect recent manual irrigation in one field.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102617]">
          {t.sources.title}
        </h1>
        <p className="text-base text-[#445E4A]">{t.sources.subtitle}</p>

        <div className="bg-[#EEF7EE] border border-[#C6DEC6] rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
          <p className="text-sm text-[#173A21] leading-relaxed">{t.sources.truthBanner}</p>
        </div>
      </div>

      <div className="bg-white border border-[#DCE7DC] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F9F4] border-b border-[#DCE7DC] text-xs font-bold text-[#25442D]">
                <th className="py-3.5 px-4">{t.sources.colSource}</th>
                <th className="py-3.5 px-4">{t.sources.colMeasures}</th>
                <th className="py-3.5 px-4">{t.sources.colResolution}</th>
                <th className="py-3.5 px-4">{t.sources.colLatestDate}</th>
                <th className="py-3.5 px-4">{t.sources.colLimitations}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF3ED] text-sm text-[#243E2B]">
              {rows.map((row) => (
                <tr key={row.name} className="hover:bg-[#FAFCFA]">
                  <td className="py-4 px-4 font-semibold text-[#102617] align-top whitespace-nowrap">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#15803D] hover:underline"
                    >
                      <span>{row.name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                  <td className="py-4 px-4 align-top min-w-[220px]">{row.measures}</td>
                  <td className="py-4 px-4 align-top tabular-nums whitespace-nowrap">
                    {row.resolution}
                  </td>
                  <td className="py-4 px-4 align-top tabular-nums whitespace-nowrap">
                    {row.latestDate}
                  </td>
                  <td className="py-4 px-4 align-top min-w-[240px] text-[#4C6452]">
                    {row.limitation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
