import heroImage from '../assets/images/hero_bengal_farmland_1794649965184.jpg';
import {
  ArrowRight,
  Bell,
  CloudRain,
  Droplets,
  Leaf,
  MapPin,
  MessageSquareText,
  RefreshCw,
  Search,
  Sprout,
  ThermometerSun,
} from 'lucide-react';

import { useState } from 'react';
import { TARGET_REGIONS } from '../data/agronomy';
import type { NavTab, Translations } from '../i18n/translations';
import type { FarmProfile, LanguageCode, NasaOverviewResponse } from '../types/farm';

interface HomeViewProps {
  language: LanguageCode;
  t: Translations;
  selectedLabel: string;
  selectedLat: number;
  selectedLon: number;
  savedFarms: FarmProfile[];
  activeFarmId: number | null;
  overview: NasaOverviewResponse | null;
  loading: boolean;
  onSelectLocation: (label: string, lat: number, lon: number, farmId?: number | null) => void;
  onNavigate: (tab: NavTab) => void;
  onAskAiWithTopic: (question: string) => void;
}

interface SearchResult {
  name: string;
  lat: number;
  lon: number;
}

export function HomeView({
  language,
  t,
  selectedLabel,
  selectedLat,
  selectedLon,
  savedFarms,
  activeFarmId,
  overview,
  loading,
  onSelectLocation,
  onNavigate,
  onAskAiWithTopic,
}: HomeViewProps) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchedOnce, setSearchedOnce] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setSearchedOnce(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
      const data = (await res.json()) as { results?: SearchResult[] };
      setResults(data.results ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const regionName = (r: (typeof TARGET_REGIONS)[number]) =>
    language === 'hi' ? r.nameHi : language === 'bn' ? r.nameBn : r.name;

  const latest = overview?.nasaPower.latest;
  const currentTemp = overview?.openMeteo.currentTempC ?? latest?.t2m ?? null;
  const humidity = overview?.openMeteo.currentHumidityPct ?? latest?.humidityPct ?? null;
  const rain30 = overview?.nasaPower.past30DaysRainfallMm ?? null;
  const rain14 = overview?.nasaPower.past14DaysRainfallMm ?? null;
  const soilWetnessPct =
    latest?.surfaceSoilWetness !== null && latest?.surfaceSoilWetness !== undefined
      ? Math.round(latest.surfaceSoilWetness * 100)
      : null;
  const smVolumetric = overview?.openMeteo.soilMoisture0to1cm ?? null;

  // Fallback hero image used when a project asset is not supplied.
  const heroImage =
    'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80';

  const explainPrompt = (topic: 'weather' | 'rainfall' | 'soil' | 'vegetation') => {
    if (language === 'hi') {
      if (topic === 'weather') return `${selectedLabel} के लिए अभी का तापमान और मौसम मेरी फसल के लिए कैसा है?`;
      if (topic === 'rainfall') return `${selectedLabel} में पिछले 30 दिनों की बारिश सामान्य से कैसी रही है?`;
      if (topic === 'soil') return `${selectedLabel} में मिट्टी की नमी की स्थिति को आसान भाषा में समझाएं।`;
      return `${selectedLabel} में उपग्रह हरियाली (NDVI) और ताजा Sentinel-2 जानकारी का क्या मतलब है?`;
    }
    if (language === 'bn') {
      if (topic === 'weather') return `${selectedLabel}-এ বর্তমান তাপমাত্রা ও আবহাওয়া আমার ফসলের জন্য কেমন?`;
      if (topic === 'rainfall') return `${selectedLabel}-এ গত ৩০ দিনের বৃষ্টিপাত স্বাভাবিকের তুলনায় কেমন?`;
      if (topic === 'soil') return `${selectedLabel}-এ মাটির আর্দ্রতার অবস্থা সহজ ভাষায় বুঝিয়ে বলুন।`;
      return `${selectedLabel}-এ স্যাটেলাইট সবুজ সূচক (NDVI) এবং Sentinel-2 তথ্যের অর্থ কী?`;
    }
    if (topic === 'weather') return `Is the current temperature and weather in ${selectedLabel} suitable for farming right now?`;
    if (topic === 'rainfall') return `How does the recent 30-day rainfall in ${selectedLabel} compare to normal historical rainfall?`;
    if (topic === 'soil') return `Please explain the soil moisture condition in ${selectedLabel} in simple everyday words.`;
    return `What do the MODIS NDVI map and latest Sentinel-2 pass tell us about crop vegetation in ${selectedLabel}?`;
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="bg-white border border-[#DCE7DC] rounded-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-sm font-semibold text-[#15803D]">
                {t.brandName} · {t.tagline}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#102617] leading-tight text-balance">
                {t.home.welcomeTitle}
              </h1>
              <p className="text-base sm:text-lg text-[#3B5542] leading-relaxed max-w-2xl">
                {t.home.welcomeSubtitle}
              </p>
            </div>

            {/* Primary Big Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate('ai')}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-base sm:text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <MessageSquareText className="w-5 h-5" />
                <span>{t.home.askAiButton}</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="inline-flex items-center gap-3 px-6 py-4 rounded-xl bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#102617] border border-[#C7DEC7] text-base sm:text-lg font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Sprout className="w-5 h-5 text-[#15803D]" />
                <span>{t.home.viewFarmButton}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[260px] lg:min-h-full bg-[#E8F2E8]">
            <img
              src={heroImage}
              alt={t.regionFooter}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
          </div>
        </div>

        {/* Location Selection Strip */}
        <div className="border-t border-[#DCE7DC] bg-[#F8FBF8] p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#1E3B26]">
              <MapPin className="w-4 h-4 text-[#15803D]" />
              <span>{t.home.selectLocationLabel}:</span>
              <span className="text-[#15803D] font-bold">{selectedLabel}</span>
              <span className="text-xs font-mono tabular-nums text-[#54705B]">
                ({selectedLat.toFixed(4)}, {selectedLon.toFixed(4)})
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('map')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:underline cursor-pointer whitespace-nowrap"
            >
              <span>{t.home.useCoordinates}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Target Regions + Saved Farms */}
          <div className="flex flex-wrap items-center gap-2.5">
            {TARGET_REGIONS.map((region) => {
              const isSelected =
                !activeFarmId &&
                Math.abs(selectedLat - region.lat) < 0.01 &&
                Math.abs(selectedLon - region.lon) < 0.01;
              return (
                <button
                  key={region.id}
                  type="button"
                  onClick={() => onSelectLocation(regionName(region), region.lat, region.lon, null)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${isSelected
                      ? 'bg-[#15803D] text-white border-[#15803D]'
                      : 'bg-white text-[#1D3924] border-[#CADACA] hover:bg-[#ECF5EC]'
                    }`}
                >
                  {regionName(region)}
                </button>
              );
            })}

            {savedFarms.map((farm) => {
              const isSelected = activeFarmId === farm.id;
              return (
                <button
                  key={farm.id}
                  type="button"
                  onClick={() => onSelectLocation(farm.name, farm.latitude, farm.longitude, farm.id)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${isSelected
                      ? 'bg-[#15803D] text-white border-[#15803D]'
                      : 'bg-white text-[#1D3924] border-[#CADACA] hover:bg-[#ECF5EC]'
                    }`}
                >
                  {farm.name} ({farm.cropName})
                </button>
              );
            })}
          </div>

          {/* Village / Town Search */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5A7561] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#CADACA] text-sm sm:text-base text-[#102617] placeholder:text-[#6B8571] focus:outline-2 focus:outline-[#15803D]"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2.5 rounded-lg bg-[#1E3B26] hover:bg-[#102617] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              {searching ? t.common.loading : t.home.searchButton}
            </button>
          </form>

          {results.length > 0 && (
            <div className="bg-white border border-[#DCE7DC] rounded-xl divide-y divide-[#EDF3ED] max-w-2xl">
              {results.map((r, idx) => (
                <button
                  key={`${r.lat}-${r.lon}-${idx}`}
                  type="button"
                  onClick={() => {
                    const shortName = r.name.split(',').slice(0, 2).join(', ');
                    onSelectLocation(shortName, r.lat, r.lon, null);
                    setResults([]);
                    setSearchedOnce(false);
                    setQuery('');
                  }}
                  className="w-full px-4 py-2.5 text-left hover:bg-[#F3F9F3] flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-medium text-[#102617] truncate">{r.name}</span>
                  <span className="text-xs font-mono tabular-nums text-[#56715D] shrink-0">
                    {r.lat.toFixed(3)}, {r.lon.toFixed(3)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {searchedOnce && !searching && results.length === 0 && (
            <p className="text-xs text-[#54705B]">{t.home.noSearchResults}</p>
          )}
        </div>
      </section>

      {/* 4-Card Area Environmental Snapshot */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#102617]">
              {t.home.quickOverviewTitle}
            </h2>
            <p className="text-sm text-[#4B6652] mt-1 max-w-3xl">{t.home.quickOverviewNote}</p>
          </div>
          {loading && (
            <span className="inline-flex items-center gap-2 text-sm text-[#15803D] font-medium">
              <RefreshCw className="w-4 h-4 animate-spin" />
              {t.home.loadingData}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* Card 1: Weather */}
          <article className="bg-white border border-[#DCE7DC] rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#15803D]">
                <span className="text-sm font-semibold text-[#314F39]">
                  {t.home.weatherCardTitle}
                </span>
                <ThermometerSun className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold tabular-nums text-[#102617]">
                {currentTemp !== null ? `${currentTemp} °C` : t.home.unavailable}
              </div>
              <p className="text-sm text-[#3E5845]">
                {humidity !== null ? `${t.dashboard.humidityLabel}: ${humidity}%` : '—'}
              </p>
            </div>
            <div className="pt-3 border-t border-[#EDF3ED] space-y-2.5">
              <p className="text-xs text-[#5A7460]">
                {t.home.observedOn}:{' '}
                {overview?.openMeteo.observedAt?.slice(0, 16).replace('T', ' ') ??
                  overview?.nasaPower.latestObservationDate ??
                  '—'}{' '}
                · {t.home.areaEstimateNote}
              </p>
              <button
                type="button"
                onClick={() => onAskAiWithTopic(explainPrompt('weather'))}
                className="w-full py-2 px-3 rounded-lg bg-[#F1F8F1] hover:bg-[#E1F0E1] text-[#15803D] text-sm font-semibold transition-colors cursor-pointer"
              >
                {t.home.explainBtn}
              </button>
            </div>
          </article>

          {/* Card 2: Rainfall */}
          <article className="bg-white border border-[#DCE7DC] rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#15803D]">
                <span className="text-sm font-semibold text-[#314F39]">
                  {t.home.rainfallCardTitle}
                </span>
                <CloudRain className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold tabular-nums text-[#102617]">
                {rain30 !== null ? `${rain30} ${t.common.mmUnit}` : t.home.unavailable}
              </div>
              <p className="text-sm text-[#3E5845] tabular-nums">
                {t.common.days30} · {t.common.days14}:{' '}
                {rain14 !== null ? `${rain14} ${t.common.mmUnit}` : '—'}
              </p>
            </div>
            <div className="pt-3 border-t border-[#EDF3ED] space-y-2.5">
              <p className="text-xs text-[#5A7460]">
                {t.home.sourcePrefix}: NASA POWER · {overview?.nasaPower.latestObservationDate ?? '—'}
              </p>
              <button
                type="button"
                onClick={() => onAskAiWithTopic(explainPrompt('rainfall'))}
                className="w-full py-2 px-3 rounded-lg bg-[#F1F8F1] hover:bg-[#E1F0E1] text-[#15803D] text-sm font-semibold transition-colors cursor-pointer"
              >
                {t.home.explainBtn}
              </button>
            </div>
          </article>

          {/* Card 3: Soil Moisture */}
          <article className="bg-white border border-[#DCE7DC] rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#15803D]">
                <span className="text-sm font-semibold text-[#314F39]">
                  {t.home.soilCardTitle}
                </span>
                <Droplets className="w-5 h-5" />
              </div>
              <div className="text-3xl font-bold tabular-nums text-[#102617]">
                {soilWetnessPct !== null ? `${soilWetnessPct}%` : t.home.unavailable}
              </div>
              <p className="text-sm text-[#3E5845] tabular-nums">
                {t.dashboard.surfaceWetnessDesc}
                {smVolumetric !== null ? ` · ${smVolumetric} m³/m³` : ''}
              </p>
            </div>
            <div className="pt-3 border-t border-[#EDF3ED] space-y-2.5">
              <p className="text-xs text-[#5A7460]">
                {t.home.sourcePrefix}: NASA GWETTOP · {overview?.nasaPower.latestObservationDate ?? '—'}
              </p>
              <button
                type="button"
                onClick={() => onAskAiWithTopic(explainPrompt('soil'))}
                className="w-full py-2 px-3 rounded-lg bg-[#F1F8F1] hover:bg-[#E1F0E1] text-[#15803D] text-sm font-semibold transition-colors cursor-pointer"
              >
                {t.home.explainBtn}
              </button>
            </div>
          </article>

          {/* Card 4: Vegetation & Crop Check */}
          <article className="bg-white border border-[#DCE7DC] rounded-xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[#15803D]">
                <span className="text-sm font-semibold text-[#314F39]">
                  {t.home.vegetationCardTitle}
                </span>
                <Leaf className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold tabular-nums text-[#102617]">
                {overview?.sentinel2.available && overview.sentinel2.datetime
                  ? overview.sentinel2.datetime.slice(0, 10)
                  : t.home.modisMapFallback}
              </div>
              <p className="text-sm text-[#3E5845] tabular-nums">
                {overview?.sentinel2.available
                  ? `Sentinel-2 · ${t.dashboard.cloudCover}: ${overview.sentinel2.cloudCoverPct ?? '—'}%`
                  : t.home.modisMapFallback}
              </p>
            </div>
            <div className="pt-3 border-t border-[#EDF3ED] space-y-2.5">
              <p className="text-xs text-[#5A7460]">
                {t.home.sourcePrefix}: {t.home.sentinelModisSource}
              </p>
              <button
                type="button"
                onClick={() => onAskAiWithTopic(explainPrompt('vegetation'))}
                className="w-full py-2 px-3 rounded-lg bg-[#F1F8F1] hover:bg-[#E1F0E1] text-[#15803D] text-sm font-semibold transition-colors cursor-pointer"
              >
                {t.home.explainBtn}
              </button>
            </div>
          </article>
        </div>
      </section>

      {/* 3 Practical Tools Row */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#102617]">{t.home.toolsTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <button
            type="button"
            onClick={() => onNavigate('rotation')}
            className="text-left bg-white hover:bg-[#F7FBF7] border border-[#DCE7DC] rounded-xl p-6 space-y-3 transition-colors cursor-pointer"
          >
            <Sprout className="w-6 h-6 text-[#15803D]" />
            <h3 className="font-display text-lg font-bold text-[#102617]">
              {t.home.toolRotationTitle}
            </h3>
            <p className="text-sm text-[#435E4A] leading-relaxed">{t.home.toolRotationDesc}</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('map')}
            className="text-left bg-white hover:bg-[#F7FBF7] border border-[#DCE7DC] rounded-xl p-6 space-y-3 transition-colors cursor-pointer"
          >
            <MapPin className="w-6 h-6 text-[#15803D]" />
            <h3 className="font-display text-lg font-bold text-[#102617]">
              {t.home.toolMapTitle}
            </h3>
            <p className="text-sm text-[#435E4A] leading-relaxed">{t.home.toolMapDesc}</p>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('alerts')}
            className="text-left bg-white hover:bg-[#F7FBF7] border border-[#DCE7DC] rounded-xl p-6 space-y-3 transition-colors cursor-pointer"
          >
            <Bell className="w-6 h-6 text-[#15803D]" />
            <h3 className="font-display text-lg font-bold text-[#102617]">
              {t.home.toolAlertsTitle}
            </h3>
            <p className="text-sm text-[#435E4A] leading-relaxed">
              {t.home.toolAlertsDesc}
              {overview && overview.alerts.length > 0 ? ` (${overview.alerts.length})` : ''}
            </p>
          </button>
        </div>
      </section>
    </div>
  );
}
