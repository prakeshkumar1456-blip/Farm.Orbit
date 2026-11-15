export type LanguageCode = 'en' | 'hi' | 'bn';

export type SoilType =
  | 'unknown'
  | 'alluvial_loam'
  | 'clay_loam'
  | 'sandy_loam'
  | 'coastal_saline';

export type IrrigationType = 'unknown' | 'rainfed' | 'canal_pond' | 'tubewell';

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface TargetRegion {
  id: string;
  name: string;
  nameHi: string;
  nameBn: string;
  district: string;
  lat: number;
  lon: number;
  descriptionEn: string;
  descriptionHi: string;
  descriptionBn: string;
}

export interface FarmProfile {
  id: number;
  name: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  cropName: string;
  season: string;
  areaAcres: number;
  boundaryGeojson: string | null; // GeoJSON Feature<Polygon> JSON string
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DailyNasaPoint {
  date: string; // YYYY-MM-DD
  t2m: number | null;
  t2mMax: number | null;
  t2mMin: number | null;
  rainfallMm: number | null;
  humidityPct: number | null;
  surfaceSoilWetness: number | null; // 0-1 GWETTOP
  rootSoilWetness: number | null; // 0-1 GWETROOT
  solarRadiation: number | null; // MJ/m2/day
  landSkinTempC: number | null; // TS
  windSpeedMs: number | null;
}

export interface ClimatologyMonth {
  month: string; // JAN..DEC
  t2m: number | null;
  rainfallMmPerDay: number | null;
  humidityPct: number | null;
  surfaceSoilWetness: number | null;
  landSkinTempC: number | null;
}

export interface SentinelSceneInfo {
  available: boolean;
  sceneId: string | null;
  datetime: string | null;
  cloudCoverPct: number | null;
  mgrsTile: string | null;
  thumbnailUrl: string | null;
  platform: string | null;
  note: string;
}

export interface NasaGranuleMeta {
  shortName: string;
  label: string;
  available: boolean;
  latestDate: string | null;
  granuleId: string | null;
  spatialResolution: string;
}

export type AlertCode =
  | 'RAINFALL_BELOW_AVG'
  | 'RAINFALL_ABOVE_AVG'
  | 'HEAVY_RAINFALL'
  | 'HIGH_LAND_SURFACE_TEMP'
  | 'HIGH_TEMP_ANOMALY'
  | 'SOIL_MOISTURE_LOW'
  | 'SOIL_MOISTURE_EXCESS'
  | 'SOIL_MOISTURE_DROPPING'
  | 'HIGH_HUMIDITY_PEST_WATCH'
  | 'VEGETATION_CLOUD_GAP';

export interface RealAlertItem {
  id: string;
  code: AlertCode;
  severity: 'attention' | 'advisory' | 'info';
  observedNum: string;
  baselineNum: string;
  unit: string;
  locationLabel: string;
  sourceName: string;
  spatialResolution: string;
  observationDate: string;
}

export interface NasaOverviewResponse {
  coordinates: {
    lat: number;
    lon: number;
    elevationM: number | null;
    elevationSource: string;
  };
  fetchedAt: string;
  nasaPower: {
    available: boolean;
    source: string;
    spatialResolution: string;
    latestObservationDate: string | null;
    latest: DailyNasaPoint | null;
    past14DaysRainfallMm: number | null;
    past30DaysRainfallMm: number | null;
    past7DaysAvgTempC: number | null;
    past7DaysAvgSoilWetness: number | null;
    previous7DaysAvgSoilWetness: number | null;
    dailySeries: DailyNasaPoint[];
    currentMonthClimatology: ClimatologyMonth | null;
    error?: string;
  };
  openMeteo: {
    available: boolean;
    source: string;
    spatialResolution: string;
    observedAt: string | null;
    currentTempC: number | null;
    currentHumidityPct: number | null;
    currentWindKmh: number | null;
    currentRainMm: number | null;
    soilMoisture0to1cm: number | null; // m3/m3
    soilMoisture1to3cm: number | null; // m3/m3
    soilTemp0cmC: number | null;
    et0TodayMm: number | null;
    error?: string;
  };
  sentinel2: SentinelSceneInfo;
  nasaMissions: NasaGranuleMeta[];
  alerts: RealAlertItem[];
}

export interface YearlyHistoryPoint {
  year: number;
  month: number; // 1..12
  t2m: number | null;
  rainfallMmPerDay: number | null;
  surfaceSoilWetness: number | null;
  landSkinTempC: number | null;
}

export interface NasaHistoryResponse {
  available: boolean;
  source: string;
  spatialResolution: string;
  years: number[];
  annualSummary: Array<{
    year: number;
    avgTempC: number | null;
    totalEstRainfallMm: number | null;
    avgSoilWetness: number | null;
    avgSkinTempC: number | null;
  }>;
  monthlyPoints: YearlyHistoryPoint[];
}

export interface CompareLocationItem {
  id: string;
  name: string;
  lat: number;
  lon: number;
  elevationM: number | null;
  latestDate: string | null;
  tempC: number | null;
  landSkinTempC: number | null;
  past30DaysRainfallMm: number | null;
  climatologyMonthRainMmDay: number | null;
  surfaceSoilWetness: number | null;
  humidityPct: number | null;
  solarRadiation: number | null;
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  error?: boolean;
  retryPrompt?: string;
}
