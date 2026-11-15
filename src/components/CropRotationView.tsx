import { AlertCircle, Calendar, Check, Droplets, Info, MessageSquareText, Sprout } from 'lucide-react';
import { useState } from 'react';
import {
  CROP_OPTIONS,
  getRotationOptionsForCrop,
  getSeasonalRotationPlan,
} from '../data/agronomy';
import type { Translations } from '../i18n/translations';
import type {
  IrrigationType,
  LanguageCode,
  NasaOverviewResponse,
  SoilType,
} from '../types/farm';

interface CropRotationViewProps {
  language: LanguageCode;
  t: Translations;
  selectedLabel: string;
  currentCropId: string;
  onChangeCropId: (id: string) => void;
  overview: NasaOverviewResponse | null;
  onAskAi: (question: string) => void;
}

export function CropRotationView({
  language,
  t,
  selectedLabel,
  currentCropId,
  onChangeCropId,
  overview,
  onAskAi,
}: CropRotationViewProps) {
  const [soilType, setSoilType] = useState<SoilType>('unknown');
  const [irrigation, setIrrigation] = useState<IrrigationType>('unknown');

  const options = getRotationOptionsForCrop(currentCropId, irrigation);
  const planSteps = getSeasonalRotationPlan(soilType, irrigation);

  const latest = overview?.nasaPower.latest;
  const soilWetPct =
    latest?.surfaceSoilWetness !== null && latest?.surfaceSoilWetness !== undefined
      ? Math.round(latest.surfaceSoilWetness * 100)
      : null;
  const rain30 = overview?.nasaPower.past30DaysRainfallMm ?? null;
  const temp = latest?.t2m ?? overview?.openMeteo.currentTempC ?? null;
  const humidity = latest?.humidityPct ?? overview?.openMeteo.currentHumidityPct ?? null;

  const selectedCropLabel =
    CROP_OPTIONS.find((c) => c.id === currentCropId)?.[language] ?? CROP_OPTIONS[0][language];

  const waterLabel = (demand: 'low' | 'medium' | 'high') => {
    if (demand === 'low') return t.rotation.lowWater;
    if (demand === 'medium') return t.rotation.mediumWater;
    return t.rotation.highWater;
  };

  const hasMissingInfo = soilType === 'unknown' || irrigation === 'unknown';

  return (
    <div className="space-y-6">
      {/* Header & Honest Disclaimer */}
      <div className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
        <div className="space-y-1.5">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102617]">
            {t.rotation.title}
          </h1>
          <p className="text-base text-[#445E4A]">{t.rotation.subtitle}</p>
        </div>

        <div className="bg-[#FBF8EC] border border-[#E9DFB8] rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#92400E] shrink-0 mt-0.5" />
          <p className="text-sm text-[#5C3D0E] leading-relaxed">{t.rotation.disclaimerBanner}</p>
        </div>

        {/* Crop, Soil, Irrigation, Location Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label
              htmlFor="rotation-crop-select"
              className="block text-sm font-semibold text-[#233E2A] mb-1.5"
            >
              {t.rotation.currentCropLabel}
            </label>
            <select
              id="rotation-crop-select"
              value={currentCropId}
              onChange={(e) => onChangeCropId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#C6D8C6] bg-white text-sm text-[#102617] focus:outline-2 focus:outline-[#15803D]"
            >
              {CROP_OPTIONS.map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {crop[language]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rotation-soil-select"
              className="block text-sm font-semibold text-[#233E2A] mb-1.5"
            >
              {t.rotation.soilTypeLabel}
            </label>
            <select
              id="rotation-soil-select"
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as SoilType)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#C6D8C6] bg-white text-sm text-[#102617] focus:outline-2 focus:outline-[#15803D]"
            >
              {(Object.keys(t.rotation.soilOptions) as SoilType[]).map((key) => (
                <option key={key} value={key}>
                  {t.rotation.soilOptions[key]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="rotation-irrigation-select"
              className="block text-sm font-semibold text-[#233E2A] mb-1.5"
            >
              {t.rotation.irrigationLabel}
            </label>
            <select
              id="rotation-irrigation-select"
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value as IrrigationType)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#C6D8C6] bg-white text-sm text-[#102617] focus:outline-2 focus:outline-[#15803D]"
            >
              {(Object.keys(t.rotation.irrigationOptions) as IrrigationType[]).map((key) => (
                <option key={key} value={key}>
                  {t.rotation.irrigationOptions[key]}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#F6FAF6] border border-[#DCE7DC] rounded-xl px-4 py-2.5 flex flex-col justify-center">
            <span className="text-xs font-semibold text-[#506B56]">{t.rotation.locationLabel}</span>
            <span className="text-sm sm:text-base font-bold text-[#102617] truncate">
              {selectedLabel}
            </span>
          </div>
        </div>

        {hasMissingInfo && (
          <div className="bg-[#F4F9F4] border border-[#DCE7DC] rounded-xl p-3.5 flex items-start gap-2.5 text-xs sm:text-sm text-[#2E4D36]">
            <Info className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
            <span>{t.rotation.missingAssumptionNotice}</span>
          </div>
        )}
      </div>

      {/* Real Environmental Data Used */}
      <section className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold text-[#102617]">
            {t.rotation.currentConditionsTitle}
          </h2>
          <span className="text-xs text-[#54705B]">
            NASA POWER · {overview?.nasaPower.latestObservationDate ?? '—'}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#F7FBF7] border border-[#E2ECE2]">
            <div className="text-xs text-[#536D59]">{t.dashboard.rainfallLabel}</div>
            <div className="text-2xl font-bold tabular-nums text-[#102617] mt-1">
              {rain30 !== null ? `${rain30} ${t.common.mmUnit}` : '—'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#F7FBF7] border border-[#E2ECE2]">
            <div className="text-xs text-[#536D59]">{t.dashboard.soilMoistureLabel}</div>
            <div className="text-2xl font-bold tabular-nums text-[#102617] mt-1">
              {soilWetPct !== null ? `${soilWetPct}%` : '—'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#F7FBF7] border border-[#E2ECE2]">
            <div className="text-xs text-[#536D59]">{t.dashboard.tempLabel}</div>
            <div className="text-2xl font-bold tabular-nums text-[#102617] mt-1">
              {temp !== null ? `${temp} °C` : '—'}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#F7FBF7] border border-[#E2ECE2]">
            <div className="text-xs text-[#536D59]">{t.dashboard.humidityLabel}</div>
            <div className="text-2xl font-bold tabular-nums text-[#102617] mt-1">
              {humidity !== null ? `${humidity}%` : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* Exploratory Rotation Scenarios */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-bold text-[#102617]">
          {t.rotation.optionsTitle}
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {options.map((opt) => {
            const title = opt.title[language];
            const prompt =
              language === 'hi'
                ? `${selectedLabel} में ${selectedCropLabel} के बाद "${title}" लगाने के फायदे, पानी की जरूरत (${t.rotation.soilOptions[soilType]}, ${t.rotation.irrigationOptions[irrigation]}) और सावधानियां आसान भाषा में समझाएं।`
                : language === 'bn'
                ? `${selectedLabel}-এ ${selectedCropLabel}-এর পরে "${title}" চাষের সুবিধা, জলের প্রয়োজন (${t.rotation.soilOptions[soilType]}, ${t.rotation.irrigationOptions[irrigation]}) এবং সতর্কতা সহজ বাংলায় বুঝিয়ে দিন।`
                : `In ${selectedLabel}, after ${selectedCropLabel} (Soil: ${t.rotation.soilOptions[soilType]}, Irrigation: ${t.rotation.irrigationOptions[irrigation]}), please explain the pros, water needs, and limitations of rotating to ${title}.`;

            return (
              <article
                key={opt.id}
                className="bg-white border border-[#DCE7DC] rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 bg-[#E6EFE6] relative">
                    <img
                      src={opt.image}
                      alt={title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#15803D]">
                        {t.rotation.exploratoryTag} · {t.rotation.seasonFitLabel}: {opt.window[language]}
                      </p>
                      <h3 className="font-display text-xl font-bold text-[#102617]">{title}</h3>
                    </div>

                    <div className="flex items-center gap-2 text-sm font-semibold text-[#284730]">
                      <Droplets className="w-4 h-4 text-[#15803D]" />
                      <span>
                        {t.rotation.waterNeedLabel}: {waterLabel(opt.waterDemand)}
                      </span>
                    </div>

                    <div className="text-sm text-[#2E4B35] bg-[#F5FAF5] p-3 rounded-lg border border-[#E1EDE1] space-y-1">
                      <div className="text-xs font-bold text-[#15803D]">
                        {t.rotation.whySuggestedLabel}
                      </div>
                      <p>
                        {opt.whySuggested({
                          locationLabel: selectedLabel,
                          soilType,
                          irrigation,
                          soilWetnessPct: soilWetPct,
                          rain30d: rain30,
                          tempC: temp,
                          lang: language,
                        })}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-[#1B3A24] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#15803D]" />
                        {t.rotation.benefitsLabel}
                      </h4>
                      <ul className="space-y-1 text-sm text-[#395540]">
                        {opt.benefits[language].map((b, i) => (
                          <li key={i} className="leading-snug">
                            • {b}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-[#7C2D12] flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5 text-[#B45309]" />
                        {t.rotation.limitationsLabel}
                      </h4>
                      <ul className="space-y-1 text-sm text-[#574534]">
                        {opt.limitations[language].map((lim, i) => (
                          <li key={i} className="leading-snug">
                            • {lim}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => onAskAi(prompt)}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <MessageSquareText className="w-4 h-4" />
                    <span>{t.rotation.askAiRotationBtn}</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3-Season Crop Rotation Plan */}
      <section className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="font-display text-xl font-bold text-[#102617] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#15803D]" />
            <span>{t.rotation.planTitle}</span>
          </h2>
          <p className="text-sm text-[#445E4A]">{t.rotation.planSubtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {planSteps.map((step, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[#F7FBF7] border border-[#DCE7DC] space-y-2"
            >
              <div className="text-xs font-bold text-[#15803D]">{step.season[language]}</div>
              <div className="font-display text-lg font-bold text-[#102617]">
                {step.crop[language]}
              </div>
              <p className="text-sm text-[#3E5845] leading-relaxed">{step.note[language]}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-xs text-[#54705B] flex items-center gap-2">
        <Sprout className="w-4 h-4 text-[#15803D]" />
        <span>
          {t.rotation.dataUsedLabel}: NASA POWER
          {overview?.nasaPower.latestObservationDate ? ` · ${overview.nasaPower.latestObservationDate}` : ''}
        </span>
      </div>
    </div>
  );
}
