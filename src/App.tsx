import { useCallback, useEffect, useMemo, useState } from 'react';
import { AiAssistantView } from './components/AiAssistantView';
import { AlertsView } from './components/AlertsView';
import { CropRotationView } from './components/CropRotationView';
import { DashboardView } from './components/DashboardView';
import { DataSourcesView } from './components/DataSourcesView';
import { HomeView } from './components/HomeView';
import { MapView } from './components/MapView';
import { Navbar } from './components/Navbar';
import { CROP_OPTIONS, TARGET_REGIONS } from './data/agronomy';
import { TRANSLATIONS, type NavTab } from './i18n/translations';
import type { AiChatMessage, FarmProfile, LanguageCode, NasaOverviewResponse } from './types/farm';
import { parseGeojsonToPoints, pointsToGeojsonFeature } from './utils/geojson';

const STORAGE_KEYS = {
  lang: 'farmorbit_lang',
  location: 'farmorbit_location',
  farmId: 'farmorbit_active_farm_id',
};

function readInitialLanguage(): LanguageCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.lang);
    if (saved === 'en' || saved === 'hi' || saved === 'bn') return saved;
  } catch {
    // Ignore storage access errors
  }
  return 'en';
}

function readInitialLocation(): { label: string; lat: number; lon: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.location);
    if (raw) {
      const parsed = JSON.parse(raw) as { label?: string; lat?: number; lon?: number };
      if (
        parsed.label &&
        typeof parsed.lat === 'number' &&
        typeof parsed.lon === 'number' &&
        Number.isFinite(parsed.lat) &&
        Number.isFinite(parsed.lon)
      ) {
        return { label: parsed.label, lat: parsed.lat, lon: parsed.lon };
      }
    }
  } catch {
    // Ignore storage access errors
  }
  return {
    label: TARGET_REGIONS[0].name,
    lat: TARGET_REGIONS[0].lat,
    lon: TARGET_REGIONS[0].lon,
  };
}

function readInitialFarmId(): number | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.farmId);
    if (raw) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    // Ignore storage access errors
  }
  return null;
}

export default function App() {
  const initialLoc = useMemo(() => readInitialLocation(), []);

  const [language, setLanguage] = useState<LanguageCode>(readInitialLanguage);
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  const [selectedLabel, setSelectedLabel] = useState<string>(initialLoc.label);
  const [selectedLat, setSelectedLat] = useState<number>(initialLoc.lat);
  const [selectedLon, setSelectedLon] = useState<number>(initialLoc.lon);

  const [savedFarms, setSavedFarms] = useState<FarmProfile[]>([]);
  const [activeFarmId, setActiveFarmId] = useState<number | null>(readInitialFarmId);
  const [drawnBoundary, setDrawnBoundary] = useState<[number, number][]>([]);
  const [currentCropId, setCurrentCropId] = useState<string>('aman_paddy');

  const [overview, setOverview] = useState<NasaOverviewResponse | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([]);
  const [pendingAiPrompt, setPendingAiPrompt] = useState<string | null>(null);

  const t = TRANSLATIONS[language];

  // Persist language choice and sync HTML lang attribute
  const handleChangeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.lang, lang);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Persist active location & farmId
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.location,
        JSON.stringify({ label: selectedLabel, lat: selectedLat, lon: selectedLon })
      );
      if (activeFarmId !== null) {
        localStorage.setItem(STORAGE_KEYS.farmId, String(activeFarmId));
      } else {
        localStorage.removeItem(STORAGE_KEYS.farmId);
      }
    } catch {
      // Ignore
    }
  }, [selectedLabel, selectedLat, selectedLon, activeFarmId]);

  const activeFarm = useMemo(
    () => savedFarms.find((f) => f.id === activeFarmId) ?? null,
    [savedFarms, activeFarmId]
  );

  // Initialize Gemini AI status immediately on first website load
  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((d: { available?: boolean }) => setAiAvailable(Boolean(d.available)))
      .catch(() => setAiAvailable(false));
  }, []);

  // Load saved farms from SQLite on startup and restore active farm boundary
  const refreshFarms = useCallback(async () => {
    try {
      const res = await fetch('/api/farms');
      const data = (await res.json()) as { farms?: FarmProfile[] };
      const farms = data.farms ?? [];
      setSavedFarms(farms);
      return farms;
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    void refreshFarms().then((farms) => {
      if (activeFarmId !== null) {
        const matched = farms.find((f) => f.id === activeFarmId);
        if (matched) {
          setSelectedLabel(matched.name);
          setSelectedLat(matched.latitude);
          setSelectedLon(matched.longitude);
          setDrawnBoundary(parseGeojsonToPoints(matched.boundaryGeojson));
        } else {
          setActiveFarmId(null);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch real NASA & Open-Meteo overview whenever selected coordinates change
  const loadOverview = useCallback(async (lat: number, lon: number, label: string) => {
    setLoadingOverview(true);
    setOverviewError(null);
    try {
      const res = await fetch(
        `/api/nasa/overview?lat=${lat}&lon=${lon}&label=${encodeURIComponent(label)}`
      );
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = (await res.json()) as NasaOverviewResponse;
      setOverview(data);
    } catch {
      setOverviewError(TRANSLATIONS[language].common.fetchError);
    } finally {
      setLoadingOverview(false);
    }
  }, [language]);

  useEffect(() => {
    void loadOverview(selectedLat, selectedLon, selectedLabel);
  }, [selectedLat, selectedLon, selectedLabel, loadOverview]);

  const handleSelectLocation = useCallback(
    (label: string, lat: number, lon: number, farmId: number | null = null) => {
      setSelectedLabel(label);
      setSelectedLat(lat);
      setSelectedLon(lon);
      setActiveFarmId(farmId);

      if (farmId !== null) {
        const matched = savedFarms.find((f) => f.id === farmId);
        setDrawnBoundary(parseGeojsonToPoints(matched?.boundaryGeojson));
      } else {
        setDrawnBoundary([]);
      }
    },
    [savedFarms]
  );

  const handleSelectFarm = (farm: FarmProfile) => {
    handleSelectLocation(farm.name, farm.latitude, farm.longitude, farm.id);
    const cropMatch = CROP_OPTIONS.find(
      (c) => c.en.toLowerCase() === farm.cropName.toLowerCase()
    );
    if (cropMatch) setCurrentCropId(cropMatch.id);
  };

  const handleSaveFarm = async (payload: {
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
  }) => {
    const isUpdate = Boolean(payload.id);
    const url = isUpdate ? `/api/farms/${payload.id}` : '/api/farms';
    const method = isUpdate ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errData = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(errData.error || 'Could not save farm profile.');
    }
    const data = (await res.json()) as { farm: FarmProfile };
    await refreshFarms();
    setActiveFarmId(data.farm.id);
    setSelectedLabel(data.farm.name);
    setSelectedLat(data.farm.latitude);
    setSelectedLon(data.farm.longitude);
    setDrawnBoundary(parseGeojsonToPoints(data.farm.boundaryGeojson));
  };

  const handleDeleteFarm = async (id: number) => {
    const res = await fetch(`/api/farms/${id}`, { method: 'DELETE' });
    if (!res.ok) return;
    await refreshFarms();
    if (activeFarmId === id) {
      setActiveFarmId(null);
      setSelectedLabel(TARGET_REGIONS[0].name);
      setSelectedLat(TARGET_REGIONS[0].lat);
      setSelectedLon(TARGET_REGIONS[0].lon);
      setDrawnBoundary([]);
    }
  };

  const handleSaveBoundaryToFarm = async (coords: [number, number][], approxAcres: number) => {
    const boundaryGeojson = pointsToGeojsonFeature(coords);
    if (!boundaryGeojson) {
      throw new Error('Invalid polygon coordinates.');
    }
    const centerLat = coords.reduce((a, p) => a + p[0], 0) / coords.length;
    const centerLon = coords.reduce((a, p) => a + p[1], 0) / coords.length;

    const targetFarm =
      activeFarm ??
      savedFarms.find(
        (f) => f.name.toLowerCase() === `${selectedLabel} Field`.toLowerCase()
      ) ??
      null;

    if (targetFarm) {
      await handleSaveFarm({
        id: targetFarm.id,
        name: targetFarm.name,
        locationLabel: targetFarm.locationLabel,
        latitude: centerLat,
        longitude: centerLon,
        cropName: targetFarm.cropName,
        season: targetFarm.season,
        areaAcres: approxAcres > 0 ? approxAcres : targetFarm.areaAcres,
        boundaryGeojson,
        notes: targetFarm.notes,
      });
    } else {
      await handleSaveFarm({
        name: `${selectedLabel} Field`,
        locationLabel: selectedLabel,
        latitude: centerLat,
        longitude: centerLon,
        cropName: CROP_OPTIONS.find((c) => c.id === currentCropId)?.en ?? 'Aman Paddy',
        season: 'Kharif',
        areaAcres: approxAcres > 0 ? approxAcres : 1.0,
        boundaryGeojson,
        notes: 'Field boundary drawn on FarmOrbit Map',
      });
    }
  };

  const handleDeleteBoundaryFromFarm = async () => {
    if (!activeFarm) return;
    await handleSaveFarm({
      id: activeFarm.id,
      name: activeFarm.name,
      locationLabel: activeFarm.locationLabel,
      latitude: activeFarm.latitude,
      longitude: activeFarm.longitude,
      cropName: activeFarm.cropName,
      season: activeFarm.season,
      areaAcres: activeFarm.areaAcres,
      boundaryGeojson: null,
      notes: activeFarm.notes,
    });
  };

  const handleAskAiWithTopic = (question: string) => {
    setPendingAiPrompt(question);
    setActiveTab('ai');
  };

  const activeCropName =
    activeFarm?.cropName ??
    CROP_OPTIONS.find((c) => c.id === currentCropId)?.[language] ??
    'Aman Paddy';

  return (
    <div className="min-h-screen flex flex-col bg-[#F6FAF6] text-[#102617]">
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={language}
        onChangeLanguage={handleChangeLanguage}
        t={t}
        alertCount={overview?.alerts.length ?? 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {overviewError && (
          <div className="mb-6 p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex flex-wrap items-center justify-between gap-3 text-sm text-[#991B1B]">
            <span>{overviewError}</span>
            <button
              type="button"
              onClick={() => void loadOverview(selectedLat, selectedLon, selectedLabel)}
              className="px-3.5 py-1.5 rounded-lg bg-[#991B1B] text-white text-xs font-semibold cursor-pointer"
            >
              {t.common.retry}
            </button>
          </div>
        )}

        {activeTab === 'home' && (
          <HomeView
            language={language}
            t={t}
            selectedLabel={selectedLabel}
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            savedFarms={savedFarms}
            activeFarmId={activeFarmId}
            overview={overview}
            loading={loadingOverview}
            onSelectLocation={handleSelectLocation}
            onNavigate={setActiveTab}
            onAskAiWithTopic={handleAskAiWithTopic}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            language={language}
            t={t}
            selectedLabel={selectedLabel}
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            savedFarms={savedFarms}
            activeFarm={activeFarm}
            drawnBoundary={drawnBoundary}
            overview={overview}
            loading={loadingOverview}
            onSelectFarm={handleSelectFarm}
            onSaveFarm={handleSaveFarm}
            onDeleteFarm={handleDeleteFarm}
            onAskAi={handleAskAiWithTopic}
          />
        )}

        {activeTab === 'map' && (
          <MapView
            language={language}
            t={t}
            selectedLabel={selectedLabel}
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            savedFarms={savedFarms}
            activeFarm={activeFarm}
            drawnBoundary={drawnBoundary}
            onUpdateBoundary={setDrawnBoundary}
            onSelectLocation={handleSelectLocation}
            onSaveBoundaryToFarm={handleSaveBoundaryToFarm}
            onDeleteBoundaryFromFarm={handleDeleteBoundaryFromFarm}
          />
        )}

        {activeTab === 'rotation' && (
          <CropRotationView
            language={language}
            t={t}
            selectedLabel={selectedLabel}
            currentCropId={currentCropId}
            onChangeCropId={setCurrentCropId}
            overview={overview}
            onAskAi={handleAskAiWithTopic}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            language={language}
            t={t}
            alerts={overview?.alerts ?? []}
            overview={overview}
            onAskAi={handleAskAiWithTopic}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantView
            language={language}
            t={t}
            selectedLabel={selectedLabel}
            selectedLat={selectedLat}
            selectedLon={selectedLon}
            activeCropName={activeCropName}
            overview={overview}
            aiAvailable={aiAvailable}
            messages={aiMessages}
            onChangeMessages={setAiMessages}
            pendingPrompt={pendingAiPrompt}
            onClearPendingPrompt={() => setPendingAiPrompt(null)}
          />
        )}

        {activeTab === 'sources' && (
          <DataSourcesView language={language} t={t} overview={overview} />
        )}
      </main>

      <footer className="border-t border-[#DCE7DC] bg-white py-5 px-4 sm:px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#4F6B56]">
          <span>
            {t.brandName} · {t.tagline}
          </span>
          <span>{t.regionFooter}</span>
        </div>
      </footer>
    </div>
  );
}
