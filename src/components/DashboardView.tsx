import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {
  CloudRain,
  Download,
  Droplets,
  FileText,
  Gauge,
  Leaf,
  MessageSquareText,
  Mountain,
  Plus,
  Sun,
  Thermometer,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { CROP_OPTIONS } from '../data/agronomy';
import type { Translations } from '../i18n/translations';
import type {
  CompareLocationItem,
  FarmProfile,
  LanguageCode,
  NasaHistoryResponse,
  NasaOverviewResponse,
} from '../types/farm';
import { computePolygonArea, pointsToGeojsonFeature } from '../utils/geojson';
import { downloadFarmCsv, downloadFarmPdf } from '../utils/reportExport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardViewProps {
  language: LanguageCode;
  t: Translations;
  selectedLabel: string;
  selectedLat: number;
  selectedLon: number;
  savedFarms: FarmProfile[];
  activeFarm: FarmProfile | null;
  drawnBoundary: [number, number][];
  overview: NasaOverviewResponse | null;
  loading: boolean;
  onSelectFarm: (farm: FarmProfile) => void;
  onSaveFarm: (payload: {
    id?: number;
    name: string;
    locationLabel: string;
    latitude: number;
    longitude: number;
    cropName: string;
    season: string;
    areaAcres: number;
    boundaryGeojson: string | null;
    notes: string;
  }) => Promise<void>;
  onDeleteFarm: (id: number) => Promise<void>;
  onAskAi: (question: string) => void;
}

export function DashboardView({
  language,
  t,
  selectedLabel,
  selectedLat,
  selectedLon,
  savedFarms,
  activeFarm,
  drawnBoundary,
  overview,
  loading,
  onSelectFarm,
  onSaveFarm,
  onDeleteFarm,
  onAskAi,
}: DashboardViewProps) {
  const [history, setHistory] = useState<NasaHistoryResponse | null>(null);
  const [compareItems, setCompareItems] = useState<CompareLocationItem[]>([]);

  // Farm form state
  const [editingId, setEditingId] = useState<number | undefined>(activeFarm?.id);
  const [farmName, setFarmName] = useState(activeFarm?.name ?? '');
  const [locationInput, setLocationInput] = useState(activeFarm?.locationLabel ?? selectedLabel);
  const [cropInput, setCropInput] = useState(activeFarm?.cropName ?? CROP_OPTIONS[0].en);
  const [seasonInput, setSeasonInput] = useState(activeFarm?.season ?? 'Kharif');
  const [acresInput, setAcresInput] = useState(activeFarm ? String(activeFarm.areaAcres) : '1.5');
  const [latInput, setLatInput] = useState(String(activeFarm?.latitude ?? selectedLat));
  const [lonInput, setLonInput] = useState(String(activeFarm?.longitude ?? selectedLon));
  const [notesInput, setNotesInput] = useState(activeFarm?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (activeFarm) {
      setEditingId(activeFarm.id);
      setFarmName(activeFarm.name);
      setLocationInput(activeFarm.locationLabel);
      setCropInput(activeFarm.cropName);
      setSeasonInput(activeFarm.season);
      setAcresInput(String(activeFarm.areaAcres));
      setLatInput(String(activeFarm.latitude));
      setLonInput(String(activeFarm.longitude));
      setNotesInput(activeFarm.notes);
    } else {
      setEditingId(undefined);
      setLocationInput(selectedLabel);
      setLatInput(selectedLat.toFixed(4));
      setLonInput(selectedLon.toFixed(4));
    }
  }, [activeFarm, selectedLabel, selectedLat, selectedLon]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/nasa/history?lat=${selectedLat}&lon=${selectedLon}`)
      .then((r) => r.json())
      .then((d: NasaHistoryResponse) => {
        if (!cancelled) setHistory(d);
      })
      .catch(() => {});

    fetch(
      `/api/nasa/compare?lat=${selectedLat}&lon=${selectedLon}&name=${encodeURIComponent(selectedLabel)}`
    )
      .then((r) => r.json())
      .then((d: { locations?: CompareLocationItem[] }) => {
        if (!cancelled) setCompareItems(d.locations ?? []);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedLat, selectedLon, selectedLabel]);

  const handleSubmitFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmName.trim()) return;
    setSaving(true);
    setSaveFeedback(null);
    try {
      const boundaryStr =
        drawnBoundary.length >= 3
          ? pointsToGeojsonFeature(drawnBoundary)
          : activeFarm?.boundaryGeojson ?? null;
      await onSaveFarm({
        id: editingId,
        name: farmName.trim(),
        locationLabel: locationInput.trim() || selectedLabel,
        latitude: Number(latInput),
        longitude: Number(lonInput),
        cropName: cropInput,
        season: seasonInput,
        areaAcres: Number(acresInput) || 1.0,
        boundaryGeojson: boundaryStr,
        notes: notesInput,
      });
      setSaveFeedback({ type: 'success', text: t.dashboard.saveSuccessMsg });
    } catch {
      setSaveFeedback({ type: 'error', text: t.dashboard.saveErrorMsg });
    } finally {
      setSaving(false);
    }
  };

  const resetForNewFarm = () => {
    setEditingId(undefined);
    setFarmName('');
    setLocationInput(selectedLabel);
    setLatInput(selectedLat.toFixed(4));
    setLonInput(selectedLon.toFixed(4));
    setNotesInput('');
    setSaveFeedback(null);
  };

  const localizeCropName = (cropEn: string) => {
    const match = CROP_OPTIONS.find((c) => c.en.toLowerCase() === cropEn.toLowerCase());
    return match ? match[language] : cropEn;
  };

  const latest = overview?.nasaPower.latest;
  const dailySeries = overview?.nasaPower.dailySeries ?? [];
  const latestSolarPoint = [...dailySeries].reverse().find((d) => d.solarRadiation !== null);
  const clim = overview?.nasaPower.currentMonthClimatology;

  let rainSummaryText = '';
  if (
    overview?.nasaPower.past14DaysRainfallMm !== null &&
    overview?.nasaPower.past14DaysRainfallMm !== undefined &&
    clim?.rainfallMmPerDay
  ) {
    const norm14 = clim.rainfallMmPerDay * 14;
    if (overview.nasaPower.past14DaysRainfallMm < norm14 * 0.75) {
      rainSummaryText = t.dashboard.rainComparisonBelow;
    } else if (overview.nasaPower.past14DaysRainfallMm > norm14 * 1.25) {
      rainSummaryText = t.dashboard.rainComparisonAbove;
    } else {
      rainSummaryText = t.dashboard.rainComparisonNormal;
    }
  }

  const rainTempChartData = {
    labels: dailySeries.map((d) => d.date.slice(5)),
    datasets: [
      {
        type: 'bar' as const,
        label: t.dashboard.chartLegendRain,
        data: dailySeries.map((d) => d.rainfallMm ?? 0),
        backgroundColor: 'rgba(37, 99, 235, 0.55)',
        borderRadius: 4,
        yAxisID: 'yRain',
      },
      {
        type: 'line' as const,
        label: t.dashboard.chartLegendMaxTemp,
        data: dailySeries.map((d) => d.t2mMax),
        borderColor: '#D97706',
        backgroundColor: '#D97706',
        tension: 0.3,
        pointRadius: 2,
        yAxisID: 'yTemp',
      },
      {
        type: 'line' as const,
        label: t.dashboard.chartLegendMinTemp,
        data: dailySeries.map((d) => d.t2mMin),
        borderColor: '#15803D',
        backgroundColor: '#15803D',
        tension: 0.3,
        pointRadius: 2,
        yAxisID: 'yTemp',
      },
    ],
  };

  const soilChartData = {
    labels: dailySeries.map((d) => d.date.slice(5)),
    datasets: [
      {
        label: `${t.dashboard.surfaceWetnessDesc} (%)`,
        data: dailySeries.map((d) =>
          d.surfaceSoilWetness !== null ? Math.round(d.surfaceSoilWetness * 100) : null
        ),
        borderColor: '#0284C7',
        backgroundColor: 'rgba(2, 132, 199, 0.12)',
        fill: true,
        tension: 0.3,
      },
      {
        label: `${t.dashboard.rootWetnessDesc} (%)`,
        data: dailySeries.map((d) =>
          d.rootSoilWetness !== null ? Math.round(d.rootSoilWetness * 100) : null
        ),
        borderColor: '#15803D',
        backgroundColor: 'rgba(21, 128, 61, 0.08)',
        fill: false,
        tension: 0.3,
      },
    ],
  };

  const annualSummary = history?.annualSummary ?? [];
  const historyChartData = {
    labels: annualSummary.map((a) => String(a.year)),
    datasets: [
      {
        label: t.dashboard.chartLegendAnnualRain,
        data: annualSummary.map((a) => a.totalEstRainfallMm),
        backgroundColor: 'rgba(21, 128, 61, 0.72)',
        borderRadius: 6,
        yAxisID: 'yRain',
      },
      {
        label: t.dashboard.chartLegendMeanTemp,
        data: annualSummary.map((a) => a.avgTempC),
        backgroundColor: 'rgba(217, 119, 6, 0.75)',
        borderRadius: 6,
        yAxisID: 'yTemp',
      },
    ],
  };

  const askCard = (topicLabel: string, valueStr: string) => {
    const q =
      language === 'hi'
        ? `${selectedLabel} के लिए ${topicLabel} (${valueStr}) का मेरे खेत और फसल के लिए क्या मतलब है?`
        : language === 'bn'
        ? `${selectedLabel}-এর জন্য ${topicLabel} (${valueStr}) আমার ফসলের জন্য কী অর্থ বহন করে?`
        : `For ${selectedLabel}, what does "${topicLabel}: ${valueStr}" mean for my crops and what are its limits?`;
    onAskAi(q);
  };

  const cards = [
    {
      title: t.dashboard.tempLabel,
      value: latest?.t2m !== null && latest?.t2m !== undefined ? `${latest.t2m} °C` : '—',
      sub:
        latest?.t2mMax !== null && latest?.t2mMin !== null && latest
          ? `${t.dashboard.highShort} ${latest.t2mMax}°C · ${t.dashboard.lowShort} ${latest.t2mMin}°C`
          : 'NASA POWER 2m',
      source: `NASA POWER · ${overview?.nasaPower.latestObservationDate ?? '—'}`,
      icon: Thermometer,
    },
    {
      title: t.dashboard.rainfallLabel,
      value:
        overview?.nasaPower.past30DaysRainfallMm !== null &&
        overview?.nasaPower.past30DaysRainfallMm !== undefined
          ? `${overview.nasaPower.past30DaysRainfallMm} ${t.common.mmUnit}`
          : '—',
      sub:
        overview?.nasaPower.past14DaysRainfallMm !== null
          ? `${t.common.days14}: ${overview?.nasaPower.past14DaysRainfallMm} ${t.common.mmUnit}`
          : 'PRECTOTCORR',
      source: `NASA POWER GPM · ${overview?.nasaPower.latestObservationDate ?? '—'}`,
      icon: CloudRain,
    },
    {
      title: t.dashboard.humidityLabel,
      value:
        latest?.humidityPct !== null && latest?.humidityPct !== undefined
          ? `${latest.humidityPct}%`
          : '—',
      sub:
        overview?.openMeteo.currentHumidityPct !== null
          ? `${t.dashboard.currentModelLabel}: ${overview?.openMeteo.currentHumidityPct}%`
          : 'RH2M',
      source: `NASA POWER · ${overview?.nasaPower.latestObservationDate ?? '—'}`,
      icon: Gauge,
    },
    {
      title: t.dashboard.soilMoistureLabel,
      value:
        latest?.surfaceSoilWetness !== null && latest?.surfaceSoilWetness !== undefined
          ? `${Math.round(latest.surfaceSoilWetness * 100)}%`
          : '—',
      sub:
        overview?.openMeteo.soilMoisture0to1cm !== null
          ? `0–1 cm: ${overview?.openMeteo.soilMoisture0to1cm} m³/m³`
          : t.dashboard.surfaceWetnessDesc,
      source: `NASA GWETTOP & ERA5 · ${overview?.nasaPower.latestObservationDate ?? '—'}`,
      icon: Droplets,
    },
    {
      title: t.dashboard.landSkinTempLabel,
      value:
        latest?.landSkinTempC !== null && latest?.landSkinTempC !== undefined
          ? `${latest.landSkinTempC} °C`
          : '—',
      sub:
        overview?.openMeteo.soilTemp0cmC !== null
          ? `${t.dashboard.topsoil0cmLabel}: ${overview?.openMeteo.soilTemp0cmC} °C`
          : 'TS',
      source: `NASA POWER TS · ${overview?.nasaPower.latestObservationDate ?? '—'}`,
      icon: Thermometer,
    },
    {
      title: t.dashboard.solarLabel,
      value:
        latestSolarPoint?.solarRadiation !== null && latestSolarPoint?.solarRadiation !== undefined
          ? `${latestSolarPoint.solarRadiation} MJ/m²`
          : '—',
      sub:
        overview?.openMeteo.et0TodayMm !== null
          ? `${t.dashboard.et0Label}: ${overview?.openMeteo.et0TodayMm} ${t.common.mmUnit}`
          : 'CERES',
      source: `NASA POWER CERES · ${latestSolarPoint?.date ?? overview?.nasaPower.latestObservationDate ?? '—'}`,
      icon: Sun,
    },
    {
      title: t.dashboard.elevationLabel,
      value:
        overview?.coordinates.elevationM !== null && overview?.coordinates.elevationM !== undefined
          ? `${overview.coordinates.elevationM} ${t.common.meters}`
          : '—',
      sub: 'SRTM / Copernicus DEM',
      source: 'Copernicus / SRTM DEM',
      icon: Mountain,
    },
  ];

  const boundaryArea = drawnBoundary.length >= 3 ? computePolygonArea(drawnBoundary) : null;

  return (
    <div className="space-y-8">
      {/* Header + Export Buttons */}
      <div className="bg-white border border-[#DCE7DC] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102617]">
            {t.dashboard.title}
          </h1>
          <p className="text-sm sm:text-base text-[#445E4A] mt-1">
            {t.dashboard.subtitle}{' '}
            <span className="font-semibold text-[#15803D]">({selectedLabel})</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!overview}
            onClick={() => overview && downloadFarmPdf(selectedLabel, overview, activeFarm, language)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <FileText className="w-4 h-4" />
            <span>{t.dashboard.downloadPdfBtn}</span>
          </button>

          <button
            type="button"
            disabled={!overview}
            onClick={() => overview && downloadFarmCsv(selectedLabel, overview, activeFarm)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#15803D] border border-[#C6DEC6] text-sm font-semibold cursor-pointer disabled:opacity-50 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{t.dashboard.downloadCsvBtn}</span>
          </button>
        </div>
      </div>

      {/* My Farm Profile Manager (SQLite) */}
      <section className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-bold text-[#102617]">
            {t.dashboard.farmProfileTitle}
          </h2>
          <button
            type="button"
            onClick={resetForNewFarm}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#15803D] text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dashboard.addNewFarm}</span>
          </button>
        </div>

        {/* Saved farms list */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-[#445E4A]">{t.dashboard.savedFarmsLabel}</div>
          {savedFarms.length === 0 ? (
            <p className="text-sm text-[#5A7561]">{t.dashboard.noSavedFarms}</p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {savedFarms.map((farm) => {
                const isSelected = activeFarm?.id === farm.id;
                return (
                  <div
                    key={farm.id}
                    className={`inline-flex items-center rounded-lg border text-sm font-semibold ${
                      isSelected
                        ? 'bg-[#15803D] text-white border-[#15803D]'
                        : 'bg-[#F8FBF8] text-[#1E3B26] border-[#C8D9C8]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectFarm(farm)}
                      className="px-3.5 py-2 cursor-pointer"
                    >
                      {farm.name} · {localizeCropName(farm.cropName)} ({farm.areaAcres}{' '}
                      {t.common.acresShort})
                    </button>
                    <button
                      type="button"
                      aria-label={`${t.dashboard.deleteFarmBtn} ${farm.name}`}
                      onClick={() => void onDeleteFarm(farm.id)}
                      className={`px-2 py-2 border-l cursor-pointer ${
                        isSelected
                          ? 'border-white/25 hover:bg-white/15 text-white'
                          : 'border-[#DCE7DC] hover:bg-[#FEE2E2] text-[#991B1B]'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmitFarm} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#304D37] mb-1">
              {t.dashboard.farmNameLabel}
            </label>
            <input
              type="text"
              required
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder={t.dashboard.farmNamePlaceholder}
              className="w-full px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304D37] mb-1">
              {t.dashboard.locationLabel}
            </label>
            <input
              type="text"
              required
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304D37] mb-1">
              {t.dashboard.cropLabel}
            </label>
            <select
              value={cropInput}
              onChange={(e) => setCropInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm bg-white"
            >
              {CROP_OPTIONS.map((c) => (
                <option key={c.id} value={c.en}>
                  {c[language]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[#304D37] mb-1">
                {t.dashboard.seasonLabel}
              </label>
              <select
                value={seasonInput}
                onChange={(e) => setSeasonInput(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[#C8D9C8] text-sm bg-white"
              >
                <option value="Kharif">{t.dashboard.seasonKharif}</option>
                <option value="Rabi">{t.dashboard.seasonRabi}</option>
                <option value="Zaid">{t.dashboard.seasonZaid}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#304D37] mb-1">
                {t.dashboard.areaAcresLabel}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={acresInput}
                onChange={(e) => setAcresInput(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-[#C8D9C8] text-sm tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304D37] mb-1">
              {t.dashboard.latLabel}
            </label>
            <input
              type="number"
              step="0.0001"
              value={latInput}
              onChange={(e) => setLatInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#304D37] mb-1">
              {t.dashboard.lonLabel}
            </label>
            <input
              type="number"
              step="0.0001"
              value={lonInput}
              onChange={(e) => setLonInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm font-mono tabular-nums"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#304D37] mb-1">
              {t.dashboard.notesLabel}
            </label>
            <input
              type="text"
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-[#54705B]">
              {boundaryArea
                ? `${t.dashboard.boundarySavedText} (${drawnBoundary.length} ${t.dashboard.pointsLabel} · ${boundaryArea.hectares} ${t.common.hectaresShort} / ${boundaryArea.acres} ${t.common.acresShort})`
                : activeFarm?.boundaryGeojson
                ? `${t.dashboard.boundarySavedText} (${t.dashboard.savedTag})`
                : t.dashboard.drawOnMapHint}
            </p>
            <div className="flex items-center gap-3">
              {saveFeedback && (
                <span
                  className={`text-sm font-semibold ${
                    saveFeedback.type === 'success' ? 'text-[#15803D]' : 'text-[#B91C1C]'
                  }`}
                >
                  {saveFeedback.text}
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {editingId ? t.dashboard.updateFarmBtn : t.dashboard.saveFarmBtn}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="bg-white border border-[#DCE7DC] rounded-xl p-5 flex flex-col justify-between gap-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#445E4A]">
                  <span>{card.title}</span>
                  <Icon className="w-4 h-4 text-[#15803D]" />
                </div>
                <div className="text-2xl font-bold tabular-nums text-[#102617]">
                  {loading ? '...' : card.value}
                </div>
                <div className="text-xs text-[#4F6B56] tabular-nums">{card.sub}</div>
              </div>
              <div className="pt-2.5 border-t border-[#EDF3ED] space-y-2">
                <div className="text-[11px] text-[#647E6B]">{card.source}</div>
                <button
                  type="button"
                  onClick={() => askCard(card.title, card.value)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] hover:underline cursor-pointer"
                >
                  <MessageSquareText className="w-3.5 h-3.5" />
                  <span>{t.dashboard.askAiAboutCard}</span>
                </button>
              </div>
            </article>
          );
        })}

        {/* Card 8: ESA Sentinel-2 + MODIS NDVI Vegetation Pass */}
        <article className="bg-white border border-[#DCE7DC] rounded-xl p-5 flex flex-col justify-between gap-3">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#445E4A]">
              <span>{t.dashboard.vegetationLabel}</span>
              <Leaf className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-xl font-bold tabular-nums text-[#102617]">
              {overview?.sentinel2.available && overview.sentinel2.datetime
                ? overview.sentinel2.datetime.slice(0, 10)
                : t.home.modisMapFallback}
            </div>
            <div className="text-xs text-[#4F6B56] tabular-nums">
              {overview?.sentinel2.available
                ? `${t.dashboard.cloudCover}: ${overview.sentinel2.cloudCoverPct ?? '—'}% · ${t.dashboard.tileLabel} ${overview.sentinel2.mgrsTile ?? ''}`
                : t.home.modisMapFallback}
            </div>
          </div>
          <div className="pt-2.5 border-t border-[#EDF3ED] space-y-2">
            <div className="text-[11px] text-[#647E6B]">{t.home.sentinelModisSource}</div>
            <button
              type="button"
              onClick={() =>
                askCard(
                  t.dashboard.vegetationLabel,
                  overview?.sentinel2.datetime?.slice(0, 10) ?? t.home.modisMapFallback
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] hover:underline cursor-pointer"
            >
              <MessageSquareText className="w-3.5 h-3.5" />
              <span>{t.dashboard.askAiAboutCard}</span>
            </button>
          </div>
        </article>
      </section>

      {/* Plain-Language Rainfall & Water Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#102617]">
                {t.dashboard.chartRainTempTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A6450] mt-1">{t.dashboard.chartRainTempDesc}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                askCard(
                  t.dashboard.chartRainTempTitle,
                  `${overview?.nasaPower.past30DaysRainfallMm ?? '—'} ${t.common.mmUnit}`
                )
              }
              className="text-xs font-semibold text-[#15803D] hover:underline shrink-0 cursor-pointer"
            >
              {t.dashboard.askAiAboutCard}
            </button>
          </div>

          {rainSummaryText && (
            <p className="text-sm font-medium text-[#1D4027] bg-[#F3F9F3] p-3 rounded-lg border border-[#DCE7DC]">
              {rainSummaryText}
            </p>
          )}

          <div className="h-64">
            <Bar
              data={rainTempChartData as never}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  yRain: {
                    position: 'left',
                    beginAtZero: true,
                    title: { display: true, text: t.common.mmUnit },
                  },
                  yTemp: {
                    position: 'right',
                    grid: { drawOnChartArea: false },
                    title: { display: true, text: '°C' },
                  },
                },
              }}
            />
          </div>
        </section>

        <section className="bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#102617]">
                {t.dashboard.chartWaterTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A6450] mt-1">{t.dashboard.chartWaterDesc}</p>
            </div>
            <button
              type="button"
              onClick={() =>
                askCard(
                  t.dashboard.chartWaterTitle,
                  `${latest?.surfaceSoilWetness !== null && latest?.surfaceSoilWetness !== undefined ? Math.round(latest.surfaceSoilWetness * 100) : '—'}%`
                )
              }
              className="text-xs font-semibold text-[#15803D] hover:underline shrink-0 cursor-pointer"
            >
              {t.dashboard.askAiAboutCard}
            </button>
          </div>

          <div className="h-72">
            <Line
              data={soilChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: 0,
                    max: 100,
                    title: { display: true, text: t.dashboard.chartAxisWetness },
                  },
                },
              }}
            />
          </div>
        </section>
      </div>

      {/* Historical Multi-Year Comparison + Sentinel-2 Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-7 bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#102617]">
                {t.dashboard.chartHistoryTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A6450] mt-1">{t.dashboard.chartHistoryDesc}</p>
            </div>
            <button
              type="button"
              onClick={() => askCard(t.dashboard.chartHistoryTitle, '2021–2025')}
              className="text-xs font-semibold text-[#15803D] hover:underline shrink-0 cursor-pointer"
            >
              {t.dashboard.askAiAboutCard}
            </button>
          </div>

          <div className="h-64">
            {history?.available ? (
              <Bar
                data={historyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    yRain: {
                      position: 'left',
                      beginAtZero: true,
                      title: { display: true, text: t.common.mmPerYr },
                    },
                    yTemp: {
                      position: 'right',
                      grid: { drawOnChartArea: false },
                      title: { display: true, text: '°C' },
                    },
                  },
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-[#5A7561]">
                {t.common.loading}
              </div>
            )}
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-[#DCE7DC] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-bold text-[#102617]">
            {t.dashboard.sentinelTitle}
          </h2>
          {overview?.sentinel2.available && overview.sentinel2.thumbnailUrl ? (
            <div className="space-y-3">
              <div className="rounded-xl overflow-hidden border border-[#DCE7DC] bg-[#102617] h-44">
                <img
                  src={overview.sentinel2.thumbnailUrl}
                  alt={overview.sentinel2.sceneId ?? 'Sentinel-2'}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs text-[#445E4A] space-y-1 tabular-nums">
                <div>
                  <span className="font-semibold text-[#102617]">{t.dashboard.passDateLabel}:</span>{' '}
                  {overview.sentinel2.datetime?.slice(0, 10)} · {overview.sentinel2.platform}
                </div>
                <div>
                  <span className="font-semibold text-[#102617]">{t.dashboard.cloudCover}:</span>{' '}
                  {overview.sentinel2.cloudCoverPct}% · {t.dashboard.tileLabel}{' '}
                  {overview.sentinel2.mgrsTile}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-[#F6FAF6] border border-[#DCE7DC] text-sm text-[#4A6450]">
              {t.dashboard.sentinelEmpty}
            </div>
          )}
        </section>
      </div>

      {/* Compare Locations Table */}
      <section className="bg-white border border-[#DCE7DC] rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-[#E3ECE3]">
          <h2 className="font-display text-lg font-bold text-[#102617]">
            {t.dashboard.compareTitle}
          </h2>
          <p className="text-xs sm:text-sm text-[#4A6450] mt-1">{t.dashboard.compareSubtitle}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F9F4] border-b border-[#DCE7DC] text-xs font-bold text-[#25442D]">
                <th className="py-3 px-4">{t.rotation.locationLabel}</th>
                <th className="py-3 px-4 text-right">{t.dashboard.tempLabel}</th>
                <th className="py-3 px-4 text-right">{t.dashboard.landSkinTempLabel}</th>
                <th className="py-3 px-4 text-right">{t.dashboard.rainfallLabel}</th>
                <th className="py-3 px-4 text-right">{t.dashboard.soilMoistureLabel}</th>
                <th className="py-3 px-4 text-right">{t.dashboard.humidityLabel}</th>
                <th className="py-3 px-4 text-right">{t.dashboard.elevationLabel}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF3ED] text-sm tabular-nums">
              {compareItems.map((item) => (
                <tr key={item.id} className="hover:bg-[#FAFCFA]">
                  <td className="py-3 px-4 font-semibold text-[#102617]">{item.name}</td>
                  <td className="py-3 px-4 text-right">
                    {item.tempC !== null ? `${item.tempC} °C` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.landSkinTempC !== null ? `${item.landSkinTempC} °C` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.past30DaysRainfallMm !== null
                      ? `${item.past30DaysRainfallMm} ${t.common.mmUnit}`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.surfaceSoilWetness !== null
                      ? `${Math.round(item.surfaceSoilWetness * 100)}%`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.humidityPct !== null ? `${item.humidityPct}%` : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {item.elevationM !== null ? `${item.elevationM} ${t.common.meters}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
