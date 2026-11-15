export function pointsToGeojsonFeature(points: [number, number][]): string | null {
  if (!Array.isArray(points) || points.length < 3) return null;

  const clean = points.filter(
    (p) =>
      Array.isArray(p) &&
      p.length >= 2 &&
      Number.isFinite(p[0]) &&
      Number.isFinite(p[1]) &&
      p[0] >= -90 &&
      p[0] <= 90 &&
      p[1] >= -180 &&
      p[1] <= 180
  );

  if (clean.length < 3) return null;

  // GeoJSON stores [lon, lat]
  const ring: [number, number][] = clean.map(([lat, lon]) => [
    Math.round(lon * 1000000) / 1000000,
    Math.round(lat * 1000000) / 1000000,
  ]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    ring.push([first[0], first[1]]);
  }

  const { acres, hectares } = computePolygonArea(clean);

  return JSON.stringify({
    type: 'Feature',
    properties: {
      source: 'FarmOrbit Field Boundary',
      areaAcres: acres,
      areaHectares: hectares,
    },
    geometry: {
      type: 'Polygon',
      coordinates: [ring],
    },
  });
}

export function parseGeojsonToPoints(raw: string | null | undefined): [number, number][] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    let ring: [number, number][] = [];

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed as { type?: string }).type === 'Feature'
    ) {
      const coords = (
        parsed as { geometry?: { type?: string; coordinates?: unknown } }
      ).geometry?.coordinates;
      if (Array.isArray(coords) && Array.isArray(coords[0])) {
        // GeoJSON [lon, lat] -> Leaflet [lat, lon]
        ring = (coords[0] as [number, number][]).map(([lon, lat]) => [Number(lat), Number(lon)]);
      }
    } else if (
      typeof parsed === 'object' &&
      parsed !== null &&
      (parsed as { type?: string }).type === 'Polygon'
    ) {
      const coords = (parsed as { coordinates?: unknown }).coordinates;
      if (Array.isArray(coords) && Array.isArray(coords[0])) {
        ring = (coords[0] as [number, number][]).map(([lon, lat]) => [Number(lat), Number(lon)]);
      }
    } else if (Array.isArray(parsed)) {
      // Legacy [lat, lon][] format
      ring = (parsed as [number, number][]).map(([lat, lon]) => [Number(lat), Number(lon)]);
    }

    // Remove closing duplicate vertex if present
    if (ring.length >= 2) {
      const first = ring[0];
      const last = ring[ring.length - 1];
      if (first[0] === last[0] && first[1] === last[1]) {
        ring = ring.slice(0, -1);
      }
    }

    return ring.filter(
      ([lat, lon]) =>
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
    );
  } catch {
    return [];
  }
}

export function computePolygonArea(points: [number, number][]): {
  sqMeters: number;
  acres: number;
  hectares: number;
} {
  if (points.length < 3) {
    return { sqMeters: 0, acres: 0, hectares: 0 };
  }
  const R = 6371000;
  const meanLat = (points.reduce((acc, p) => acc + p[0], 0) / points.length) * (Math.PI / 180);
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const [lat1, lon1] = points[i];
    const [lat2, lon2] = points[(i + 1) % points.length];
    const x1 = lon1 * (Math.PI / 180) * R * Math.cos(meanLat);
    const y1 = lat1 * (Math.PI / 180) * R;
    const x2 = lon2 * (Math.PI / 180) * R * Math.cos(meanLat);
    const y2 = lat2 * (Math.PI / 180) * R;
    area += x1 * y2 - x2 * y1;
  }
  const sqMeters = Math.abs(area) / 2;
  const acres = Math.round((sqMeters / 4046.8564) * 100) / 100;
  const hectares = Math.round((sqMeters / 10000) * 100) / 100;
  return { sqMeters, acres, hectares };
}

export function isValidPolygon(points: [number, number][]): boolean {
  if (points.length < 3) return false;
  const unique = new Set(points.map((p) => `${p[0].toFixed(6)},${p[1].toFixed(6)}`));
  if (unique.size < 3) return false;
  const { sqMeters } = computePolygonArea(points);
  return sqMeters >= 10; // At least 10 sq meters (prevents zero-area lines)
}
