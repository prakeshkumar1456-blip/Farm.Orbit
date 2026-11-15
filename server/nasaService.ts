import type {
  ClimatologyMonth,
  CompareLocationItem,
  DailyNasaPoint,
  NasaGranuleMeta,
  NasaHistoryResponse,
  NasaOverviewResponse,
  RealAlertItem,
  SentinelSceneInfo,
  YearlyHistoryPoint,
} from '../src/types/farm.ts';

interface CacheEntry<T> {
  expiresAt: number;
  data: T;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached<T>(key: string, data: T): void {
  cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, data });
}

function cleanVal(val: unknown): number | null {
  if (typeof val !== 'number' || !Number.isFinite(val) || val <= -900) {
    return null;
  }
  return Math.round(val * 100) / 100;
}

function formatYyyymmdd(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseYyyymmdd(s: string): string {
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

const MONTH_KEYS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;

async function fetchJsonWithTimeout(url: string, init?: RequestInit, timeoutMs = 9000): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from ${new URL(url).hostname}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function fetchNasaPowerDailyAndClimatology(lat: number, lon: number) {
  const now = new Date();
  const endStr = formatYyyymmdd(now);
  const start = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
  const startStr = formatYyyymmdd(start);

  const dailyUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,T2M_MAX,T2M_MIN,PRECTOTCORR,RH2M,GWETTOP,GWETROOT,ALLSKY_SFC_SW_DWN,TS,WS2M&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&start=${startStr}&end=${endStr}&format=JSON`;
  const climUrl = `https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M,PRECTOTCORR,RH2M,GWETTOP,TS&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&format=JSON`;

  const [dailyRaw, climRaw] = await Promise.all([
    fetchJsonWithTimeout(dailyUrl),
    fetchJsonWithTimeout(climUrl),
  ]);

  const dailyJson = dailyRaw as {
    geometry?: { coordinates?: number[] };
    properties?: { parameter?: Record<string, Record<string, number>> };
  };
  const climJson = climRaw as {
    properties?: { parameter?: Record<string, Record<string, number>> };
  };

  const elevationFromPower =
    typeof dailyJson.geometry?.coordinates?.[2] === 'number'
      ? Math.round(dailyJson.geometry.coordinates[2] * 10) / 10
      : null;

  const params = dailyJson.properties?.parameter ?? {};
  const dates = Object.keys(params.T2M ?? {}).sort();

  const dailySeries: DailyNasaPoint[] = [];
  for (const d of dates) {
    const t2m = cleanVal(params.T2M?.[d]);
    const rainfallMm = cleanVal(params.PRECTOTCORR?.[d]);
    const humidityPct = cleanVal(params.RH2M?.[d]);
    const surfaceSoilWetness = cleanVal(params.GWETTOP?.[d]);
    if (t2m === null && rainfallMm === null && humidityPct === null) {
      continue;
    }
    dailySeries.push({
      date: parseYyyymmdd(d),
      t2m,
      t2mMax: cleanVal(params.T2M_MAX?.[d]),
      t2mMin: cleanVal(params.T2M_MIN?.[d]),
      rainfallMm,
      humidityPct,
      surfaceSoilWetness,
      rootSoilWetness: cleanVal(params.GWETROOT?.[d]),
      solarRadiation: cleanVal(params.ALLSKY_SFC_SW_DWN?.[d]),
      landSkinTempC: cleanVal(params.TS?.[d]),
      windSpeedMs: cleanVal(params.WS2M?.[d]),
    });
  }

  const latest = dailySeries.length > 0 ? dailySeries[dailySeries.length - 1] : null;
  const last14 = dailySeries.slice(-14);
  const last30 = dailySeries.slice(-30);
  const last7 = dailySeries.slice(-7);
  const prev7 = dailySeries.slice(-14, -7);

  const sumRainfall = (arr: DailyNasaPoint[]) => {
    const valid = arr.filter((x) => x.rainfallMm !== null);
    if (valid.length === 0) return null;
    return Math.round(valid.reduce((acc, x) => acc + (x.rainfallMm ?? 0), 0) * 10) / 10;
  };

  const avgMetric = (arr: DailyNasaPoint[], key: keyof DailyNasaPoint) => {
    const valid = arr.map((x) => x[key]).filter((v): v is number => typeof v === 'number');
    if (valid.length === 0) return null;
    return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 100) / 100;
  };

  const monthIdx = now.getUTCMonth();
  const monthKey = MONTH_KEYS[monthIdx] ?? 'NOV';
  const climParams = climJson.properties?.parameter ?? {};

  const currentMonthClimatology: ClimatologyMonth = {
    month: monthKey,
    t2m: cleanVal(climParams.T2M?.[monthKey]),
    rainfallMmPerDay: cleanVal(climParams.PRECTOTCORR?.[monthKey]),
    humidityPct: cleanVal(climParams.RH2M?.[monthKey]),
    surfaceSoilWetness: cleanVal(climParams.GWETTOP?.[monthKey]),
    landSkinTempC: cleanVal(climParams.TS?.[monthKey]),
  };

  return {
    elevationFromPower,
    latestObservationDate: latest?.date ?? null,
    latest,
    past14DaysRainfallMm: sumRainfall(last14),
    past30DaysRainfallMm: sumRainfall(last30),
    past7DaysAvgTempC: avgMetric(last7, 't2m'),
    past7DaysAvgSoilWetness: avgMetric(last7, 'surfaceSoilWetness'),
    previous7DaysAvgSoilWetness: avgMetric(prev7, 'surfaceSoilWetness'),
    dailySeries: last30,
    currentMonthClimatology,
  };
}

async function fetchOpenMeteo(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&hourly=soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_temperature_0cm&daily=et0_fao_evapotranspiration&timezone=Asia%2FKolkata&forecast_days=1`;
  const raw = (await fetchJsonWithTimeout(url, undefined, 7000)) as {
    elevation?: number;
    current?: {
      time?: string;
      temperature_2m?: number;
      relative_humidity_2m?: number;
      precipitation?: number;
      wind_speed_10m?: number;
    };
    hourly?: {
      time?: string[];
      soil_moisture_0_to_1cm?: number[];
      soil_moisture_1_to_3cm?: number[];
      soil_temperature_0cm?: number[];
    };
    daily?: {
      et0_fao_evapotranspiration?: number[];
    };
  };

  const times = raw.hourly?.time ?? [];
  const currentHourPrefix = raw.current?.time?.slice(0, 13);
  let idx = times.findIndex((t) => currentHourPrefix && t.startsWith(currentHourPrefix));
  if (idx < 0) idx = Math.max(0, times.length - 1);

  return {
    elevationM: typeof raw.elevation === 'number' ? raw.elevation : null,
    observedAt: raw.current?.time ?? null,
    currentTempC: cleanVal(raw.current?.temperature_2m),
    currentHumidityPct: cleanVal(raw.current?.relative_humidity_2m),
    currentWindKmh: cleanVal(raw.current?.wind_speed_10m),
    currentRainMm: cleanVal(raw.current?.precipitation),
    soilMoisture0to1cm: cleanVal(raw.hourly?.soil_moisture_0_to_1cm?.[idx]),
    soilMoisture1to3cm: cleanVal(raw.hourly?.soil_moisture_1_to_3cm?.[idx]),
    soilTemp0cmC: cleanVal(raw.hourly?.soil_temperature_0cm?.[idx]),
    et0TodayMm: cleanVal(raw.daily?.et0_fao_evapotranspiration?.[0]),
  };
}

async function fetchSentinel2Latest(lat: number, lon: number): Promise<SentinelSceneInfo> {
  try {
    const raw = (await fetchJsonWithTimeout(
      'https://earth-search.aws.element84.com/v1/search',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collections: ['sentinel-2-l2a'],
          intersects: { type: 'Point', coordinates: [lon, lat] },
          query: { 'eo:cloud_cover': { lt: 35 } },
          limit: 1,
        }),
      },
      7000
    )) as {
      features?: Array<{
        id?: string;
        properties?: {
          datetime?: string;
          'eo:cloud_cover'?: number;
          platform?: string;
          'mgrs:utm_zone'?: number;
          'mgrs:latitude_band'?: string;
          'mgrs:grid_square'?: string;
        };
        assets?: {
          thumbnail?: { href?: string };
          rendered_preview?: { href?: string };
        };
      }>;
    };

    const feat = raw.features?.[0];
    if (!feat) {
      return {
        available: false,
        sceneId: null,
        datetime: null,
        cloudCoverPct: null,
        mgrsTile: null,
        thumbnailUrl: null,
        platform: null,
        note: 'No recent low-cloud Sentinel-2 L2A pass found for this point.',
      };
    }

    const p = feat.properties ?? {};
    const mgrs =
      p['mgrs:utm_zone'] && p['mgrs:latitude_band'] && p['mgrs:grid_square']
        ? `${p['mgrs:utm_zone']}${p['mgrs:latitude_band']}${p['mgrs:grid_square']}`
        : null;

    return {
      available: true,
      sceneId: feat.id ?? null,
      datetime: p.datetime ?? null,
      cloudCoverPct: typeof p['eo:cloud_cover'] === 'number' ? Math.round(p['eo:cloud_cover'] * 10) / 10 : null,
      mgrsTile: mgrs,
      thumbnailUrl: feat.assets?.thumbnail?.href ?? feat.assets?.rendered_preview?.href ?? null,
      platform: p.platform ?? 'Sentinel-2',
      note: 'ESA Copernicus Sentinel-2 L2A 10m-20m optical pass metadata via Earth Search STAC.',
    };
  } catch {
    return {
      available: false,
      sceneId: null,
      datetime: null,
      cloudCoverPct: null,
      mgrsTile: null,
      thumbnailUrl: null,
      platform: null,
      note: 'Sentinel-2 catalog temporarily unreachable; NASA GIBS MODIS 250m vegetation map remains active.',
    };
  }
}

async function fetchNasaCmrMissions(lat: number, lon: number): Promise<NasaGranuleMeta[]> {
  const specs = [
    {
      shortName: 'SPL3SMP_E',
      label: 'NASA SMAP Enhanced Radiometer Soil Moisture',
      spatialResolution: '9 km',
    },
    {
      shortName: 'GPM_3IMERGDF',
      label: 'NASA GPM IMERG Daily Rainfall',
      spatialResolution: '0.1° (~10 km)',
    },
    {
      shortName: 'ECO_L2T_LSTE',
      label: 'NASA ECOSTRESS Land Surface Temperature',
      spatialResolution: '70 m',
    },
  ];

  return Promise.all(
    specs.map(async (spec) => {
      try {
        const url = `https://cmr.earthdata.nasa.gov/search/granules.json?short_name=${spec.shortName}&point=${lon.toFixed(4)},${lat.toFixed(4)}&sort_key=-start_date&page_size=1`;
        const raw = (await fetchJsonWithTimeout(url, undefined, 6000)) as {
          feed?: {
            entry?: Array<{
              producer_granule_id?: string;
              title?: string;
              time_start?: string;
            }>;
          };
        };
        const entry = raw.feed?.entry?.[0];
        return {
          shortName: spec.shortName,
          label: spec.label,
          available: Boolean(entry),
          latestDate: entry?.time_start ? entry.time_start.slice(0, 10) : null,
          granuleId: entry?.producer_granule_id ?? entry?.title ?? null,
          spatialResolution: spec.spatialResolution,
        };
      } catch {
        return {
          shortName: spec.shortName,
          label: spec.label,
          available: false,
          latestDate: null,
          granuleId: null,
          spatialResolution: spec.spatialResolution,
        };
      }
    })
  );
}

function buildRealAlerts(
  locationLabel: string,
  power: Awaited<ReturnType<typeof fetchNasaPowerDailyAndClimatology>> | null,
  sentinel: SentinelSceneInfo
): RealAlertItem[] {
  const alerts: RealAlertItem[] = [];
  if (!power || !power.latest) return alerts;

  const obsDate = power.latestObservationDate ?? power.latest.date;
  const clim = power.currentMonthClimatology;

  // 1. Rainfall comparison against NASA POWER 20-year climatology (both dry and wet anomalies)
  if (
    power.past14DaysRainfallMm !== null &&
    clim?.rainfallMmPerDay !== null &&
    clim?.rainfallMmPerDay !== undefined
  ) {
    const expected14Day = Math.round(clim.rainfallMmPerDay * 14 * 10) / 10;
    if (expected14Day >= 5 && power.past14DaysRainfallMm < expected14Day * 0.55) {
      alerts.push({
        id: 'rain-below-avg',
        code: 'RAINFALL_BELOW_AVG',
        severity: 'advisory',
        observedNum: String(power.past14DaysRainfallMm),
        baselineNum: String(expected14Day),
        unit: 'mm',
        locationLabel,
        sourceName: 'NASA POWER (GPM/MERRA-2 Corrected Precipitation)',
        spatialResolution: '0.5° × 0.625° (~55 km grid)',
        observationDate: obsDate,
      });
    } else if (
      power.past14DaysRainfallMm >= 20 &&
      expected14Day >= 3 &&
      power.past14DaysRainfallMm > expected14Day * 1.6
    ) {
      alerts.push({
        id: 'rain-above-avg',
        code: 'RAINFALL_ABOVE_AVG',
        severity: 'advisory',
        observedNum: String(power.past14DaysRainfallMm),
        baselineNum: String(expected14Day),
        unit: 'mm',
        locationLabel,
        sourceName: 'NASA POWER (GPM/MERRA-2 Corrected Precipitation)',
        spatialResolution: '0.5° × 0.625° (~55 km grid)',
        observationDate: obsDate,
      });
    }
  }

  // 2. Heavy rainfall check in recent 3 days
  const recentMaxRain = Math.max(...power.dailySeries.slice(-3).map((d) => d.rainfallMm ?? 0), 0);
  if (recentMaxRain >= 30) {
    alerts.push({
      id: 'heavy-rain',
      code: 'HEAVY_RAINFALL',
      severity: 'attention',
      observedNum: String(Math.round(recentMaxRain * 10) / 10),
      baselineNum: '30',
      unit: 'mm/day',
      locationLabel,
      sourceName: 'NASA POWER Precipitation (PRECTOTCORR)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      observationDate: obsDate,
    });
  }

  // 3. Land surface skin temperature check
  if (power.latest.landSkinTempC !== null && power.latest.landSkinTempC >= 34) {
    alerts.push({
      id: 'high-lst',
      code: 'HIGH_LAND_SURFACE_TEMP',
      severity: 'attention',
      observedNum: String(power.latest.landSkinTempC),
      baselineNum: clim?.landSkinTempC ? String(clim.landSkinTempC) : '34',
      unit: '°C',
      locationLabel,
      sourceName: 'NASA POWER Earth Skin Temp (TS)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      observationDate: obsDate,
    });
  }

  // 4. Air temperature anomaly vs 20-year monthly climatology
  if (
    power.past7DaysAvgTempC !== null &&
    clim?.t2m !== null &&
    clim?.t2m !== undefined &&
    power.past7DaysAvgTempC - clim.t2m >= 2.0
  ) {
    alerts.push({
      id: 'temp-anomaly',
      code: 'HIGH_TEMP_ANOMALY',
      severity: 'advisory',
      observedNum: String(Math.round(power.past7DaysAvgTempC * 10) / 10),
      baselineNum: String(clim.t2m),
      unit: '°C',
      locationLabel,
      sourceName: 'NASA POWER 2m Air Temperature (T2M)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      observationDate: obsDate,
    });
  }

  // 5. Soil wetness low, saturated, or dropping
  if (power.latest.surfaceSoilWetness !== null && power.latest.surfaceSoilWetness < 0.48) {
    alerts.push({
      id: 'soil-low',
      code: 'SOIL_MOISTURE_LOW',
      severity: 'advisory',
      observedNum: String(Math.round(power.latest.surfaceSoilWetness * 100)),
      baselineNum: clim?.surfaceSoilWetness
        ? String(Math.round(clim.surfaceSoilWetness * 100))
        : '48',
      unit: '%',
      locationLabel,
      sourceName: 'NASA POWER Surface Soil Wetness (GWETTOP 0–5 cm)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      observationDate: obsDate,
    });
  } else if (power.latest.surfaceSoilWetness !== null && power.latest.surfaceSoilWetness >= 0.85) {
    alerts.push({
      id: 'soil-excess',
      code: 'SOIL_MOISTURE_EXCESS',
      severity: 'info',
      observedNum: String(Math.round(power.latest.surfaceSoilWetness * 100)),
      baselineNum: '85',
      unit: '%',
      locationLabel,
      sourceName: 'NASA POWER Surface Soil Wetness (GWETTOP 0–5 cm)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      observationDate: obsDate,
    });
  }

  if (
    power.past7DaysAvgSoilWetness !== null &&
    power.previous7DaysAvgSoilWetness !== null &&
    power.previous7DaysAvgSoilWetness - power.past7DaysAvgSoilWetness >= 0.05
  ) {
    alerts.push({
      id: 'soil-dropping',
      code: 'SOIL_MOISTURE_DROPPING',
      severity: 'info',
      observedNum: String(Math.round(power.past7DaysAvgSoilWetness * 100)),
      baselineNum: String(Math.round(power.previous7DaysAvgSoilWetness * 100)),
      unit: '%',
      locationLabel,
      sourceName: 'NASA POWER Surface Soil Wetness (GWETTOP 0–5 cm)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      observationDate: obsDate,
    });
  }

  // 6. High humidity watch
  if (power.latest.humidityPct !== null && power.latest.humidityPct >= 84) {
    alerts.push({
      id: 'high-humidity',
      code: 'HIGH_HUMIDITY_PEST_WATCH',
      severity: 'info',
      observedNum: String(power.latest.humidityPct),
      baselineNum: '84',
      unit: '%',
      locationLabel,
      sourceName: 'NASA POWER Relative Humidity (RH2M)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      observationDate: obsDate,
    });
  }

  // 7. Optical vegetation monitoring gap check (if Sentinel-2 low-cloud scene is older than 20 days)
  if (sentinel.available && sentinel.datetime) {
    const ageDays = Math.floor(
      (Date.now() - new Date(sentinel.datetime).getTime()) / (24 * 60 * 60 * 1000)
    );
    if (ageDays > 20) {
      alerts.push({
        id: 'veg-cloud-gap',
        code: 'VEGETATION_CLOUD_GAP',
        severity: 'info',
        observedNum: String(ageDays),
        baselineNum: '20',
        unit: 'days',
        locationLabel,
        sourceName: 'ESA Sentinel-2 L2A & NASA MODIS NDVI',
        spatialResolution: '10 m – 250 m',
        observationDate: sentinel.datetime.slice(0, 10),
      });
    }
  }

  return alerts;
}

export async function getNasaOverview(
  lat: number,
  lon: number,
  locationLabel = 'Selected Area'
): Promise<NasaOverviewResponse> {
  const key = `overview:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = getCached<NasaOverviewResponse>(key);
  if (cached) {
    return {
      ...cached,
      alerts: cached.alerts.map((a) => ({ ...a, locationLabel })),
    };
  }

  const [powerRes, meteoRes, sentinelRes, cmrRes] = await Promise.allSettled([
    fetchNasaPowerDailyAndClimatology(lat, lon),
    fetchOpenMeteo(lat, lon),
    fetchSentinel2Latest(lat, lon),
    fetchNasaCmrMissions(lat, lon),
  ]);

  const power = powerRes.status === 'fulfilled' ? powerRes.value : null;
  const meteo = meteoRes.status === 'fulfilled' ? meteoRes.value : null;
  const sentinel: SentinelSceneInfo =
    sentinelRes.status === 'fulfilled'
      ? sentinelRes.value
      : {
          available: false,
          sceneId: null,
          datetime: null,
          cloudCoverPct: null,
          mgrsTile: null,
          thumbnailUrl: null,
          platform: null,
          note: 'Sentinel-2 search unavailable.',
        };
  const missions = cmrRes.status === 'fulfilled' ? cmrRes.value : [];

  const elevationM = meteo?.elevationM ?? power?.elevationFromPower ?? null;
  const elevationSource =
    meteo?.elevationM !== null && meteo?.elevationM !== undefined
      ? 'Open-Meteo Copernicus / SRTM 90m DEM'
      : 'NASA POWER Grid Elevation';

  const result: NasaOverviewResponse = {
    coordinates: {
      lat,
      lon,
      elevationM,
      elevationSource,
    },
    fetchedAt: new Date().toISOString(),
    nasaPower: power
      ? {
          available: true,
          source: 'NASA POWER Agroclimatology (MERRA-2 + GPM/GEOS)',
          spatialResolution: '0.5° × 0.625° (~55 km area grid)',
          latestObservationDate: power.latestObservationDate,
          latest: power.latest,
          past14DaysRainfallMm: power.past14DaysRainfallMm,
          past30DaysRainfallMm: power.past30DaysRainfallMm,
          past7DaysAvgTempC: power.past7DaysAvgTempC,
          past7DaysAvgSoilWetness: power.past7DaysAvgSoilWetness,
          previous7DaysAvgSoilWetness: power.previous7DaysAvgSoilWetness,
          dailySeries: power.dailySeries,
          currentMonthClimatology: power.currentMonthClimatology,
        }
      : {
          available: false,
          source: 'NASA POWER Agroclimatology',
          spatialResolution: '0.5° × 0.625°',
          latestObservationDate: null,
          latest: null,
          past14DaysRainfallMm: null,
          past30DaysRainfallMm: null,
          past7DaysAvgTempC: null,
          past7DaysAvgSoilWetness: null,
          previous7DaysAvgSoilWetness: null,
          dailySeries: [],
          currentMonthClimatology: null,
          error:
            powerRes.status === 'rejected'
              ? String(powerRes.reason)
              : 'NASA POWER temporarily unavailable.',
        },
    openMeteo: meteo
      ? {
          available: true,
          source: 'Open-Meteo (ECMWF / ERA5-Land Soil Model)',
          spatialResolution: '~9–11 km regional grid',
          observedAt: meteo.observedAt,
          currentTempC: meteo.currentTempC,
          currentHumidityPct: meteo.currentHumidityPct,
          currentWindKmh: meteo.currentWindKmh,
          currentRainMm: meteo.currentRainMm,
          soilMoisture0to1cm: meteo.soilMoisture0to1cm,
          soilMoisture1to3cm: meteo.soilMoisture1to3cm,
          soilTemp0cmC: meteo.soilTemp0cmC,
          et0TodayMm: meteo.et0TodayMm,
        }
      : {
          available: false,
          source: 'Open-Meteo',
          spatialResolution: '~9–11 km',
          observedAt: null,
          currentTempC: null,
          currentHumidityPct: null,
          currentWindKmh: null,
          currentRainMm: null,
          soilMoisture0to1cm: null,
          soilMoisture1to3cm: null,
          soilTemp0cmC: null,
          et0TodayMm: null,
          error:
            meteoRes.status === 'rejected'
              ? String(meteoRes.reason)
              : 'Current weather endpoint unreachable.',
        },
    sentinel2: sentinel,
    nasaMissions: missions,
    alerts: buildRealAlerts(locationLabel, power, sentinel),
  };

  if (power || meteo) {
    setCached(key, result);
  }
  return result;
}

export async function getNasaHistory(lat: number, lon: number): Promise<NasaHistoryResponse> {
  const key = `history:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const cached = getCached<NasaHistoryResponse>(key);
  if (cached) return cached;

  const endYear = 2025;
  const startYear = 2021;
  const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,PRECTOTCORR,GWETTOP,TS&community=AG&longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&start=${startYear}&end=${endYear}&format=JSON`;

  try {
    const raw = (await fetchJsonWithTimeout(url, undefined, 9000)) as {
      properties?: { parameter?: Record<string, Record<string, number>> };
    };
    const params = raw.properties?.parameter ?? {};
    const years = [2021, 2022, 2023, 2024, 2025];
    const monthlyPoints: YearlyHistoryPoint[] = [];
    const annualSummary: NasaHistoryResponse['annualSummary'] = [];

    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (const year of years) {
      let tempSum = 0;
      let tempCount = 0;
      let wetSum = 0;
      let wetCount = 0;
      let skinSum = 0;
      let skinCount = 0;
      let rainEst = 0;
      let rainCount = 0;

      for (let m = 1; m <= 12; m++) {
        const keyYm = `${year}${String(m).padStart(2, '0')}`;
        const t2m = cleanVal(params.T2M?.[keyYm]);
        const rainRate = cleanVal(params.PRECTOTCORR?.[keyYm]);
        const wet = cleanVal(params.GWETTOP?.[keyYm]);
        const skin = cleanVal(params.TS?.[keyYm]);

        monthlyPoints.push({
          year,
          month: m,
          t2m,
          rainfallMmPerDay: rainRate,
          surfaceSoilWetness: wet,
          landSkinTempC: skin,
        });

        if (t2m !== null) {
          tempSum += t2m;
          tempCount++;
        }
        if (wet !== null) {
          wetSum += wet;
          wetCount++;
        }
        if (skin !== null) {
          skinSum += skin;
          skinCount++;
        }
        if (rainRate !== null) {
          rainEst += rainRate * (daysInMonth[m - 1] ?? 30);
          rainCount++;
        }
      }

      annualSummary.push({
        year,
        avgTempC: tempCount > 0 ? Math.round((tempSum / tempCount) * 10) / 10 : null,
        totalEstRainfallMm: rainCount > 0 ? Math.round(rainEst) : null,
        avgSoilWetness: wetCount > 0 ? Math.round((wetSum / wetCount) * 100) / 100 : null,
        avgSkinTempC: skinCount > 0 ? Math.round((skinSum / skinCount) * 10) / 10 : null,
      });
    }

    const res: NasaHistoryResponse = {
      available: true,
      source: 'NASA POWER Monthly Multi-Year Archive (2021–2025)',
      spatialResolution: '0.5° × 0.625° (~55 km grid)',
      years,
      annualSummary,
      monthlyPoints,
    };
    setCached(key, res);
    return res;
  } catch {
    return {
      available: false,
      source: 'NASA POWER Monthly Archive',
      spatialResolution: '0.5° × 0.625°',
      years: [],
      annualSummary: [],
      monthlyPoints: [],
    };
  }
}

export async function comparePurbaMedinipurLocations(
  extra?: { name: string; lat: number; lon: number }
): Promise<CompareLocationItem[]> {
  const targets = [
    { id: 'haldia', name: 'Haldia', lat: 22.0667, lon: 88.0698 },
    { id: 'tamluk', name: 'Tamluk', lat: 22.2855, lon: 87.9212 },
    { id: 'contai', name: 'Purba Medinipur (Contai)', lat: 21.7782, lon: 87.7525 },
  ];
  if (extra) {
    targets.push({ id: 'custom', name: extra.name, lat: extra.lat, lon: extra.lon });
  }

  const results = await Promise.all(
    targets.map(async (t) => {
      const ov = await getNasaOverview(t.lat, t.lon, t.name);
      const latest = ov.nasaPower.latest;
      return {
        id: t.id,
        name: t.name,
        lat: t.lat,
        lon: t.lon,
        elevationM: ov.coordinates.elevationM,
        latestDate: ov.nasaPower.latestObservationDate,
        tempC: latest?.t2m ?? ov.openMeteo.currentTempC,
        landSkinTempC: latest?.landSkinTempC ?? ov.openMeteo.soilTemp0cmC,
        past30DaysRainfallMm: ov.nasaPower.past30DaysRainfallMm,
        climatologyMonthRainMmDay: ov.nasaPower.currentMonthClimatology?.rainfallMmPerDay ?? null,
        surfaceSoilWetness: latest?.surfaceSoilWetness ?? null,
        humidityPct: latest?.humidityPct ?? ov.openMeteo.currentHumidityPct,
        solarRadiation: latest?.solarRadiation ?? null,
      };
    })
  );

  return results;
}

const LOCAL_PLACES = [
  { name: 'Haldia, Purba Medinipur, West Bengal', lat: 22.0667, lon: 88.0698 },
  { name: 'Tamluk, Purba Medinipur, West Bengal', lat: 22.2855, lon: 87.9212 },
  { name: 'Contai (Kanthi), Purba Medinipur, West Bengal', lat: 21.7782, lon: 87.7525 },
  { name: 'Nandigram, Purba Medinipur, West Bengal', lat: 22.0086, lon: 87.9912 },
  { name: 'Mahishadal, Purba Medinipur, West Bengal', lat: 22.1782, lon: 88.0056 },
  { name: 'Sutahata, Purba Medinipur, West Bengal', lat: 22.1332, lon: 88.0975 },
  { name: 'Egra, Purba Medinipur, West Bengal', lat: 21.8998, lon: 87.5376 },
  { name: 'Panskura, Purba Medinipur, West Bengal', lat: 22.3976, lon: 87.7418 },
  { name: 'Kolaghat, Purba Medinipur, West Bengal', lat: 22.4337, lon: 87.8685 },
  { name: 'Mecheda, Purba Medinipur, West Bengal', lat: 22.4114, lon: 87.8551 },
  { name: 'Digha, Purba Medinipur, West Bengal', lat: 21.6266, lon: 87.5074 },
  { name: 'Ramnagar, Purba Medinipur, West Bengal', lat: 21.6754, lon: 87.5561 },
];

export async function searchLocations(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return LOCAL_PLACES.slice(0, 6);

  const localMatches = LOCAL_PLACES.filter((p) => p.name.toLowerCase().includes(q));

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      `${query}, West Bengal, India`
    )}&limit=6`;
    const raw = (await fetchJsonWithTimeout(
      url,
      {
        headers: {
          'User-Agent': 'FarmOrbit-Agriculture-App/1.0',
          Accept: 'application/json',
        },
      },
      5000
    )) as Array<{ display_name: string; lat: string; lon: string }>;

    const remoteMatches = raw.map((r) => ({
      name: r.display_name,
      lat: Math.round(Number(r.lat) * 10000) / 10000,
      lon: Math.round(Number(r.lon) * 10000) / 10000,
    }));

    const seen = new Set(localMatches.map((m) => `${m.lat.toFixed(2)},${m.lon.toFixed(2)}`));
    const combined = [...localMatches];
    for (const rm of remoteMatches) {
      const k = `${rm.lat.toFixed(2)},${rm.lon.toFixed(2)}`;
      if (!seen.has(k)) {
        seen.add(k);
        combined.push(rm);
      }
    }
    return combined.slice(0, 8);
  } catch {
    return localMatches.length > 0 ? localMatches : LOCAL_PLACES.slice(0, 4);
  }
}
