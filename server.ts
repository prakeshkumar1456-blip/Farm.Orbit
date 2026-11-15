import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  createFarm,
  deleteFarm,
  getFarmById,
  listFarms,
  updateFarm,
  validateBoundaryGeojson,
} from './server/db.ts';
import {
  comparePurbaMedinipurLocations,
  getNasaHistory,
  getNasaOverview,
  searchLocations,
} from './server/nasaService.ts';
import type { LanguageCode } from './src/types/farm.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Initialize singleton Gemini client on server boot so first request has zero cold-init delay
const geminiClient = getGeminiClient();

function buildSystemInstruction(
  language: LanguageCode,
  locationLabel: string,
  lat: number,
  lon: number,
  cropName: string,
  nasaData: unknown
): string {
  const langName =
    language === 'hi'
      ? 'Hindi (pure everyday Devanagari script — avoid unnecessary English words; translate agricultural concepts naturally)'
      : language === 'bn'
      ? 'Bengali (pure everyday Bengali script used in West Bengal, India — avoid unnecessary English words; explain concepts naturally)'
      : 'English (in clear, warm, simple everyday words)';

  return `You are FarmOrbit AI, a helpful and honest agricultural advisor for smallholder farmers in Haldia, Tamluk, and Purba Medinipur, West Bengal, India.

LANGUAGE RULE:
- Respond strictly and completely in ${langName}.
- Keep sentences short, clear, warm, and easy for ordinary farmers to read or listen to.
- Whenever mentioning a scientific indicator (such as NDVI, soil wetness fraction GWETTOP, land surface temperature TS, or evapotranspiration ET0), ALWAYS explain what it means in everyday farming terms AND mention its limitation (for example, satellite grid averages cover ~10 km to ~55 km and are not an exact sensor inside one single rice plot).

DATA TRANSPARENCY & SEPARATION RULE:
- Clearly distinguish between:
  1) RECENT / LIVE OBSERVATIONS (e.g., Open-Meteo current hour weather, NASA POWER daily observations up to its latest date),
  2) HISTORICAL BASELINES (NASA POWER 20-year monthly climatology), and
  3) MODELLED / REGIONAL ESTIMATES (ERA5-Land soil moisture, ~55 km NASA POWER grid averages).
- Base every numeric fact ONLY on the verified telemetry JSON attached below.
- NEVER invent NASA numbers, NEVER pretend to know exact live plot-level soil chemistry, and NEVER guarantee crop yield or profit.
- Always state the observation date and data source name when quoting measurements.
- If a metric is null or unavailable in the context, state honestly that it is currently unavailable and advise checking local field soil moisture by hand or consulting the local Krishi Vigyan Kendra (KVK).
- For crop rotation questions, explain exploratory options suitable for Purba Medinipur (such as Aman paddy followed by Mustard, Green Gram/Moong, Potato, or Sesame/Til) along with water needs, benefits, and salinity/drainage cautions.

ACTIVE FARMER CONTEXT:
- Selected Location: ${locationLabel} (Lat ${lat.toFixed(4)}, Lon ${lon.toFixed(4)})
- Current / Selected Crop: ${cropName}
- Verified Environmental Telemetry Snapshot:
${JSON.stringify(nasaData ?? {}, null, 2)}
`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'FarmOrbit',
      aiConfigured: Boolean(geminiClient),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/ai/status', (_req, res) => {
    res.json({
      available: Boolean(geminiClient),
      model: 'gemini-4-hydrogen',
      languages: ['en', 'hi', 'bn'],
    });
  });

  // Farm profiles CRUD (SQLite)
  app.get('/api/farms', (_req, res) => {
    try {
      res.json({ farms: listFarms() });
    } catch (err) {
      res.status(500).json({ error: 'Could not read saved farms.', details: String(err) });
    }
  });

  app.post('/api/farms', (req, res) => {
    try {
      const { name, locationLabel, latitude, longitude, cropName, season, areaAcres, boundaryGeojson, notes } =
        req.body ?? {};
      if (
        !name ||
        typeof latitude !== 'number' ||
        typeof longitude !== 'number' ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        res.status(400).json({ error: 'Farm name and valid latitude/longitude are required.' });
        return;
      }

      if (boundaryGeojson !== undefined && boundaryGeojson !== null && boundaryGeojson !== '') {
        const check = validateBoundaryGeojson(String(boundaryGeojson));
        if (!check.valid) {
          res.status(400).json({ error: check.error || 'Invalid GeoJSON boundary coordinates.' });
          return;
        }
      }

      const created = createFarm({
        name: String(name),
        locationLabel: String(locationLabel || 'Purba Medinipur'),
        latitude,
        longitude,
        cropName: String(cropName || 'Aman Paddy'),
        season: String(season || 'Kharif'),
        areaAcres: typeof areaAcres === 'number' && areaAcres > 0 ? areaAcres : 1.0,
        boundaryGeojson: boundaryGeojson ? String(boundaryGeojson) : null,
        notes: notes ? String(notes) : '',
      });
      res.status(201).json({ farm: created });
    } catch (err) {
      res.status(500).json({ error: 'Could not save farm profile.', details: String(err) });
    }
  });

  app.put('/api/farms/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'Invalid farm id.' });
        return;
      }

      const body = req.body ?? {};
      if (body.boundaryGeojson !== undefined && body.boundaryGeojson !== null && body.boundaryGeojson !== '') {
        const check = validateBoundaryGeojson(String(body.boundaryGeojson));
        if (!check.valid) {
          res.status(400).json({ error: check.error || 'Invalid GeoJSON boundary coordinates.' });
          return;
        }
      }

      const updated = updateFarm(id, body);
      if (!updated) {
        res.status(404).json({ error: 'Farm profile not found.' });
        return;
      }
      res.json({ farm: updated });
    } catch (err) {
      res.status(500).json({ error: 'Could not update farm profile.', details: String(err) });
    }
  });

  app.delete('/api/farms/:id', (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: 'Invalid farm id.' });
        return;
      }
      const existing = getFarmById(id);
      if (!existing) {
        res.status(404).json({ error: 'Farm profile not found.' });
        return;
      }
      deleteFarm(id);
      res.json({ deleted: true });
    } catch (err) {
      res.status(500).json({ error: 'Could not delete farm profile.', details: String(err) });
    }
  });

  // NASA & Earth observation routes
  app.get('/api/nasa/overview', async (req, res) => {
    const lat = Number(req.query.lat ?? 22.0667);
    const lon = Number(req.query.lon ?? 88.0698);
    const label = String(req.query.label ?? 'Haldia, Purba Medinipur');

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      res.status(400).json({ error: 'Valid latitude and longitude coordinates are required.' });
      return;
    }

    try {
      const overview = await getNasaOverview(lat, lon, label);
      res.json(overview);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch NASA overview data.', details: String(err) });
    }
  });

  app.get('/api/nasa/history', async (req, res) => {
    const lat = Number(req.query.lat ?? 22.0667);
    const lon = Number(req.query.lon ?? 88.0698);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      res.status(400).json({ error: 'Valid coordinates required.' });
      return;
    }

    try {
      const history = await getNasaHistory(lat, lon);
      res.json(history);
    } catch (err) {
      res.status(500).json({ error: 'Failed to load NASA historical archive.', details: String(err) });
    }
  });

  app.get('/api/nasa/compare', async (req, res) => {
    const extraLat = req.query.lat ? Number(req.query.lat) : null;
    const extraLon = req.query.lon ? Number(req.query.lon) : null;
    const extraName = req.query.name ? String(req.query.name) : null;

    try {
      const extra =
        extraLat !== null &&
        extraLon !== null &&
        Number.isFinite(extraLat) &&
        Number.isFinite(extraLon) &&
        extraName
          ? { name: extraName, lat: extraLat, lon: extraLon }
          : undefined;
      const locations = await comparePurbaMedinipurLocations(extra);
      res.json({ locations });
    } catch (err) {
      res.status(500).json({ error: 'Failed to compare locations.', details: String(err) });
    }
  });

  app.get('/api/geocode', async (req, res) => {
    const q = String(req.query.q ?? '');
    try {
      const results = await searchLocations(q);
      res.json({ results });
    } catch (err) {
      res.status(500).json({ error: 'Location search failed.', details: String(err) });
    }
  });

  // FarmOrbit AI chat (Gemini API server-side)
  app.post('/api/ai/chat', async (req, res) => {
    const {
      messages = [],
      language = 'en',
      locationLabel = 'Haldia, Purba Medinipur',
      lat = 22.0667,
      lon = 88.0698,
      cropName = 'Aman Paddy',
      nasaData = null,
    } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Please send at least one message.' });
      return;
    }

    const ai = geminiClient ?? getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured in server secrets.',
      });
      return;
    }

    try {
      const contextData = nasaData ?? (await getNasaOverview(Number(lat), Number(lon), String(locationLabel)));
      const systemInstruction = buildSystemInstruction(
        language as LanguageCode,
        String(locationLabel),
        Number(lat),
        Number(lon),
        String(cropName),
        contextData
      );

      const formattedContents = messages
        .slice(-10)
        .map((m: { role?: string; content?: string }) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: String(m.content ?? '') }],
        }));

      let reply: string | undefined;
      let lastErr: unknown;
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: formattedContents,
            config: {
              systemInstruction,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          });
          reply = response.text?.trim();
          if (reply) break;
        } catch (err) {
          lastErr = err;
          if (attempt === 0) {
            await new Promise((r) => setTimeout(r, 600));
          }
        }
      }

      if (!reply) {
        throw lastErr ?? new Error('Empty response from AI model.');
      }

      res.json({ reply });
    } catch (err) {
      console.error('Gemini API error:', err);
      res.status(500).json({
        error: 'FarmOrbit AI could not respond right now. Please try again.',
        details: err instanceof Error ? err.message : String(err),
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FarmOrbit server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start FarmOrbit server:', err);
  process.exit(1);
});
