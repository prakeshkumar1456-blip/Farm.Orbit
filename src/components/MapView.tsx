import L from 'leaflet';
import {
  Check,
  Crosshair,
  Layers,
  MapPin,
  PenTool,
  RotateCcw,
  Search,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TARGET_REGIONS } from '../data/agronomy';
import type { Translations } from '../i18n/translations';
import type { FarmProfile, LanguageCode } from '../types/farm';
import { computePolygonArea, isValidPolygon, parseGeojsonToPoints } from '../utils/geojson';

type NasaLayerId = 'none' | 'rainfall' | 'soil' | 'ndvi' | 'lst';

interface MapViewProps {
  language: LanguageCode;
  t: Translations;
  selectedLabel: string;
  selectedLat: number;
  selectedLon: number;
  savedFarms: FarmProfile[];
  activeFarm: FarmProfile | null;
  drawnBoundary: [number, number][];
  onUpdateBoundary: (coords: [number, number][]) => void;
  onSelectLocation: (label: string, lat: number, lon: number, farmId?: number | null) => void;
  onSaveBoundaryToFarm: (coords: [number, number][], approxAcres: number) => Promise<void>;
  onDeleteBoundaryFromFarm: () => Promise<void>;
}

function getSafeGibsDate(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getLatestModis8DayDate(): string {
  const now = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const startOfYear = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const doy = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const snappedDoy = Math.max(1, Math.floor((doy - 1) / 8) * 8 + 1);
  const target = new Date(startOfYear.getTime() + (snappedDoy - 1) * 24 * 60 * 60 * 1000);
  const y = target.getUTCFullYear();
  const m = String(target.getUTCMonth() + 1).padStart(2, '0');
  const day = String(target.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function createActivePinIcon(): L.DivIcon {
  return L.divIcon({
    className: 'farmorbit-active-pin',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#15803D;border:3px solid #FFFFFF;box-shadow:0 2px 8px rgba(0,0,0,0.35);">
      <div style="width:8px;height:8px;border-radius:9999px;background:#FFFFFF;"></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function createVertexIcon(index: number, highlightClose: boolean): L.DivIcon {
  const bg = highlightClose ? '#FEF08A' : '#FFFFFF';
  const border = highlightClose ? '#B45309' : '#15803D';
  return L.divIcon({
    className: 'farmorbit-vertex-handle',
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:9999px;background:${bg};border:2.5px solid ${border};color:#102617;font-size:11px;font-weight:700;box-shadow:0 2px 5px rgba(0,0,0,0.3);cursor:grab;">${index + 1}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export function MapView({
  language,
  t,
  selectedLabel,
  selectedLat,
  selectedLon,
  savedFarms,
  activeFarm,
  drawnBoundary,
  onUpdateBoundary,
  onSelectLocation,
  onSaveBoundaryToFarm,
  onDeleteBoundaryFromFarm,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const gibsLayerRef = useRef<L.TileLayer | null>(null);
  const markerLayerRef = useRef<L.FeatureGroup | null>(null);
  const polygonLayerRef = useRef<L.FeatureGroup | null>(null);

  // Refs keep Leaflet event listeners decoupled from React re-renders so the map never resets
  const isDrawingRef = useRef(false);
  const drawnBoundaryRef = useRef<[number, number][]>(drawnBoundary);
  const onUpdateBoundaryRef = useRef(onUpdateBoundary);
  const onSelectLocationRef = useRef(onSelectLocation);
  const lastCenteredCoordsRef = useRef<{ lat: number; lon: number } | null>(null);

  const [baseMap, setBaseMap] = useState<'street' | 'satellite'>('satellite');
  const [nasaLayer, setNasaLayer] = useState<NasaLayerId>('ndvi');
  const [opacity, setOpacity] = useState(0.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [savingBoundary, setSavingBoundary] = useState(false);
  const [tileWarning, setTileWarning] = useState(false);
  const [boundaryStatus, setBoundaryStatus] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ name: string; lat: number; lon: number }>>([]);
  const [manualLat, setManualLat] = useState(selectedLat.toFixed(4));
  const [manualLon, setManualLon] = useState(selectedLon.toFixed(4));
  const [coordError, setCoordError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  isDrawingRef.current = isDrawing;
  drawnBoundaryRef.current = drawnBoundary;
  onUpdateBoundaryRef.current = onUpdateBoundary;
  onSelectLocationRef.current = onSelectLocation;

  const layerDates = useMemo(
    () => ({
      rainfall: getSafeGibsDate(5),
      soil: getSafeGibsDate(6),
      ndvi: getLatestModis8DayDate(),
      lst: getSafeGibsDate(6),
    }),
    []
  );

  useEffect(() => {
    setManualLat(selectedLat.toFixed(4));
    setManualLon(selectedLon.toFixed(4));
  }, [selectedLat, selectedLon]);

  // Initialize Leaflet map ONCE on mount and clean up ONLY on unmount
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [selectedLat, selectedLon],
      zoom: 12,
      zoomControl: false,
    });
    lastCenteredCoordsRef.current = { lat: selectedLat, lon: selectedLon };

    markerLayerRef.current = L.featureGroup().addTo(map);
    polygonLayerRef.current = L.featureGroup().addTo(map);
    mapRef.current = map;

    // Single stable click listener that reads latest state via refs
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingRef.current) return;
      setBoundaryStatus(null);
      const nextPoint: [number, number] = [
        Math.round(e.latlng.lat * 100000) / 100000,
        Math.round(e.latlng.lng * 100000) / 100000,
      ];
      onUpdateBoundaryRef.current([...drawnBoundaryRef.current, nextPoint]);
    };
    map.on('click', handleMapClick);

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 120);

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      map.off('click', handleMapClick);
      map.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
      polygonLayerRef.current = null;
      baseLayerRef.current = null;
      gibsLayerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent accidental double-click zoom while placing polygon points
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (isDrawing) {
      map.doubleClickZoom.disable();
    } else {
      map.doubleClickZoom.enable();
    }
  }, [isDrawing]);

  // Center map smoothly only when selected coordinates actually change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const prev = lastCenteredCoordsRef.current;
    if (
      prev &&
      Math.abs(prev.lat - selectedLat) < 1e-6 &&
      Math.abs(prev.lon - selectedLon) < 1e-6
    ) {
      return;
    }
    lastCenteredCoordsRef.current = { lat: selectedLat, lon: selectedLon };
    map.setView([selectedLat, selectedLon], Math.max(map.getZoom(), 12), { animate: true });
  }, [selectedLat, selectedLon]);

  // Bottom tile layer (always zIndex 1 below overlays & polygon layers)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }

    setTileWarning(false);
    let errorCount = 0;

    const url =
      baseMap === 'satellite'
        ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution =
      baseMap === 'satellite'
        ? 'Imagery © Esri, Maxar, Earthstar Geographics'
        : '© OpenStreetMap contributors';

    const layer = L.tileLayer(url, {
      attribution,
      maxZoom: 18,
      zIndex: 1,
    });

    layer.on('tileerror', () => {
      errorCount += 1;
      if (errorCount >= 4) {
        setTileWarning(true);
      }
    });
    layer.on('tileload', () => {
      if (errorCount > 0) errorCount = 0;
    });

    layer.addTo(map);
    layer.bringToBack();
    baseLayerRef.current = layer;
  }, [baseMap]);

  // NASA GIBS overlay layer (zIndex 10, strictly above base imagery and below polygon overlayPane)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (gibsLayerRef.current) {
      map.removeLayer(gibsLayerRef.current);
      gibsLayerRef.current = null;
    }

    if (nasaLayer === 'none') return;

    const specs: Record<
      Exclude<NasaLayerId, 'none'>,
      { id: string; date: string; maxNativeZoom: number }
    > = {
      rainfall: {
        id: 'IMERG_Precipitation_Rate',
        date: layerDates.rainfall,
        maxNativeZoom: 6,
      },
      soil: {
        id: 'SMAP_L4_Analyzed_Surface_Soil_Moisture',
        date: layerDates.soil,
        maxNativeZoom: 6,
      },
      ndvi: {
        id: 'MODIS_Terra_NDVI_8Day',
        date: layerDates.ndvi,
        maxNativeZoom: 9,
      },
      lst: {
        id: 'MODIS_Terra_Land_Surface_Temp_Day',
        date: layerDates.lst,
        maxNativeZoom: 7,
      },
    };

    const spec = specs[nasaLayer];
    const tileUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${spec.id}/default/${spec.date}/GoogleMapsCompatible_Level${spec.maxNativeZoom}/{z}/{y}/{x}.png`;

    const overlay = L.tileLayer(tileUrl, {
      attribution: `NASA GIBS (${spec.id})`,
      opacity,
      maxNativeZoom: spec.maxNativeZoom,
      maxZoom: 18,
      zIndex: 10,
    }).addTo(map);

    gibsLayerRef.current = overlay;
  }, [nasaLayer, opacity, layerDates]);

  // Render target regions, saved farms, and active selection pin
  useEffect(() => {
    const group = markerLayerRef.current;
    if (!group) return;
    group.clearLayers();

    for (const r of TARGET_REGIONS) {
      const label = language === 'hi' ? r.nameHi : language === 'bn' ? r.nameBn : r.name;
      const circle = L.circleMarker([r.lat, r.lon], {
        radius: 7,
        color: '#14532D',
        weight: 2,
        fillColor: '#22C55E',
        fillOpacity: 0.9,
        interactive: !isDrawing,
      });
      if (!isDrawing) {
        circle.bindPopup(`<strong>${label}</strong><br/>${r.district}`);
        circle.on('click', () => {
          onSelectLocationRef.current(label, r.lat, r.lon, null);
        });
      }
      circle.addTo(group);
    }

    for (const farm of savedFarms) {
      const circle = L.circleMarker([farm.latitude, farm.longitude], {
        radius: 8,
        color: '#7C2D12',
        weight: 2,
        fillColor: '#F59E0B',
        fillOpacity: 0.95,
        interactive: !isDrawing,
      });
      if (!isDrawing) {
        circle.bindPopup(
          `<strong>${farm.name}</strong><br/>${farm.cropName} · ${farm.areaAcres} ${t.common.acresShort}`
        );
        circle.on('click', () => {
          onSelectLocationRef.current(farm.name, farm.latitude, farm.longitude, farm.id);
        });
      }
      circle.addTo(group);
    }

    const activeMarker = L.marker([selectedLat, selectedLon], {
      icon: createActivePinIcon(),
      zIndexOffset: 1000,
      interactive: !isDrawing,
    });
    if (!isDrawing) {
      activeMarker
        .bindPopup(
          `<strong>${selectedLabel}</strong><br/>Lat ${selectedLat.toFixed(4)}, Lon ${selectedLon.toFixed(4)}`
        )
        .bindTooltip(selectedLabel, { direction: 'top', offset: [0, -14] });
    }
    activeMarker.addTo(group);
  }, [
    language,
    savedFarms,
    selectedLat,
    selectedLon,
    selectedLabel,
    isDrawing,
    t.common.acresShort,
  ]);

  // Render saved farm polygons & active boundary polygon + draggable corner handles above the map
  useEffect(() => {
    const group = polygonLayerRef.current;
    if (!group) return;
    group.clearLayers();

    // Show non-active saved farm boundaries softly on the map
    for (const farm of savedFarms) {
      if (activeFarm && farm.id === activeFarm.id) continue;
      const pts = parseGeojsonToPoints(farm.boundaryGeojson);
      if (pts.length >= 3) {
        const savedPoly = L.polygon(pts, {
          color: '#D97706',
          weight: 2,
          dashArray: '5 5',
          fillColor: '#F59E0B',
          fillOpacity: 0.14,
          interactive: !isDrawing,
        });
        if (!isDrawing) {
          savedPoly.on('click', () => {
            onSelectLocationRef.current(farm.name, farm.latitude, farm.longitude, farm.id);
          });
        }
        savedPoly.addTo(group);
      }
    }

    let activeShape: L.Polyline | L.Polygon | null = null;

    if (drawnBoundary.length === 2) {
      activeShape = L.polyline(drawnBoundary, {
        color: '#16A34A',
        weight: 3,
        dashArray: '6 4',
        interactive: false,
      }).addTo(group);
    } else if (drawnBoundary.length >= 3) {
      activeShape = L.polygon(drawnBoundary, {
        color: '#15803D',
        weight: 3,
        fillColor: '#22C55E',
        fillOpacity: 0.25,
        interactive: false,
      }).addTo(group);
    }

    // Draggable vertex handles for editing and live preview during drag
    drawnBoundary.forEach((pt, idx) => {
      const canClickToClose = isDrawing && drawnBoundary.length >= 3 && idx === 0;
      const handle = L.marker(pt, {
        icon: createVertexIcon(idx, canClickToClose),
        draggable: true,
        zIndexOffset: 900,
      });

      if (canClickToClose) {
        handle.on('click', (ev) => {
          L.DomEvent.stopPropagation(ev);
          setIsDrawing(false);
        });
      }

      handle.on('drag', () => {
        if (!activeShape) return;
        const pos = handle.getLatLng();
        const liveCoords = drawnBoundary.map((p, i) =>
          i === idx ? ([pos.lat, pos.lng] as [number, number]) : p
        );
        activeShape.setLatLngs(liveCoords);
      });

      handle.on('dragend', () => {
        const pos = handle.getLatLng();
        const updated = [...drawnBoundary];
        updated[idx] = [
          Math.round(pos.lat * 100000) / 100000,
          Math.round(pos.lng * 100000) / 100000,
        ];
        setBoundaryStatus(null);
        onUpdateBoundaryRef.current(updated);
      });

      handle.addTo(group);
    });
  }, [drawnBoundary, savedFarms, activeFarm, isDrawing]);

  const { acres: approxAcres, hectares: approxHectares } = useMemo(
    () => computePolygonArea(drawnBoundary),
    [drawnBoundary]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`);
      const data = (await res.json()) as {
        results?: Array<{ name: string; lat: number; lon: number }>;
      };
      setSearchResults(data.results ?? []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleManualCoords = (e: React.FormEvent) => {
    e.preventDefault();
    setCoordError(null);
    const lat = Number(manualLat);
    const lon = Number(manualLon);
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      setCoordError(t.map.invalidCoordsError);
      return;
    }
    onSelectLocation(`(${lat.toFixed(4)}, ${lon.toFixed(4)})`, lat, lon, null);
    lastCenteredCoordsRef.current = { lat, lon };
    mapRef.current?.setView([lat, lon], 14, { animate: true });
  };

  const handleUseCurrentLocation = () => {
    setGeoError(null);
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setGeoError(t.map.locationErrorUnsupported);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Math.round(pos.coords.latitude * 10000) / 10000;
        const lon = Math.round(pos.coords.longitude * 10000) / 10000;
        setLocating(false);
        onSelectLocation(`${t.map.useMyLocation} (${lat}, ${lon})`, lat, lon, null);
        lastCenteredCoordsRef.current = { lat, lon };
        mapRef.current?.setView([lat, lon], 15, { animate: true });
      },
      () => {
        setLocating(false);
        setGeoError(t.map.locationErrorDenied);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveBoundary = async () => {
    setBoundaryStatus(null);
    if (!isValidPolygon(drawnBoundary)) {
      setBoundaryStatus({ type: 'error', text: t.map.invalidPolygonError });
      return;
    }

    setSavingBoundary(true);
    try {
      await onSaveBoundaryToFarm(drawnBoundary, approxAcres);
      setBoundaryStatus({ type: 'success', text: t.map.boundarySavedSuccess });
      setIsDrawing(false);
    } catch {
      setBoundaryStatus({ type: 'error', text: t.map.boundarySaveFailed });
    } finally {
      setSavingBoundary(false);
    }
  };

  const handleClearBoundary = async () => {
    setBoundaryStatus(null);
    setIsDrawing(false);
    try {
      await onDeleteBoundaryFromFarm();
      onUpdateBoundary([]);
      setBoundaryStatus({ type: 'success', text: t.map.boundaryDeletedSuccess });
    } catch {
      setBoundaryStatus({ type: 'error', text: t.map.boundarySaveFailed });
    }
  };

  const handleRedrawBoundary = () => {
    setBoundaryStatus(null);
    onUpdateBoundary([]);
    setIsDrawing(true);
  };

  const legendItems = useMemo(() => {
    if (nasaLayer === 'rainfall') {
      return [
        {
          color: '#60A5FA',
          text:
            language === 'hi'
              ? 'हल्की बारिश (0.1–2 मिमी/घंटा)'
              : language === 'bn'
              ? 'হালকা বৃষ্টি (০.১–২ মিমি/ঘণ্টা)'
              : 'Light rain (0.1–2 mm/hr)',
        },
        {
          color: '#2563EB',
          text:
            language === 'hi'
              ? 'मध्यम बारिश (2–10 मिमी/घंटा)'
              : language === 'bn'
              ? 'মাঝারি বৃষ্টি (২–১০ মিমি/ঘণ্টা)'
              : 'Moderate rain (2–10 mm/hr)',
        },
        {
          color: '#DC2626',
          text:
            language === 'hi'
              ? 'भारी बारिश (>10 मिमी/घंटा)'
              : language === 'bn'
              ? 'ভারী বৃষ্টি (>১০ মিমি/ঘণ্টা)'
              : 'Heavy rain (>10 mm/hr)',
        },
      ];
    }
    if (nasaLayer === 'soil') {
      return [
        {
          color: '#D97706',
          text:
            language === 'hi'
              ? 'सूखी ऊपरी मिट्टी (<0.15 m³/m³)'
              : language === 'bn'
              ? 'শুষ্ক উপরের মাটি (<0.15 m³/m³)'
              : 'Dry topsoil (<0.15 m³/m³)',
        },
        {
          color: '#65A30D',
          text:
            language === 'hi'
              ? 'मध्यम नमी (0.15–0.35 m³/m³)'
              : language === 'bn'
              ? 'মাঝারি আর্দ্রতা (0.15–0.35 m³/m³)'
              : 'Moderate moisture (0.15–0.35 m³/m³)',
        },
        {
          color: '#0284C7',
          text:
            language === 'hi'
              ? 'अधिक नमी / गीली (>0.35 m³/m³)'
              : language === 'bn'
              ? 'বেশি আর্দ্রতা (>0.35 m³/m³)'
              : 'Wet / saturated (>0.35 m³/m³)',
        },
      ];
    }
    if (nasaLayer === 'ndvi') {
      return [
        {
          color: '#B45309',
          text:
            language === 'hi'
              ? 'खाली जमीन / कम हरियाली (<0.2)'
              : language === 'bn'
              ? 'ফাঁকা জমি / কম সবুজ (<0.2)'
              : 'Bare soil / sparse cover (<0.2)',
        },
        {
          color: '#84CC16',
          text:
            language === 'hi'
              ? 'बढ़ती हुई फसल (0.2–0.5)'
              : language === 'bn'
              ? 'বাড়ন্ত ফসল (0.2–0.5)'
              : 'Emerging / moderate crop (0.2–0.5)',
        },
        {
          color: '#15803D',
          text:
            language === 'hi'
              ? 'घनी स्वस्थ हरियाली (>0.5)'
              : language === 'bn'
              ? 'ঘন সুস্থ ফসল (>0.5)'
              : 'Dense healthy vegetation (>0.5)',
        },
      ];
    }
    if (nasaLayer === 'lst') {
      return [
        {
          color: '#2563EB',
          text:
            language === 'hi'
              ? 'ठंडी सतह (<20 °C)'
              : language === 'bn'
              ? 'শীতল পৃষ্ঠ (<২০ °C)'
              : 'Cool surface (<20 °C)',
        },
        {
          color: '#FACC15',
          text:
            language === 'hi'
              ? 'सामान्य गर्म (20–32 °C)'
              : language === 'bn'
              ? 'স্বাভাবিক উষ্ণ (২০–৩২ °C)'
              : 'Warm surface (20–32 °C)',
        },
        {
          color: '#DC2626',
          text:
            language === 'hi'
              ? 'अधिक गर्म सतह (>32 °C)'
              : language === 'bn'
              ? 'অধিক উষ্ণ পৃষ্ঠ (>৩২ °C)'
              : 'Hot land surface (>32 °C)',
        },
      ];
    }
    return [];
  }, [nasaLayer, language]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white border border-[#DCE7DC] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#102617]">
            {t.map.title}
          </h1>
          <p className="text-sm sm:text-base text-[#445E4A] mt-1">{t.map.subtitle}</p>
        </div>

        {/* Quick Regional Jump Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {TARGET_REGIONS.map((r) => {
            const label = language === 'hi' ? r.nameHi : language === 'bn' ? r.nameBn : r.name;
            const isSelected =
              !activeFarm &&
              Math.abs(selectedLat - r.lat) < 0.01 &&
              Math.abs(selectedLon - r.lon) < 0.01;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onSelectLocation(label, r.lat, r.lon, null);
                }}
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold border cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#15803D] text-white border-[#15803D]'
                    : 'bg-[#F0F7F0] hover:bg-[#DFEEE0] text-[#15803D] border-[#C6DEC6]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split: Controls Sidebar + Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <aside className="lg:col-span-4 space-y-4">
          {/* Search, Geolocation & Coordinate Picker */}
          <div className="bg-white border border-[#DCE7DC] rounded-2xl p-5 space-y-4">
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={locating}
              className="w-full py-2.5 px-3 rounded-lg bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#15803D] border border-[#C6DEC6] text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Crosshair className="w-4 h-4" />
              <span>{locating ? t.map.locatingText : t.map.useMyLocation}</span>
            </button>
            {geoError && <p className="text-xs text-[#B91C1C]">{geoError}</p>}

            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5A7561] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.map.searchVillage}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#C8D9C8] text-sm text-[#102617]"
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="px-3.5 py-2 rounded-lg bg-[#15803D] text-white text-sm font-semibold cursor-pointer whitespace-nowrap disabled:opacity-60"
              >
                {searching ? t.common.loading : t.home.searchButton}
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="border border-[#DCE7DC] rounded-lg divide-y divide-[#EDF3ED] max-h-40 overflow-y-auto">
                {searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const shortName = res.name.split(',').slice(0, 2).join(', ');
                      onSelectLocation(shortName, res.lat, res.lon, null);
                      lastCenteredCoordsRef.current = { lat: res.lat, lon: res.lon };
                      mapRef.current?.setView([res.lat, res.lon], 14, { animate: true });
                      setSearchResults([]);
                    }}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-[#F3F9F3] cursor-pointer"
                  >
                    {res.name}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleManualCoords} className="space-y-2 pt-2 border-t border-[#EDF3ED]">
              <div className="text-xs font-semibold text-[#36543E]">{t.map.enterLatLon}</div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.0001"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  aria-label={t.dashboard.latLabel}
                  className="px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm font-mono tabular-nums"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={manualLon}
                  onChange={(e) => setManualLon(e.target.value)}
                  aria-label={t.dashboard.lonLabel}
                  className="px-3 py-2 rounded-lg border border-[#C8D9C8] text-sm font-mono tabular-nums"
                />
              </div>
              {coordError && <p className="text-xs text-[#B91C1C]">{coordError}</p>}
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#15803D] text-sm font-semibold cursor-pointer"
              >
                {t.map.applyCoords}
              </button>
            </form>
          </div>

          {/* Layer Switcher + Legend */}
          <div className="bg-white border border-[#DCE7DC] rounded-2xl p-5 space-y-4">
            <div className="space-y-2">
              <div className="text-xs font-bold text-[#2D4A35] flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#15803D]" />
                {t.map.baseMapLabel}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBaseMap('street')}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold border cursor-pointer ${
                    baseMap === 'street'
                      ? 'bg-[#15803D] text-white border-[#15803D]'
                      : 'bg-white text-[#24402C] border-[#C8D9C8]'
                  }`}
                >
                  {t.map.baseStreet}
                </button>
                <button
                  type="button"
                  onClick={() => setBaseMap('satellite')}
                  className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold border cursor-pointer ${
                    baseMap === 'satellite'
                      ? 'bg-[#15803D] text-white border-[#15803D]'
                      : 'bg-white text-[#24402C] border-[#C8D9C8]'
                  }`}
                >
                  {t.map.baseSatellite}
                </button>
              </div>
              {tileWarning && (
                <p className="text-xs text-[#B45309]">{t.map.tileLoadWarning}</p>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#EDF3ED]">
              <div className="text-xs font-bold text-[#2D4A35]">{t.map.nasaLayerLabel}</div>
              <div className="space-y-1.5">
                {(
                  [
                    { id: 'ndvi', label: t.map.layerNdvi },
                    { id: 'rainfall', label: t.map.layerRainfall },
                    { id: 'soil', label: t.map.layerSoilMoisture },
                    { id: 'lst', label: t.map.layerLst },
                    { id: 'none', label: t.map.layerNone },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setNasaLayer(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                      nasaLayer === item.id
                        ? 'bg-[#15803D] text-white border-[#15803D]'
                        : 'bg-[#F8FBF8] text-[#1E3B26] border-[#DCE7DC] hover:bg-[#ECF5EC]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {nasaLayer !== 'none' && (
              <div className="space-y-3 pt-2 border-t border-[#EDF3ED]">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#314F39] mb-1">
                    <span>{t.map.opacityLabel}</span>
                    <span className="tabular-nums">{Math.round(opacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min={0.15}
                    max={0.9}
                    step={0.05}
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full accent-[#15803D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-[#1B3A24]">{t.map.legendTitle}</div>
                  {legendItems.map((leg, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#314E38]">
                      <span
                        className="w-3.5 h-3.5 rounded-sm shrink-0 border border-black/15"
                        style={{ backgroundColor: leg.color }}
                      />
                      <span>{leg.text}</span>
                    </div>
                  ))}
                  <p className="text-[11px] text-[#5B7561] pt-1">
                    {t.map.layerDateNote}:{' '}
                    <span className="font-mono tabular-nums">{layerDates[nasaLayer]}</span>
                  </p>
                  <p className="text-[11px] text-[#5B7561]">{t.map.areaWarning}</p>
                </div>
              </div>
            )}
          </div>

          {/* Draw, Edit, Redraw, Delete, Save Field Boundary Tool */}
          <div className="bg-white border border-[#DCE7DC] rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#102617]">
              <PenTool className="w-4 h-4 text-[#15803D]" />
              <span>{t.map.drawBoundaryBtn}</span>
            </div>

            {isDrawing && (
              <p className="text-xs text-[#15803D] bg-[#EEF7EE] p-2.5 rounded-lg border border-[#C6DEC6]">
                {drawnBoundary.length >= 3 ? t.map.clickFirstPointHint : t.map.drawingActiveHint}
              </p>
            )}

            {!isDrawing && drawnBoundary.length >= 3 && (
              <p className="text-xs text-[#435E4A]">{t.map.editVerticesHint}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {!isDrawing ? (
                <button
                  type="button"
                  onClick={() => {
                    setBoundaryStatus(null);
                    setIsDrawing(true);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#15803D] hover:bg-[#166534] text-white text-sm font-semibold cursor-pointer"
                >
                  {t.map.drawBoundaryBtn}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDrawing(false)}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#1E3B26] text-white text-sm font-semibold cursor-pointer inline-flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{t.map.finishBoundaryBtn}</span>
                </button>
              )}

              {!isDrawing && drawnBoundary.length > 0 && (
                <button
                  type="button"
                  onClick={handleRedrawBoundary}
                  className="py-2.5 px-3 rounded-lg bg-[#F4F9F4] hover:bg-[#E4EFE4] text-[#1E3B26] border border-[#C8D9C8] text-sm font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t.map.redrawBoundaryBtn}</span>
                </button>
              )}

              {drawnBoundary.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setBoundaryStatus(null);
                    onUpdateBoundary(drawnBoundary.slice(0, -1));
                  }}
                  className="py-2.5 px-3 rounded-lg bg-[#F4F9F4] hover:bg-[#E4EFE4] text-[#1E3B26] border border-[#C8D9C8] text-sm font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>{t.map.undoPointBtn}</span>
                </button>
              )}

              {drawnBoundary.length > 0 && (
                <button
                  type="button"
                  onClick={() => void handleClearBoundary()}
                  className="py-2.5 px-3 rounded-lg bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#991B1B] text-sm font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t.map.clearBoundaryBtn}</span>
                </button>
              )}
            </div>

            {drawnBoundary.length >= 3 && (
              <div className="space-y-2.5 pt-2 border-t border-[#EDF3ED]">
                <div className="text-sm font-semibold text-[#102617] tabular-nums">
                  {t.map.approxAreaLabel}: {approxHectares} {t.map.hectaresUnit} ({approxAcres}{' '}
                  {t.common.acres})
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-semibold text-[#36543E]">
                    {t.map.boundaryCoordsLabel} ({drawnBoundary.length} {t.dashboard.pointsLabel})
                  </div>
                  <div className="max-h-28 overflow-y-auto rounded-lg bg-[#F7FBF7] border border-[#DCE7DC] p-2 text-[11px] font-mono tabular-nums text-[#26422D] space-y-0.5">
                    {drawnBoundary.map(([lat, lon], idx) => (
                      <div key={idx}>
                        #{idx + 1}: {lat.toFixed(5)}, {lon.toFixed(5)}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={savingBoundary}
                  onClick={() => void handleSaveBoundary()}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#EEF6EE] hover:bg-[#DFEEE0] text-[#15803D] border border-[#C6DEC6] text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {activeFarm
                    ? `${t.map.saveToFarmBtn} (${activeFarm.name})`
                    : t.map.saveToFarmBtn}
                </button>
              </div>
            )}

            {boundaryStatus && (
              <p
                className={`text-xs font-semibold ${
                  boundaryStatus.type === 'success' ? 'text-[#15803D]' : 'text-[#B91C1C]'
                }`}
              >
                {boundaryStatus.text}
              </p>
            )}
          </div>
        </aside>

        {/* Leaflet Map Canvas */}
        <div className="lg:col-span-8 bg-white border border-[#DCE7DC] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E3ECE3] flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#2F4D37]">
            <span className="inline-flex items-center gap-1.5 font-semibold">
              <MapPin className="w-4 h-4 text-[#15803D]" />
              {selectedLabel}
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono tabular-nums text-[#54705B]">
                {selectedLat.toFixed(4)}, {selectedLon.toFixed(4)}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomIn()}
                  aria-label={t.map.zoomIn}
                  title={t.map.zoomIn}
                  className="p-1.5 rounded-md border border-[#C8D9C8] bg-white hover:bg-[#EFF6EF] text-[#102617] cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomOut()}
                  aria-label={t.map.zoomOut}
                  title={t.map.zoomOut}
                  className="p-1.5 rounded-md border border-[#C8D9C8] bg-white hover:bg-[#EFF6EF] text-[#102617] cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Wrapper carries dynamic cursor class so Leaflet's mapContainerRef DOM classes are never overwritten by React */}
          <div
            className={`relative w-full h-[520px] lg:h-[680px] overflow-hidden ${
              isDrawing ? 'farmorbit-map-drawing' : ''
            }`}
          >
            <div ref={mapContainerRef} className="w-full h-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
