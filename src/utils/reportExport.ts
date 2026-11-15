import { jsPDF } from 'jspdf';
import type { FarmProfile, LanguageCode, NasaOverviewResponse } from '../types/farm';

export function downloadFarmCsv(
  locationLabel: string,
  overview: NasaOverviewResponse,
  activeFarm: FarmProfile | null
) {
  const rows: string[][] = [
    ['FarmOrbit Environmental Report'],
    ['Generated At', new Date().toISOString()],
    ['Location', locationLabel],
    ['Latitude', String(overview.coordinates.lat)],
    ['Longitude', String(overview.coordinates.lon)],
    ['Elevation (m)', String(overview.coordinates.elevationM ?? 'Unavailable')],
    ['Farm Name', activeFarm?.name ?? 'Regional Selection'],
    ['Current Crop', activeFarm?.cropName ?? 'Not specified'],
    ['Area (Acres)', activeFarm ? String(activeFarm.areaAcres) : 'Not specified'],
    ['NASA POWER Latest Date', overview.nasaPower.latestObservationDate ?? 'Unavailable'],
    ['30-Day Rainfall Total (mm)', String(overview.nasaPower.past30DaysRainfallMm ?? 'Unavailable')],
    ['14-Day Rainfall Total (mm)', String(overview.nasaPower.past14DaysRainfallMm ?? 'Unavailable')],
    [],
    [
      'Date',
      'Air Temp 2m (C)',
      'Max Temp (C)',
      'Min Temp (C)',
      'Rainfall PRECTOTCORR (mm/day)',
      'Relative Humidity (%)',
      'Surface Soil Wetness GWETTOP (0-1)',
      'Root Soil Wetness GWETROOT (0-1)',
      'Land Skin Temp TS (C)',
      'Solar Radiation (MJ/m2/day)',
    ],
  ];

  for (const pt of overview.nasaPower.dailySeries) {
    rows.push([
      pt.date,
      pt.t2m !== null ? String(pt.t2m) : '',
      pt.t2mMax !== null ? String(pt.t2mMax) : '',
      pt.t2mMin !== null ? String(pt.t2mMin) : '',
      pt.rainfallMm !== null ? String(pt.rainfallMm) : '',
      pt.humidityPct !== null ? String(pt.humidityPct) : '',
      pt.surfaceSoilWetness !== null ? String(pt.surfaceSoilWetness) : '',
      pt.rootSoilWetness !== null ? String(pt.rootSoilWetness) : '',
      pt.landSkinTempC !== null ? String(pt.landSkinTempC) : '',
      pt.solarRadiation !== null ? String(pt.solarRadiation) : '',
    ]);
  }

  const csvContent = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `FarmOrbit_${locationLabel.replace(/[^a-zA-Z0-9]+/g, '_')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadFarmPdf(
  locationLabel: string,
  overview: NasaOverviewResponse,
  activeFarm: FarmProfile | null,
  _lang: LanguageCode
) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  let y = 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(21, 128, 61);
  doc.text('FarmOrbit — Agricultural Satellite Summary', 40, y);
  y += 20;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(70, 90, 75);
  doc.text(`Smart Farming. Smarter Future.  |  Generated: ${new Date().toLocaleDateString()}`, 40, y);
  y += 24;

  doc.setDrawColor(210, 225, 210);
  doc.line(40, y, 555, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(16, 38, 23);
  doc.text('1. Farm & Location Details', 40, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const details = [
    `Location: ${locationLabel}`,
    `Coordinates: Lat ${overview.coordinates.lat.toFixed(4)}, Lon ${overview.coordinates.lon.toFixed(4)}`,
    `Elevation: ${overview.coordinates.elevationM !== null ? `${overview.coordinates.elevationM} m (${overview.coordinates.elevationSource})` : 'Unavailable'}`,
    `Farm Name: ${activeFarm?.name ?? 'Regional Point Selection'}`,
    `Current Crop: ${activeFarm?.cropName ?? 'Not specified'}  |  Season: ${activeFarm?.season ?? 'Not specified'}  |  Area: ${activeFarm ? `${activeFarm.areaAcres} acres` : 'N/A'}`,
  ];
  for (const line of details) {
    doc.text(line, 40, y);
    y += 16;
  }

  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. Verified NASA & Weather Observations', 40, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const latest = overview.nasaPower.latest;
  const metrics = [
    `NASA POWER Latest Date: ${overview.nasaPower.latestObservationDate ?? 'Unavailable'} (Grid: ${overview.nasaPower.spatialResolution})`,
    `Air Temperature (2m): ${latest?.t2m ?? 'N/A'} C (High ${latest?.t2mMax ?? 'N/A'} C / Low ${latest?.t2mMin ?? 'N/A'} C)`,
    `Land Surface Skin Temp (TS): ${latest?.landSkinTempC ?? 'N/A'} C`,
    `30-Day Cumulative Rainfall: ${overview.nasaPower.past30DaysRainfallMm ?? 'N/A'} mm | 14-Day: ${overview.nasaPower.past14DaysRainfallMm ?? 'N/A'} mm`,
    `Relative Humidity (RH2M): ${latest?.humidityPct ?? 'N/A'} %`,
    `Surface Soil Wetness (GWETTOP 0-5cm): ${latest?.surfaceSoilWetness !== null && latest?.surfaceSoilWetness !== undefined ? `${Math.round(latest.surfaceSoilWetness * 100)}%` : 'N/A'}`,
    `Root-Zone Soil Wetness (GWETROOT): ${latest?.rootSoilWetness !== null && latest?.rootSoilWetness !== undefined ? `${Math.round(latest.rootSoilWetness * 100)}%` : 'N/A'}`,
    `Open-Meteo Current Soil Moisture (0-1cm / 1-3cm): ${overview.openMeteo.soilMoisture0to1cm ?? 'N/A'} / ${overview.openMeteo.soilMoisture1to3cm ?? 'N/A'} m3/m3`,
    `Reference Evapotranspiration (ET0 today): ${overview.openMeteo.et0TodayMm ?? 'N/A'} mm/day`,
    `Latest ESA Sentinel-2 Pass: ${overview.sentinel2.datetime ? overview.sentinel2.datetime.slice(0, 10) : 'Unavailable'} (Cloud cover: ${overview.sentinel2.cloudCoverPct ?? 'N/A'}%)`,
  ];
  for (const line of metrics) {
    doc.text(line, 40, y);
    y += 15;
  }

  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. Active Environmental Alerts', 40, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (overview.alerts.length === 0) {
    doc.text('No unusual rainfall, heat, or soil wetness alerts triggered for this period.', 40, y);
    y += 16;
  } else {
    for (const al of overview.alerts) {
      const unitSuffix = al.unit ? ` ${al.unit}` : '';
      doc.text(
        `- [${al.severity.toUpperCase()}] ${al.code}: Observed ${al.observedNum}${unitSuffix} vs ${al.baselineNum}${unitSuffix} (${al.observationDate})`,
        40,
        y,
        { maxWidth: 515 }
      );
      y += 22;
    }
  }

  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(95, 110, 98);
  doc.text(
    'Disclaimer: Satellite grids (~10 km to 55 km) represent regional averages and are not exact single-plot ground sensors. Always verify soil moisture and salinity physically before sowing.',
    40,
    y,
    { maxWidth: 515 }
  );

  doc.save(`FarmOrbit_Report_${locationLabel.replace(/[^a-zA-Z0-9]+/g, '_')}.pdf`);
}
