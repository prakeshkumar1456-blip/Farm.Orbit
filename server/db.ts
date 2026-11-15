import Database from 'better-sqlite3';
import path from 'path';
import type { FarmProfile } from '../src/types/farm.ts';

const dbPath = path.resolve(process.cwd(), 'farmorbit.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS farm_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    location_label TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    crop_name TEXT NOT NULL DEFAULT 'Aman Paddy',
    season TEXT NOT NULL DEFAULT 'Kharif',
    area_acres REAL NOT NULL DEFAULT 1.5,
    boundary_geojson TEXT,
    notes TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export function validateBoundaryGeojson(raw: string | null | undefined): {
  valid: boolean;
  normalized: string | null;
  error?: string;
} {
  if (raw === null || raw === undefined || raw === '') {
    return { valid: true, normalized: null };
  }

  let parsed: unknown;
  try {
    parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return { valid: false, normalized: null, error: 'Boundary must be valid JSON.' };
  }

  let ring: [number, number][] = [];

  // Accept GeoJSON Feature<Polygon>
  if (
    typeof parsed === 'object' &&
    parsed !== null &&
    (parsed as { type?: string }).type === 'Feature'
  ) {
    const geom = (parsed as { geometry?: { type?: string; coordinates?: unknown } }).geometry;
    if (geom?.type === 'Polygon' && Array.isArray(geom.coordinates) && Array.isArray(geom.coordinates[0])) {
      ring = geom.coordinates[0] as [number, number][];
    }
  } else if (
    typeof parsed === 'object' &&
    parsed !== null &&
    (parsed as { type?: string }).type === 'Polygon'
  ) {
    const coords = (parsed as { coordinates?: unknown }).coordinates;
    if (Array.isArray(coords) && Array.isArray(coords[0])) {
      ring = coords[0] as [number, number][];
    }
  } else if (Array.isArray(parsed)) {
    // Legacy [lat, lon][] format -> convert to GeoJSON [lon, lat]
    ring = parsed.map((p) => {
      const pair = p as [number, number];
      return [Number(pair[1]), Number(pair[0])];
    });
  }

  if (!Array.isArray(ring) || ring.length < 3) {
    return {
      valid: false,
      normalized: null,
      error: 'Polygon must contain at least 3 valid coordinate points.',
    };
  }

  const cleanRing: [number, number][] = [];
  for (const pt of ring) {
    if (!Array.isArray(pt) || pt.length < 2) {
      return { valid: false, normalized: null, error: 'Invalid coordinate pair in polygon.' };
    }
    const lon = Number(pt[0]);
    const lat = Number(pt[1]);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return {
        valid: false,
        normalized: null,
        error: 'Polygon coordinates out of valid latitude/longitude bounds.',
      };
    }
    cleanRing.push([Math.round(lon * 1000000) / 1000000, Math.round(lat * 1000000) / 1000000]);
  }

  // Ensure ring is closed
  const first = cleanRing[0];
  const last = cleanRing[cleanRing.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    cleanRing.push([first[0], first[1]]);
  }

  if (cleanRing.length < 4) {
    return {
      valid: false,
      normalized: null,
      error: 'Closed GeoJSON polygon requires at least 3 distinct corners.',
    };
  }

  // Check distinct points (non-degenerate)
  const uniqueKeys = new Set(cleanRing.slice(0, -1).map((p) => `${p[0]},${p[1]}`));
  if (uniqueKeys.size < 3) {
    return {
      valid: false,
      normalized: null,
      error: 'Field boundary must have at least 3 distinct corner points.',
    };
  }

  const feature = {
    type: 'Feature',
    properties: {
      source: 'FarmOrbit Field Boundary',
    },
    geometry: {
      type: 'Polygon',
      coordinates: [cleanRing],
    },
  };

  return { valid: true, normalized: JSON.stringify(feature) };
}

function mapRow(row: Record<string, unknown>): FarmProfile {
  return {
    id: Number(row.id),
    name: String(row.name),
    locationLabel: String(row.location_label),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    cropName: String(row.crop_name),
    season: String(row.season),
    areaAcres: Number(row.area_acres),
    boundaryGeojson: row.boundary_geojson ? String(row.boundary_geojson) : null,
    notes: String(row.notes ?? ''),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

export function listFarms(): FarmProfile[] {
  const rows = db
    .prepare('SELECT * FROM farm_profiles ORDER BY updated_at DESC, id DESC')
    .all() as Record<string, unknown>[];
  return rows.map(mapRow);
}

export function getFarmById(id: number): FarmProfile | null {
  const row = db
    .prepare('SELECT * FROM farm_profiles WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  return row ? mapRow(row) : null;
}

export interface CreateFarmInput {
  name: string;
  locationLabel: string;
  latitude: number;
  longitude: number;
  cropName: string;
  season: string;
  areaAcres: number;
  boundaryGeojson?: string | null;
  notes?: string;
}

export function createFarm(input: CreateFarmInput): FarmProfile {
  const validation = validateBoundaryGeojson(input.boundaryGeojson);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid GeoJSON boundary.');
  }

  const stmt = db.prepare(`
    INSERT INTO farm_profiles (
      name, location_label, latitude, longitude, crop_name, season, area_acres, boundary_geojson, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    input.name.trim(),
    input.locationLabel.trim(),
    input.latitude,
    input.longitude,
    input.cropName.trim(),
    input.season.trim(),
    input.areaAcres,
    validation.normalized,
    input.notes?.trim() ?? ''
  );
  const created = getFarmById(Number(result.lastInsertRowid));
  if (!created) {
    throw new Error('Failed to load created farm profile.');
  }
  return created;
}

export function updateFarm(id: number, input: Partial<CreateFarmInput>): FarmProfile | null {
  const existing = getFarmById(id);
  if (!existing) return null;

  let nextBoundary = existing.boundaryGeojson;
  if (input.boundaryGeojson !== undefined) {
    const validation = validateBoundaryGeojson(input.boundaryGeojson);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid GeoJSON boundary.');
    }
    nextBoundary = validation.normalized;
  }

  const stmt = db.prepare(`
    UPDATE farm_profiles
    SET name = ?,
        location_label = ?,
        latitude = ?,
        longitude = ?,
        crop_name = ?,
        season = ?,
        area_acres = ?,
        boundary_geojson = ?,
        notes = ?,
        updated_at = datetime('now')
    WHERE id = ?
  `);

  stmt.run(
    input.name !== undefined ? input.name.trim() : existing.name,
    input.locationLabel !== undefined ? input.locationLabel.trim() : existing.locationLabel,
    input.latitude !== undefined ? input.latitude : existing.latitude,
    input.longitude !== undefined ? input.longitude : existing.longitude,
    input.cropName !== undefined ? input.cropName.trim() : existing.cropName,
    input.season !== undefined ? input.season.trim() : existing.season,
    input.areaAcres !== undefined ? input.areaAcres : existing.areaAcres,
    nextBoundary,
    input.notes !== undefined ? input.notes.trim() : existing.notes,
    id
  );

  return getFarmById(id);
}

export function deleteFarm(id: number): boolean {
  const result = db.prepare('DELETE FROM farm_profiles WHERE id = ?').run(id);
  return result.changes > 0;
}
