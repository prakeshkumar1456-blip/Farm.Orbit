import { AlertTriangle, CheckCircle2, Info, MessageSquareText } from 'lucide-react';
import type { Translations } from '../i18n/translations';
import type { LanguageCode, NasaOverviewResponse, RealAlertItem } from '../types/farm';

interface AlertsViewProps {
  language: LanguageCode;
  t: Translations;
  alerts: RealAlertItem[];
  overview: NasaOverviewResponse | null;
  onAskAi: (question: string) => void;
}

function getAlertCopy(
  alert: RealAlertItem,
  lang: LanguageCode
): { title: string; body: string; action: string } {
  const obs = alert.observedNum;
  const base = alert.baselineNum;

  switch (alert.code) {
    case 'RAINFALL_BELOW_AVG':
      if (lang === 'hi') {
        return {
          title: 'बारिश ऐतिहासिक औसत से कम रही है',
          body: `पिछले 14 दिनों में ${obs} मिमी बारिश दर्ज हुई, जबकि इस महीने का 20-साल का औसत ${base} मिमी है।`,
          action: 'खेत में 5 सेमी गहराई की मिट्टी हाथ से दबाकर देखें; सूखी होने पर हल्की सिंचाई या कम पानी वाली फसल की योजना बनाएं।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'বৃষ্টিপাত ঐতিহাসিক গড়ের তুলনায় কম হয়েছে',
          body: `গত ১৪ দিনে ${obs} মিমি বৃষ্টিপাত রেকর্ড হয়েছে, যেখানে এই মাসের ২০ বছরের গড় হলো ${base} মিমি।`,
          action: 'জমির ৫ সেমি নিচের মাটি হাতে পরীক্ষা করে দেখুন; শুষ্ক মনে হলে হালকা সেচ বা কম জলের ফসলের পরিকল্পনা করুন।',
        };
      }
      return {
        title: 'Rainfall is lower than the historical comparison period',
        body: `Past 14-day rainfall was ${obs} mm compared with the 20-year monthly baseline of ${base} mm.`,
        action: 'Check topsoil moisture 5 cm deep by hand before deciding on light irrigation or low-water crops.',
      };

    case 'RAINFALL_ABOVE_AVG':
      if (lang === 'hi') {
        return {
          title: 'हाल की बारिश ऐतिहासिक औसत से अधिक रही है',
          body: `पिछले 14 दिनों में ${obs} मिमी बारिश दर्ज हुई, जबकि इस महीने का 20-साल का औसत ${base} मिमी है।`,
          action: 'पकी हुई अमन धान की कटाई और रबी दलहन/सरसों की बुवाई से पहले खेत से अतिरिक्त पानी निकलने की व्यवस्था जांचें।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'সাম্প্রতিক বৃষ্টিপাত ঐতিহাসিক গড়ের তুলনায় বেশি হয়েছে',
          body: `গত ১৪ দিনে ${obs} মিমি বৃষ্টি রেকর্ড হয়েছে, যেখানে এই মাসের ২০ বছরের গড় ${base} মিমি।`,
          action: 'পাকা আমন ধান কাটা বা রবি ডাল/সরিষা বপনের আগে জমির জল নিকাশি ব্যবস্থা ঠিক আছে কিনা দেখে নিন।',
        };
      }
      return {
        title: 'Recent rainfall is higher than the 20-year seasonal norm',
        body: `Past 14-day rainfall reached ${obs} mm compared with the 20-year monthly baseline of ${base} mm.`,
        action: 'Inspect drainage channels before harvesting mature paddy or sowing winter pulses and oilseeds.',
      };

    case 'HEAVY_RAINFALL':
      if (lang === 'hi') {
        return {
          title: 'तेज बारिश की स्थिति दर्ज की गई',
          body: `पिछले 3 दिनों में एक दिन की बारिश ${obs} मिमी तक पहुंची (सीमा: ${base} मिमी/दिन)।`,
          action: 'सब्जियों और निचले खेतों की मेड़ व जल निकासी नालियां खोलें ताकि पानी जमा न हो।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'ভারী বৃষ্টিপাত পর্যবেক্ষণ করা হয়েছে',
          body: `গত ৩ দিনের মধ্যে একদিনে ${obs} মিমি বৃষ্টি হয়েছে (সতর্ক সীমা: ${base} মিমি/দিন)।`,
          action: 'সবজি ও নিচু জমির আইল ও জল নিকাশি নালা খুলে দিন যাতে জল জমে না থাকে।',
        };
      }
      return {
        title: 'Heavy daily rainfall observed',
        body: `Recent daily precipitation reached ${obs} mm/day (above ${base} mm/day heavy-rain threshold).`,
        action: 'Clear field bunds and drainage outlets, especially around vegetables and pulses.',
      };

    case 'HIGH_LAND_SURFACE_TEMP':
      if (lang === 'hi') {
        return {
          title: 'जमीन की सतह का तापमान अधिक दर्ज हुआ',
          body: `जमीन की सतह का तापमान ${obs} °C तक पहुंचा (मासिक औसत: ${base} °C)।`,
          action: 'गर्मी से मिट्टी की नमी जल्दी उड़ती है; पुआल या सूखी पत्तियों की मल्चिंग और सुबह-शाम सिंचाई करें।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'মাটির পৃষ্ঠের তাপমাত্রা বেশি রেকর্ড হয়েছে',
          body: `মাটির উপরের তাপমাত্রা ${obs} °C-এ পৌঁছেছে (মাসিক গড়: ${base} °C)।`,
          action: 'তাপে মাটি দ্রুত শুকিয়ে যায়; খড় বা শুকনো পাতা দিয়ে মাল্চিং করুন এবং সকালে বা বিকেলে সেচ দিন।',
        };
      }
      return {
        title: 'High land surface temperature observed',
        body: `Earth skin temperature reached ${obs} °C (monthly baseline ${base} °C).`,
        action: 'Apply straw mulching to conserve topsoil moisture and irrigate during early morning or evening.',
      };

    case 'HIGH_TEMP_ANOMALY':
      if (lang === 'hi') {
        return {
          title: 'पिछले 7 दिनों का औसत तापमान सामान्य से अधिक रहा',
          body: `पिछले 7 दिनों का औसत हवा तापमान ${obs} °C रहा, जो 20-साल के मासिक औसत (${base} °C) से अधिक है।`,
          action: 'फसल की पत्तियों में मुरझाने के लक्षण देखें और हल्की नमी बनाए रखें।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'গত ৭ দিনের গড় তাপমাত্রা স্বাভাবিকের চেয়ে বেশি',
          body: `গত ৭ দিনের গড় বাতাসের তাপমাত্রা ${obs} °C, যা ২০ বছরের মাসিক গড়ের (${base} °C) চেয়ে বেশি।`,
          action: 'দুপুরে ফসলের পাতা ঝিমিয়ে পড়ছে কিনা লক্ষ্য রাখুন এবং প্রয়োজনে হালকা আর্দ্রতা বজায় রাখুন।',
        };
      }
      return {
        title: '7-day air temperature is warmer than historical baseline',
        body: `Past 7-day mean air temperature was ${obs} °C compared with the 20-year monthly average of ${base} °C.`,
        action: 'Watch crops for midday wilting and check topsoil moisture before evening.',
      };

    case 'SOIL_MOISTURE_LOW':
      if (lang === 'hi') {
        return {
          title: 'ऊपरी मिट्टी की नमी कम दर्ज हुई है',
          body: `ऊपरी 0–5 सेमी मिट्टी की नमी ${obs}% है (सामान्य संदर्भ: ${base}%)।`,
          action: 'बुवाई से पहले खेत की मिट्टी दबाकर जांचें; जरूरत हो तो हल्की सिंचाई या कम पानी वाली फसल चुनें।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'উপরের মাটির আর্দ্রতা কম দেখা যাচ্ছে',
          body: `উপরের ০–৫ সেমি মাটির আর্দ্রতা ${obs}% (সাধারণ তুলনা: ${base}%)।`,
          action: 'বীজ বপনের আগে মাটি হাতে চেপে পরীক্ষা করুন; শুষ্ক হলে হালকা সেচ দিন বা কম জলের ফসল বাছুন।',
        };
      }
      return {
        title: 'Surface soil moisture indicator is low',
        body: `Topsoil wetness (0–5 cm) is ${obs}% compared with ${base}% monthly reference.`,
        action: 'Verify moisture in the root zone by hand and schedule light pre-sowing irrigation if soil crumbles dry.',
      };

    case 'SOIL_MOISTURE_EXCESS':
      if (lang === 'hi') {
        return {
          title: 'ऊपरी मिट्टी में बहुत अधिक नमी / जलभराव की संभावना',
          body: `ऊपरी 0–5 सेमी मिट्टी की नमी ${obs}% दर्ज हुई (संतृप्त स्तर ≥ ${base}%)।`,
          action: 'यदि आप सरसों, आलू या मूंग बोने की सोच रहे हैं, तो मिट्टी के थोड़ा सूखने (वत्तर आने) तक प्रतीक्षा करें।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'উপরের মাটিতে অতিরিক্ত আর্দ্রতা / জল জমার সম্ভাবনা',
          body: `উপরের ০–৫ সেমি মাটির আর্দ্রতা ${obs}% (উচ্চ সীমা ≥ ${base}%)।`,
          action: 'সরিষা, আলু বা ডাল বপনের আগে জমি জো আসা পর্যন্ত অপেক্ষা করুন এবং নিকাশি নালা পরিষ্কার রাখুন।',
        };
      }
      return {
        title: 'Topsoil wetness is near saturation',
        body: `Surface soil wetness (0–5 cm) reached ${obs}% (saturated watch ≥ ${base}%).`,
        action: 'Hold off sowing moisture-sensitive Rabi crops (mustard, potato, pulses) until excess water drains.',
      };

    case 'SOIL_MOISTURE_DROPPING':
      if (lang === 'hi') {
        return {
          title: 'मिट्टी की नमी पिछले सप्ताह से घट रही है',
          body: `पिछले 7 दिनों में ऊपरी मिट्टी की नमी घटकर ${obs}% हुई (पिछले सप्ताह ${base}% थी)।`,
          action: 'रबी बुवाई के लिए बची हुई नमी बचाने हेतु समय पर हल्की जुताई या पाटा लगाएं।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'গত সপ্তাহের তুলনায় মাটির আর্দ্রতা কমছে',
          body: `গত ৭ দিনে উপরের মাটির আর্দ্রতা কমে ${obs}% হয়েছে (আগের সপ্তাহে ছিল ${base}%)।`,
          action: 'রবি ফসল বপনের জন্য মাটির রস ধরে রাখতে সময়মতো হালকা চাষ বা মই দিন।',
        };
      }
      return {
        title: 'Surface soil moisture is steadily drying',
        body: `7-day average topsoil wetness shifted to ${obs}% from ${base}% in the prior week.`,
        action: 'If planning zero-till or residual-moisture Rabi sowing, sow promptly before topsoil dries further.',
      };

    case 'HIGH_HUMIDITY_PEST_WATCH':
      if (lang === 'hi') {
        return {
          title: 'अधिक नमी के कारण फसल निगरानी की सलाह',
          body: `हवा में नमी ${obs}% दर्ज हुई (चेतावनी स्तर ≥ ${base}%)।`,
          action: 'सुबह के समय पत्तियों के नीचे फफूंद, झुलसा या रस चूसने वाले कीटों की जांच करें।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'উচ্চ আর্দ্রতার কারণে ফসল পর্যবেক্ষণের পরামর্শ',
          body: `বাতাসের আর্দ্রতা ${obs}% রেকর্ড হয়েছে (সতর্ক সীমা ≥ ${base}%)।`,
          action: 'সকালে পাতার নিচে ছত্রাক, ধসা বা পোকার আক্রমণ হয়েছে কিনা দেখে নিন।',
        };
      }
      return {
        title: 'High humidity crop disease watch',
        body: `Relative humidity reached ${obs}% (watch threshold ≥ ${base}%).`,
        action: 'Inspect undersides of leaves during morning walks for fungal spots, blight, or aphids.',
      };

    case 'VEGETATION_CLOUD_GAP':
      if (lang === 'hi') {
        return {
          title: 'बादलों के कारण ताजा ऑप्टिकल फसल चित्र उपलब्ध नहीं',
          body: `ताजा साफ Sentinel-2 उपग्रह पास ${obs} दिन पहले मिला था (${base} दिनों से अधिक अंतर)।`,
          action: 'फसल के रंग और बढ़वार की जांच सीधे खेत में जाकर करें; बादल छंटने पर उपग्रह छवि अपडेट होगी।',
        };
      }
      if (lang === 'bn') {
        return {
          title: 'মেঘের কারণে সাম্প্রতিক পরিষ্কার স্যাটেলাইট ছবি পাওয়া যায়নি',
          body: `সর্বশেষ কম-মেঘযুক্ত Sentinel-2 পাস ${obs} দিন আগের (${base} দিনের বেশি পুরনো)।`,
          action: 'জমিতে সরাসরি গিয়ে ফসলের সবুজ ভাব ও বৃদ্ধি দেখে নিন; আকাশ পরিষ্কার হলে ছবি আপডেট হবে।',
        };
      }
      return {
        title: 'Cloud cover delayed recent optical NDVI satellite checks',
        body: `Latest low-cloud Sentinel-2 optical pass was ${obs} days ago (exceeding ${base} days).`,
        action: 'Inspect leaf greenness and crop stand directly in the field until clear-sky satellite passes resume.',
      };
  }
}

export function AlertsView({ language, t, alerts, overview, onAskAi }: AlertsViewProps) {
  const checkedSources = [
    `NASA POWER (${overview?.nasaPower.latestObservationDate ?? '—'})`,
    'NASA GPM IMERG',
    'NASA SMAP',
    'NASA MODIS NDVI / LST',
    `Open-Meteo (${overview?.openMeteo.observedAt?.slice(0, 10) ?? '—'})`,
  ].join(' · ');

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102617]">
          {t.alerts.title}
        </h1>
        <p className="text-base text-[#445E4A]">{t.alerts.subtitle}</p>
        <p className="text-xs text-[#597460] pt-1">{t.alerts.futureNote}</p>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white border border-[#DCE7DC] rounded-2xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-10 h-10 text-[#15803D] mx-auto" />
          <h2 className="font-display text-xl font-bold text-[#102617]">
            {t.alerts.noAlertsTitle}
          </h2>
          <p className="text-sm sm:text-base text-[#4A6450] max-w-xl mx-auto">
            {t.alerts.noAlertsDesc}
          </p>
          <div className="pt-3 border-t border-[#EDF3ED] max-w-2xl mx-auto text-xs text-[#546E5A] space-y-1">
            <div>
              <span className="font-semibold text-[#1E3B26]">{t.alerts.latestObsLabel}:</span>{' '}
              <span className="tabular-nums">
                {overview?.nasaPower.latestObservationDate ?? '—'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-[#1E3B26]">{t.alerts.checkedSourcesLabel}:</span>{' '}
              {checkedSources}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {alerts.map((alert) => {
            const copy = getAlertCopy(alert, language);
            const isAttention = alert.severity === 'attention';
            const isAdvisory = alert.severity === 'advisory';

            const severityLabel = isAttention
              ? t.alerts.severityAttention
              : isAdvisory
              ? t.alerts.severityAdvisory
              : t.alerts.severityInfo;

            const severityColor = isAttention
              ? 'text-[#B91C1C]'
              : isAdvisory
              ? 'text-[#B45309]'
              : 'text-[#15803D]';

            const Icon = isAttention || isAdvisory ? AlertTriangle : Info;

            const prompt =
              language === 'hi'
                ? `${alert.locationLabel} में "${copy.title}" (${alert.observedNum} ${alert.unit}, तारीख ${alert.observationDate}) की चेतावनी पर मुझे अपने खेत में क्या जांच करनी चाहिए?`
                : language === 'bn'
                ? `${alert.locationLabel}-এ "${copy.title}" (${alert.observedNum} ${alert.unit}, তারিখ ${alert.observationDate}) সতর্কবার্তার জন্য জমিতে কী পরীক্ষা করা উচিত?`
                : `Regarding the alert "${copy.title}" (${alert.observedNum} ${alert.unit} on ${alert.observationDate}) in ${alert.locationLabel}, what should I inspect in my field?`;

            return (
              <article
                key={alert.id}
                className="bg-white border border-[#DCE7DC] rounded-xl p-6 flex flex-col justify-between gap-5"
              >
                <div className="space-y-3">
                  <div className={`flex items-center gap-2 text-sm font-bold ${severityColor}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{severityLabel}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold text-[#102617]">{copy.title}</h2>
                  <p className="text-sm sm:text-base text-[#35503B] leading-relaxed">{copy.body}</p>
                  <div className="p-3 rounded-lg bg-[#F5FAF5] border border-[#DCE7DC] text-sm text-[#1D3E25]">
                    <span className="font-bold">{t.alerts.recommendedAction}: </span>
                    <span>{copy.action}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#EDF3ED]">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#546E5A]">
                    <div>
                      <dt className="font-semibold text-[#2E4935]">{t.alerts.affectedArea}</dt>
                      <dd>{alert.locationLabel}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#2E4935]">{t.alerts.observedDate}</dt>
                      <dd className="tabular-nums">{alert.observationDate}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="font-semibold text-[#2E4935]">{t.alerts.dataSource}</dt>
                      <dd>
                        {alert.sourceName} · {alert.spatialResolution}
                      </dd>
                    </div>
                  </dl>

                  <button
                    type="button"
                    onClick={() => onAskAi(prompt)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#15803D] text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <MessageSquareText className="w-4 h-4" />
                    <span>{t.alerts.askAiAlertBtn}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
