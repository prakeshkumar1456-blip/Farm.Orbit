import type { LanguageCode } from '../types/farm';

export type NavTab =
  | 'home'
  | 'dashboard'
  | 'map'
  | 'rotation'
  | 'alerts'
  | 'ai'
  | 'sources';

export interface Translations {
  brandName: string;
  tagline: string;
  regionFooter: string;
  nav: Record<NavTab, string>;
  langLabel: string;
  home: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    selectLocationLabel: string;
    searchPlaceholder: string;
    searchButton: string;
    noSearchResults: string;
    useCoordinates: string;
    askAiButton: string;
    viewFarmButton: string;
    openMapButton: string;
    quickOverviewTitle: string;
    quickOverviewNote: string;
    weatherCardTitle: string;
    rainfallCardTitle: string;
    soilCardTitle: string;
    vegetationCardTitle: string;
    explainBtn: string;
    observedOn: string;
    sourcePrefix: string;
    areaEstimateNote: string;
    loadingData: string;
    unavailable: string;
    modisMapFallback: string;
    sentinelModisSource: string;
    toolsTitle: string;
    toolRotationTitle: string;
    toolRotationDesc: string;
    toolMapTitle: string;
    toolMapDesc: string;
    toolAlertsTitle: string;
    toolAlertsDesc: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    farmProfileTitle: string;
    farmNamePlaceholder: string;
    addNewFarm: string;
    savedFarmsLabel: string;
    noSavedFarms: string;
    farmNameLabel: string;
    locationLabel: string;
    cropLabel: string;
    seasonLabel: string;
    seasonKharif: string;
    seasonRabi: string;
    seasonZaid: string;
    areaAcresLabel: string;
    latLabel: string;
    lonLabel: string;
    notesLabel: string;
    saveFarmBtn: string;
    updateFarmBtn: string;
    deleteFarmBtn: string;
    saveSuccessMsg: string;
    saveErrorMsg: string;
    drawOnMapHint: string;
    boundarySavedText: string;
    pointsLabel: string;
    savedTag: string;
    downloadPdfBtn: string;
    downloadCsvBtn: string;
    tempLabel: string;
    rainfallLabel: string;
    humidityLabel: string;
    soilMoistureLabel: string;
    landSkinTempLabel: string;
    vegetationLabel: string;
    elevationLabel: string;
    solarLabel: string;
    et0Label: string;
    highShort: string;
    lowShort: string;
    currentModelLabel: string;
    topsoil0cmLabel: string;
    askAiAboutCard: string;
    chartRainTempTitle: string;
    chartRainTempDesc: string;
    chartWaterTitle: string;
    chartWaterDesc: string;
    chartHistoryTitle: string;
    chartHistoryDesc: string;
    chartLegendRain: string;
    chartLegendMaxTemp: string;
    chartLegendMinTemp: string;
    chartLegendAnnualRain: string;
    chartLegendMeanTemp: string;
    chartAxisWetness: string;
    compareTitle: string;
    compareSubtitle: string;
    sentinelTitle: string;
    sentinelEmpty: string;
    passDateLabel: string;
    tileLabel: string;
    cloudCover: string;
    surfaceWetnessDesc: string;
    rootWetnessDesc: string;
    rainComparisonBelow: string;
    rainComparisonNormal: string;
    rainComparisonAbove: string;
  };
  map: {
    title: string;
    subtitle: string;
    searchVillage: string;
    enterLatLon: string;
    applyCoords: string;
    useMyLocation: string;
    locatingText: string;
    locationErrorDenied: string;
    locationErrorUnsupported: string;
    invalidCoordsError: string;
    zoomIn: string;
    zoomOut: string;
    baseMapLabel: string;
    baseStreet: string;
    baseSatellite: string;
    nasaLayerLabel: string;
    layerNone: string;
    layerRainfall: string;
    layerSoilMoisture: string;
    layerNdvi: string;
    layerLst: string;
    opacityLabel: string;
    drawBoundaryBtn: string;
    redrawBoundaryBtn: string;
    finishBoundaryBtn: string;
    undoPointBtn: string;
    clearBoundaryBtn: string;
    saveToFarmBtn: string;
    drawingActiveHint: string;
    clickFirstPointHint: string;
    editVerticesHint: string;
    approxAreaLabel: string;
    boundaryCoordsLabel: string;
    hectaresUnit: string;
    invalidPolygonError: string;
    boundarySavedSuccess: string;
    boundarySaveFailed: string;
    boundaryDeletedSuccess: string;
    legendTitle: string;
    layerDateNote: string;
    areaWarning: string;
    tileLoadWarning: string;
  };
  rotation: {
    title: string;
    subtitle: string;
    disclaimerBanner: string;
    currentCropLabel: string;
    locationLabel: string;
    soilTypeLabel: string;
    irrigationLabel: string;
    missingAssumptionNotice: string;
    currentConditionsTitle: string;
    optionsTitle: string;
    planTitle: string;
    planSubtitle: string;
    exploratoryTag: string;
    whySuggestedLabel: string;
    waterNeedLabel: string;
    seasonFitLabel: string;
    benefitsLabel: string;
    limitationsLabel: string;
    dataUsedLabel: string;
    askAiRotationBtn: string;
    lowWater: string;
    mediumWater: string;
    highWater: string;
    soilOptions: Record<'unknown' | 'alluvial_loam' | 'clay_loam' | 'sandy_loam' | 'coastal_saline', string>;
    irrigationOptions: Record<'unknown' | 'rainfed' | 'canal_pond' | 'tubewell', string>;
  };
  alerts: {
    title: string;
    subtitle: string;
    noAlertsTitle: string;
    noAlertsDesc: string;
    checkedSourcesLabel: string;
    latestObsLabel: string;
    whatHappened: string;
    recommendedAction: string;
    affectedArea: string;
    dataSource: string;
    observedDate: string;
    askAiAlertBtn: string;
    severityAttention: string;
    severityAdvisory: string;
    severityInfo: string;
    futureNote: string;
  };
  ai: {
    title: string;
    subtitle: string;
    readyStatus: string;
    unavailableStatus: string;
    welcomeGreeting: string;
    inputPlaceholder: string;
    sendBtn: string;
    retryBtn: string;
    voiceInputBtn: string;
    listeningLabel: string;
    voiceUnsupported: string;
    voicePermissionDenied: string;
    voiceNoSpeech: string;
    voiceFailed: string;
    autoSpeakLabel: string;
    listenBtn: string;
    stopBtn: string;
    starterTitle: string;
    contextBanner: string;
    dataDistinctionNote: string;
    thinkingText: string;
    errorFallback: string;
    clearChatBtn: string;
    starters: string[];
  };
  sources: {
    title: string;
    subtitle: string;
    truthBanner: string;
    colSource: string;
    colMeasures: string;
    colResolution: string;
    colLatestDate: string;
    colLimitations: string;
    liveApiLabel: string;
    gibsCompositeLabel: string;
    cmrCheckedLabel: string;
    hourlyLabel: string;
    rolling8DayLabel: string;
  };
  common: {
    loading: string;
    retry: string;
    close: string;
    acres: string;
    acresShort: string;
    hectaresShort: string;
    days14: string;
    days30: string;
    meters: string;
    mmUnit: string;
    mmPerYr: string;
    fetchError: string;
  };
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    brandName: 'FarmOrbit',
    tagline: 'Smart Farming. Smarter Future.',
    regionFooter: 'Haldia · Tamluk · Purba Medinipur, West Bengal',
    nav: {
      home: 'Home',
      dashboard: 'My Farm',
      map: 'Map',
      rotation: 'Crop Rotation',
      alerts: 'Alerts',
      ai: 'FarmOrbit AI',
      sources: 'Data Sources',
    },
    langLabel: 'Language',
    home: {
      welcomeTitle: 'Understand your farm’s weather, water, and crops with NASA data',
      welcomeSubtitle:
        'Built for farmers in Haldia, Tamluk, and Purba Medinipur. Check recent rainfall, soil moisture, temperature, and crop adaptation options in plain language.',
      selectLocationLabel: 'Select your area or saved farm',
      searchPlaceholder: 'Search village or town (e.g., Nandigram, Sutahata, Mahishadal)',
      searchButton: 'Search',
      noSearchResults: 'No matching village or town found. Try another nearby place.',
      useCoordinates: 'Set coordinates on Map',
      askAiButton: 'Ask FarmOrbit AI',
      viewFarmButton: 'View My Farm',
      openMapButton: 'Open Farm Map',
      quickOverviewTitle: 'Area Environmental Snapshot',
      quickOverviewNote:
        'Values below come from real NASA & satellite area grids (~10 km to 55 km). They describe your region, not an exact single-plot ground sensor.',
      weatherCardTitle: 'Current Weather & Temp',
      rainfallCardTitle: 'Recent Rainfall',
      soilCardTitle: 'Soil Moisture Indicator',
      vegetationCardTitle: 'Crop & Vegetation Check',
      explainBtn: 'Ask AI to explain',
      observedOn: 'Observed',
      sourcePrefix: 'Source',
      areaEstimateNote: 'Regional satellite estimate',
      loadingData: 'Loading real NASA observations...',
      unavailable: 'Currently unavailable',
      modisMapFallback: 'MODIS 250m Map',
      sentinelModisSource: 'ESA Sentinel-2 & NASA MODIS',
      toolsTitle: 'Simple Tools for Field Decisions',
      toolRotationTitle: 'Crop Rotation Helper',
      toolRotationDesc: 'Compare pulses, oilseeds, and vegetables suited to current soil moisture.',
      toolMapTitle: 'Interactive Satellite Map',
      toolMapDesc: 'Draw your field boundary and switch rainfall, soil, and vegetation layers.',
      toolAlertsTitle: 'Environmental Alerts',
      toolAlertsDesc: 'See if rainfall, heat, or soil wetness changed compared with historical norms.',
    },
    dashboard: {
      title: 'My Farm Dashboard',
      subtitle: 'Real satellite & weather indicators for your selected farm or area.',
      farmProfileTitle: 'My Farm Profile',
      farmNamePlaceholder: 'e.g., East Plot Haldia',
      addNewFarm: 'Add / Save New Farm',
      savedFarmsLabel: 'Saved Farms',
      noSavedFarms: 'No personal farm saved yet. Fill the form below to save your field details.',
      farmNameLabel: 'Farm Name',
      locationLabel: 'Village / Area Name',
      cropLabel: 'Current Crop',
      seasonLabel: 'Season',
      seasonKharif: 'Kharif (Monsoon)',
      seasonRabi: 'Rabi (Winter)',
      seasonZaid: 'Zaid (Summer)',
      areaAcresLabel: 'Area (Acres)',
      latLabel: 'Latitude',
      lonLabel: 'Longitude',
      notesLabel: 'Field Notes (soil type, drainage, irrigation)',
      saveFarmBtn: 'Save Farm Profile',
      updateFarmBtn: 'Update Farm Profile',
      deleteFarmBtn: 'Delete',
      saveSuccessMsg: 'Farm profile saved successfully.',
      saveErrorMsg: 'Could not save farm profile. Please check coordinates and try again.',
      drawOnMapHint: 'You can draw your exact field boundary on the Map page and attach it here.',
      boundarySavedText: 'Field boundary polygon saved',
      pointsLabel: 'points',
      savedTag: 'saved',
      downloadPdfBtn: 'Download PDF Report',
      downloadCsvBtn: 'Download CSV Data',
      tempLabel: 'Air Temperature (2m)',
      rainfallLabel: 'Rainfall (Past 30 Days)',
      humidityLabel: 'Relative Humidity',
      soilMoistureLabel: 'Surface Soil Moisture',
      landSkinTempLabel: 'Land Surface Skin Temp',
      vegetationLabel: 'Vegetation & Crop Cover',
      elevationLabel: 'Elevation (Terrain)',
      solarLabel: 'Solar Radiation',
      et0Label: 'Crop Water Loss (ET0)',
      highShort: 'High',
      lowShort: 'Low',
      currentModelLabel: 'Current model',
      topsoil0cmLabel: 'Topsoil 0 cm',
      askAiAboutCard: 'Ask AI about this',
      chartRainTempTitle: '30-Day Daily Rainfall & Temperature (NASA POWER)',
      chartRainTempDesc:
        'Blue bars show daily rainfall (mm). Amber and green lines show daily high and low air temperature (°C).',
      chartWaterTitle: 'Water Insights: Surface vs Root-Zone Soil Wetness',
      chartWaterDesc:
        'Shows how wet the top 0–5 cm soil and deeper 0–100 cm root zone have been over 30 days (0% = very dry, 100% = saturated).',
      chartHistoryTitle: 'Historical Multi-Year Comparison (2021–2025)',
      chartHistoryDesc:
        'Compare yearly estimated rainfall and average temperature from the NASA POWER archive to spot long-term shifts.',
      chartLegendRain: 'Rainfall (mm)',
      chartLegendMaxTemp: 'Max Temp (°C)',
      chartLegendMinTemp: 'Min Temp (°C)',
      chartLegendAnnualRain: 'Estimated Annual Rainfall (mm)',
      chartLegendMeanTemp: 'Mean Air Temp (°C)',
      chartAxisWetness: '% Wetness',
      compareTitle: 'Compare Purba Medinipur Locations',
      compareSubtitle: 'Side-by-side NASA POWER & terrain comparison across Haldia, Tamluk, and Contai.',
      sentinelTitle: 'Latest ESA Sentinel-2 Optical Satellite Pass',
      sentinelEmpty: 'No recent low-cloud optical preview found for this coordinate.',
      passDateLabel: 'Pass Date',
      tileLabel: 'Tile',
      cloudCover: 'Cloud cover',
      surfaceWetnessDesc: 'Topsoil wetness (0–5 cm)',
      rootWetnessDesc: 'Root-zone wetness (0–100 cm)',
      rainComparisonBelow: 'Rainfall over the past 14 days is lower than the 20-year historical monthly norm.',
      rainComparisonNormal: 'Rainfall over the past 14 days is close to the 20-year historical monthly norm.',
      rainComparisonAbove: 'Rainfall over the past 14 days is higher than the 20-year historical monthly norm.',
    },
    map: {
      title: 'Interactive Farm & Satellite Map',
      subtitle: 'Inspect Haldia, Tamluk, and Purba Medinipur with live NASA GIBS satellite layers.',
      searchVillage: 'Search village or town...',
      enterLatLon: 'Or enter exact coordinates',
      applyCoords: 'Go to Coordinates',
      useMyLocation: 'Use My Current Location',
      locatingText: 'Detecting location...',
      locationErrorDenied: 'Location permission denied or unavailable. Please search or select on the map.',
      locationErrorUnsupported: 'Geolocation is not supported by your browser.',
      invalidCoordsError: 'Please enter valid Latitude (-90 to 90) and Longitude (-180 to 180).',
      zoomIn: 'Zoom In',
      zoomOut: 'Zoom Out',
      baseMapLabel: 'Map View',
      baseStreet: 'Street & Villages',
      baseSatellite: 'Satellite Imagery',
      nasaLayerLabel: 'NASA Satellite Overlay',
      layerNone: 'None (Clean Map)',
      layerRainfall: 'Rainfall (NASA GPM IMERG)',
      layerSoilMoisture: 'Soil Moisture (NASA SMAP)',
      layerNdvi: 'Vegetation Health (MODIS NDVI)',
      layerLst: 'Land Surface Temp (MODIS LST)',
      opacityLabel: 'Overlay Opacity',
      drawBoundaryBtn: 'Draw Field Boundary',
      redrawBoundaryBtn: 'Redraw Boundary',
      finishBoundaryBtn: 'Finish Drawing',
      undoPointBtn: 'Undo Point',
      clearBoundaryBtn: 'Delete Boundary',
      saveToFarmBtn: 'Save Boundary to My Farm',
      drawingActiveHint: 'Click corners of your field on the map (at least 3 points). Drag any marker to adjust.',
      clickFirstPointHint: 'Click 3+ corners on the map, or click point 1 to close the boundary.',
      editVerticesHint: 'Drag corner pins anytime to edit your field shape before saving.',
      approxAreaLabel: 'Field Area',
      boundaryCoordsLabel: 'Boundary Coordinates',
      hectaresUnit: 'ha',
      invalidPolygonError: 'Please mark at least 3 distinct corners covering a valid field area.',
      boundarySavedSuccess: 'Field boundary saved as GeoJSON in your farm profile!',
      boundarySaveFailed: 'Failed to save boundary to the database. Please try again.',
      boundaryDeletedSuccess: 'Field boundary deleted.',
      legendTitle: 'Map Colour Guide',
      layerDateNote: 'Satellite overlay date',
      areaWarning: 'Satellite layers show regional pixel averages (250m to 10 km), not exact single-plant readings.',
      tileLoadWarning: 'Some satellite imagery tiles are slow to load right now; you can switch to Street & Villages view anytime.',
    },
    rotation: {
      title: 'Crop Rotation Helper',
      subtitle: 'Explore alternative crops suited to your current weather, soil type, and moisture conditions.',
      disclaimerBanner:
        'Exploratory Guidance Only: Suggestions combine real NASA environmental observations with local Purba Medinipur agricultural practices. Always verify soil salinity and seed availability with your local Krishi Vigyan Kendra before sowing. Crop yield or profit is never guaranteed.',
      currentCropLabel: 'Your Current / Previous Crop',
      locationLabel: 'Location',
      soilTypeLabel: 'Field Soil Type',
      irrigationLabel: 'Irrigation Availability',
      missingAssumptionNotice:
        'Soil type or irrigation source is set to Unknown — recommendations currently assume coastal Purba Medinipur alluvial loam with seasonal moisture. Select your exact soil and irrigation above for sharper guidance.',
      currentConditionsTitle: 'Observed NASA Conditions Used for Comparison',
      optionsTitle: 'Exploratory Crop Rotation Options',
      planTitle: 'Suggested 3-Season Field Rotation Plan',
      planSubtitle: 'Simple annual sequence balancing paddy, low-water legumes/oilseeds, and soil recovery.',
      exploratoryTag: 'Exploratory Option',
      whySuggestedLabel: 'Why Suggested Now',
      waterNeedLabel: 'Water Demand',
      seasonFitLabel: 'Growing Season',
      benefitsLabel: 'Key Benefits',
      limitationsLabel: 'Limitations & Things to Check',
      dataUsedLabel: 'NASA Data Checked',
      askAiRotationBtn: 'Discuss this crop with FarmOrbit AI',
      lowWater: 'Low water need',
      mediumWater: 'Moderate water need',
      highWater: 'High water need',
      soilOptions: {
        unknown: 'Unknown (Use regional assumption)',
        alluvial_loam: 'Alluvial Loam (Fertile river silt)',
        clay_loam: 'Heavy Clay Loam (Water-retentive)',
        sandy_loam: 'Sandy Loam (Fast-draining)',
        coastal_saline: 'Coastal Saline Soil (Haldia / Contai creeks)',
      },
      irrigationOptions: {
        unknown: 'Unknown (Assume rainfed + residual moisture)',
        rainfed: 'Rainfed Only (No pump/canal)',
        canal_pond: 'Seasonal Pond / Canal Support',
        tubewell: 'Tubewell / Assured Light Irrigation',
      },
    },
    alerts: {
      title: 'Smart Environmental Alerts',
      subtitle: 'Data-driven alerts comparing observed NASA & weather data against 20-year historical baselines.',
      noAlertsTitle: 'No Unusual Stress Alerts Right Now',
      noAlertsDesc:
        'Recent observed rainfall, temperature, and soil wetness fall within typical ranges for this period. Continue regular field inspections.',
      checkedSourcesLabel: 'Verified data sources checked',
      latestObsLabel: 'Latest verified observation date',
      whatHappened: 'What happened',
      recommendedAction: 'Recommended farmer action',
      affectedArea: 'Location',
      dataSource: 'Data source & scale',
      observedDate: 'Observation date',
      askAiAlertBtn: 'Ask AI what to check',
      severityAttention: 'Needs Attention',
      severityAdvisory: 'Advisory',
      severityInfo: 'Field Watch',
      futureNote: 'Note: FarmOrbit issues alerts strictly from verified satellite and weather observations — never unverified predictions.',
    },
    ai: {
      title: 'FarmOrbit AI Assistant',
      subtitle: 'Ask questions by typing or speaking in English, Hindi, or Bengali.',
      readyStatus: 'AI Ready (Gemini + Live NASA Context)',
      unavailableStatus: 'Gemini API key not configured on server',
      welcomeGreeting:
        'Namaste! Ask me about rainfall, soil moisture, temperature, alerts, or crop rotation for your selected area. I use real NASA observations and always explain what is measured vs estimated.',
      inputPlaceholder: 'Ask about rainfall, soil moisture, temperature, or crop rotation...',
      sendBtn: 'Send',
      retryBtn: 'Retry',
      voiceInputBtn: 'Speak',
      listeningLabel: 'Listening... speak clearly',
      voiceUnsupported: 'Voice input is not supported in this browser. You can still type your question below.',
      voicePermissionDenied: 'Microphone permission was denied. Please allow microphone access or type your question.',
      voiceNoSpeech: 'No speech detected. Please tap Speak and try again clearly.',
      voiceFailed: 'Voice recognition failed. Please type your question or try again.',
      autoSpeakLabel: 'Read answers aloud',
      listenBtn: 'Listen',
      stopBtn: 'Stop',
      starterTitle: 'Quick Farmer Questions',
      contextBanner: 'Using verified NASA data for',
      dataDistinctionNote: 'Responses distinguish live weather, historical 20-year averages, and satellite grid estimates.',
      thinkingText: 'Checking NASA observations and preparing a simple answer...',
      errorFallback: 'FarmOrbit AI could not respond right now. Please tap Retry.',
      clearChatBtn: 'New Chat',
      starters: [
        'Is the recent weather suitable for my crop right now?',
        'How is the rainfall trend in my area compared to normal?',
        'What is the soil moisture condition in this area?',
        'Which crop rotation options should I explore after paddy?',
        'Is there any drought or flood risk based on recent NASA data?',
      ],
    },
    sources: {
      title: 'Data Sources & Transparency',
      subtitle: 'Where every number and satellite map in FarmOrbit comes from, and what each dataset can and cannot measure.',
      truthBanner:
        'FarmOrbit never invents NASA observations or displays sample figures as real measurements. Satellite grids cover areas from 70 meters to ~55 km — always pair satellite insights with physical checks in your field.',
      colSource: 'Dataset / Mission',
      colMeasures: 'What It Measures',
      colResolution: 'Spatial Resolution',
      colLatestDate: 'Latest Verified Date',
      colLimitations: 'Known Limitations',
      liveApiLabel: 'Live API',
      gibsCompositeLabel: 'Latest GIBS Composite',
      cmrCheckedLabel: 'Checked via NASA CMR',
      hourlyLabel: 'Hourly',
      rolling8DayLabel: '8-day rolling composite',
    },
    common: {
      loading: 'Loading...',
      retry: 'Try Again',
      close: 'Close',
      acres: 'acres',
      acresShort: 'ac',
      hectaresShort: 'ha',
      days14: '14 days',
      days30: '30 days',
      meters: 'm',
      mmUnit: 'mm',
      mmPerYr: 'mm/yr',
      fetchError: 'Unable to load NASA observations right now.',
    },
  },
  hi: {
    brandName: 'FarmOrbit',
    tagline: 'स्मार्ट खेती। बेहतर भविष्य।',
    regionFooter: 'हल्दिया · तमलुक · पूर्व मेदिनीपुर, पश्चिम बंगाल',
    nav: {
      home: 'होम',
      dashboard: 'मेरा खेत',
      map: 'नक्शा',
      rotation: 'फसल चक्र',
      alerts: 'चेतावनी',
      ai: 'फार्मऑर्बिट AI',
      sources: 'डेटा स्रोत',
    },
    langLabel: 'भाषा',
    home: {
      welcomeTitle: 'NASA डेटा की मदद से अपने खेत का मौसम, पानी और फसल समझें',
      welcomeSubtitle:
        'हल्दिया, तमलुक और पूर्व मेदिनीपुर के किसानों के लिए। आसान हिंदी में हाल की बारिश, मिट्टी की नमी, तापमान और फसल विकल्प देखें।',
      selectLocationLabel: 'अपना क्षेत्र या सहेजा गया खेत चुनें',
      searchPlaceholder: 'गाँव या कस्बा खोजें (जैसे नंदीग्राम, सुताहाटा, महिषादल)',
      searchButton: 'खोजें',
      noSearchResults: 'कोई मिलता-जुलता गाँव या कस्बा नहीं मिला। कृपया दूसरा नाम खोजें।',
      useCoordinates: 'नक्शे पर स्थान चुनें',
      askAiButton: 'FarmOrbit AI से पूछें',
      viewFarmButton: 'मेरा खेत देखें',
      openMapButton: 'खेत का नक्शा खोलें',
      quickOverviewTitle: 'क्षेत्र की पर्यावरणीय स्थिति',
      quickOverviewNote:
        'नीचे दिए गए आंकड़े असली NASA और उपग्रह क्षेत्र ग्रिड (~10 से 55 किमी) से हैं। यह पूरे इलाके का अनुमान है, किसी एक खेत का जमीन-स्तरीय सेंसर नहीं।',
      weatherCardTitle: 'ताजा मौसम और तापमान',
      rainfallCardTitle: 'हाल की बारिश',
      soilCardTitle: 'मिट्टी की नमी का संकेत',
      vegetationCardTitle: 'फसल और हरियाली की जांच',
      explainBtn: 'AI से समझें',
      observedOn: 'जांच की तारीख',
      sourcePrefix: 'स्रोत',
      areaEstimateNote: 'क्षेत्रीय उपग्रह अनुमान',
      loadingData: 'असली NASA डेटा लोड हो रहा है...',
      unavailable: 'अभी उपलब्ध नहीं है',
      modisMapFallback: 'MODIS 250मी नक्शा',
      sentinelModisSource: 'ESA Sentinel-2 और NASA MODIS',
      toolsTitle: 'खेती के फैसलों के लिए आसान साधन',
      toolRotationTitle: 'फसल चक्र सहायक',
      toolRotationDesc: 'मौजूदा मिट्टी की नमी के अनुसार दाल, सरसों और सब्जियों के विकल्प देखें।',
      toolMapTitle: 'सैटेलाइट खेत नक्शा',
      toolMapDesc: 'अपने खेत की सीमा बनाएं और बारिश, मिट्टी की नमी व हरियाली की परत देखें।',
      toolAlertsTitle: 'स्मार्ट चेतावनी',
      toolAlertsDesc: 'जानें कि सामान्य इतिहास की तुलना में बारिश, गर्मी या नमी में क्या बदलाव हुआ।',
    },
    dashboard: {
      title: 'मेरा खेत डैशबोर्ड',
      subtitle: 'आपके चुने गए खेत या क्षेत्र के लिए असली उपग्रह और मौसम आंकड़े।',
      farmProfileTitle: 'मेरे खेत की जानकारी',
      farmNamePlaceholder: 'जैसे: पूर्वी खेत हल्दिया',
      addNewFarm: 'नया खेत जोड़ें / सहेजें',
      savedFarmsLabel: 'सहेजे गए खेत',
      noSavedFarms: 'अभी कोई खेत सहेजा नहीं गया है। अपना खेत जोड़ने के लिए नीचे जानकारी भरें।',
      farmNameLabel: 'खेत का नाम',
      locationLabel: 'गाँव / क्षेत्र का नाम',
      cropLabel: 'मौजूदा फसल',
      seasonLabel: 'मौसम / सीजन',
      seasonKharif: 'खरीफ (मानसून)',
      seasonRabi: 'रबी (सर्दी)',
      seasonZaid: 'जायद (गर्मी)',
      areaAcresLabel: 'क्षेत्रफल (एकड़)',
      latLabel: 'अक्षांश (Latitude)',
      lonLabel: 'देशांतर (Longitude)',
      notesLabel: 'खेत के नोट्स (मिट्टी, सिंचाई, जल निकासी)',
      saveFarmBtn: 'खेत सहेजें',
      updateFarmBtn: 'खेत अपडेट करें',
      deleteFarmBtn: 'हटाएं',
      saveSuccessMsg: 'खेत की जानकारी सफलतापूर्वक सहेजी गई।',
      saveErrorMsg: 'खेत सहेजा नहीं जा सका। कृपया सही जानकारी जांचकर दोबारा कोशिश करें।',
      drawOnMapHint: 'आप नक्शे पर अपने खेत की सीमा खींचकर यहां जोड़ सकते हैं।',
      boundarySavedText: 'खेत की GeoJSON सीमा सहेजी गई',
      pointsLabel: 'बिंदु',
      savedTag: 'सहेजा गया',
      downloadPdfBtn: 'PDF रिपोर्ट डाउनलोड करें',
      downloadCsvBtn: 'CSV डेटा डाउनलोड करें',
      tempLabel: 'हवा का तापमान (2 मी)',
      rainfallLabel: 'बारिश (पिछले 30 दिन)',
      humidityLabel: 'हवा में नमी',
      soilMoistureLabel: 'ऊपरी मिट्टी की नमी',
      landSkinTempLabel: 'जमीन की सतह का तापमान',
      vegetationLabel: 'फसल और हरियाली जांच',
      elevationLabel: 'ऊंचाई (जमीन स्तर)',
      solarLabel: 'धूप / सौर ऊर्जा',
      et0Label: 'फसल पानी वाष्पीकरण (ET0)',
      highShort: 'अधिकतम',
      lowShort: 'न्यूनतम',
      currentModelLabel: 'ताजा मॉडल',
      topsoil0cmLabel: 'ऊपरी मिट्टी 0 सेमी',
      askAiAboutCard: 'AI से इसके बारे में पूछें',
      chartRainTempTitle: 'पिछले 30 दिनों की बारिश और तापमान (NASA POWER)',
      chartRainTempDesc: 'नीली पट्टियां रोज की बारिश (मिमी) और रेखाएं अधिकतम व न्यूनतम तापमान (°C) दिखाती हैं।',
      chartWaterTitle: 'पानी की जानकारी: ऊपरी बनाम गहरी जड़ की नमी',
      chartWaterDesc: 'दिखाता है कि पिछले 30 दिनों में ऊपरी 0–5 सेमी और गहरी 0–100 सेमी मिट्टी कितनी गीली रही।',
      chartHistoryTitle: 'पिछले वर्षों से तुलना (2021–2025)',
      chartHistoryDesc: 'लंबे समय के बदलाव को समझने के लिए NASA POWER के सालाना बारिश और तापमान की तुलना करें।',
      chartLegendRain: 'बारिश (मिमी)',
      chartLegendMaxTemp: 'अधिकतम तापमान (°C)',
      chartLegendMinTemp: 'न्यूनतम तापमान (°C)',
      chartLegendAnnualRain: 'अनुमानित सालाना बारिश (मिमी)',
      chartLegendMeanTemp: 'औसत हवा तापमान (°C)',
      chartAxisWetness: '% नमी',
      compareTitle: 'पूर्व मेदिनीपुर के क्षेत्रों की तुलना',
      compareSubtitle: 'हल्दिया, तमलुक और कांथी के NASA आंकड़ों की सीधी तुलना।',
      sentinelTitle: 'ताजा ESA Sentinel-2 उपग्रह चित्र जानकारी',
      sentinelEmpty: 'इस स्थान के लिए कम बादल वाला ताजा चित्र उपलब्ध नहीं है।',
      passDateLabel: 'उपग्रह तारीख',
      tileLabel: 'टाइल्स',
      cloudCover: 'बादल',
      surfaceWetnessDesc: 'ऊपरी मिट्टी नमी (0–5 सेमी)',
      rootWetnessDesc: 'जड़ क्षेत्र नमी (0–100 सेमी)',
      rainComparisonBelow: 'पिछले 14 दिनों की बारिश 20-साल के ऐतिहासिक औसत से कम रही है।',
      rainComparisonNormal: 'पिछले 14 दिनों की बारिश 20-साल के ऐतिहासिक औसत के करीब है।',
      rainComparisonAbove: 'पिछले 14 दिनों की बारिश 20-साल के ऐतिहासिक औसत से अधिक रही है।',
    },
    map: {
      title: 'इंटरैक्टिव खेत और सैटेलाइट नक्शा',
      subtitle: 'लाइव NASA GIBS उपग्रह परतों के साथ हल्दिया, तमलुक और पूर्व मेदिनीपुर देखें।',
      searchVillage: 'गाँव या शहर खोजें...',
      enterLatLon: 'या अक्षांश / देशांतर दर्ज करें',
      applyCoords: 'स्थान पर जाएं',
      useMyLocation: 'मेरा वर्तमान स्थान उपयोग करें',
      locatingText: 'स्थान खोजा जा रहा है...',
      locationErrorDenied: 'स्थान की अनुमति नहीं मिली। कृपया नक्शे पर चुनें या गाँव खोजें।',
      locationErrorUnsupported: 'आपका ब्राउज़र स्थान पहचान का समर्थन नहीं करता।',
      invalidCoordsError: 'कृपया सही अक्षांश (-90 से 90) और देशांतर (-180 से 180) दर्ज करें।',
      zoomIn: 'ज़ूम बढ़ाएं',
      zoomOut: 'ज़ूम घटाएं',
      baseMapLabel: 'नक्शे का रूप',
      baseStreet: 'सड़क और गाँव',
      baseSatellite: 'सैटेलाइट फोटो',
      nasaLayerLabel: 'NASA उपग्रह परत',
      layerNone: 'कोई नहीं (साफ नक्शा)',
      layerRainfall: 'बारिश (NASA GPM IMERG)',
      layerSoilMoisture: 'मिट्टी की नमी (NASA SMAP)',
      layerNdvi: 'फसल हरियाली (MODIS NDVI)',
      layerLst: 'जमीन की गर्मी (MODIS LST)',
      opacityLabel: 'परत की पारदर्शिता',
      drawBoundaryBtn: 'खेत की सीमा बनाएं',
      redrawBoundaryBtn: 'सीमा दोबारा बनाएं',
      finishBoundaryBtn: 'सीमा पूरी करें',
      undoPointBtn: 'पिछला बिंदु हटाएं',
      clearBoundaryBtn: 'सीमा हटाएं',
      saveToFarmBtn: 'मेरे खेत में सहेजें',
      drawingActiveHint: 'नक्शे पर अपने खेत के कोनों पर क्लिक करें (कम से कम 3 बिंदु)। सुधार के लिए बिंदु खींचें।',
      clickFirstPointHint: 'कम से कम 3 कोने चुनें, या सीमा बंद करने के लिए बिंदु 1 पर क्लिक करें।',
      editVerticesHint: 'सहेजने से पहले कोनों को खींचकर सीमा बदल सकते हैं।',
      approxAreaLabel: 'खेत का क्षेत्रफल',
      boundaryCoordsLabel: 'सीमा के निर्देशांक',
      hectaresUnit: 'हेक्टेयर',
      invalidPolygonError: 'कृपया कम से कम 3 अलग-अलग कोने चुनें जिनका क्षेत्रफल शून्य से अधिक हो।',
      boundarySavedSuccess: 'खेत की सीमा GeoJSON के रूप में सफलतापूर्वक सहेजी गई!',
      boundarySaveFailed: 'डेटाबेस में सीमा सहेजी नहीं जा सकी। कृपया दोबारा कोशिश करें।',
      boundaryDeletedSuccess: 'खेत की सीमा हटाई गई।',
      legendTitle: 'नक्शे के रंगों का अर्थ',
      layerDateNote: 'उपग्रह परत की तारीख',
      areaWarning: 'उपग्रह परतें पूरे क्षेत्र का औसत (250 मीटर से 10 किमी) दिखाती हैं, एक अकेले पौधे का माप नहीं।',
      tileLoadWarning: 'कुछ सैटेलाइट टाइल्स लोड होने में समय ले रही हैं; आप "सड़क और गाँव" नक्शा भी देख सकते हैं।',
    },
    rotation: {
      title: 'फसल चक्र सहायक',
      subtitle: 'मौजूदा मौसम, मिट्टी के प्रकार और नमी के आधार पर वैकल्पिक फसलों की जानकारी देखें।',
      disclaimerBanner:
        'केवल मार्गदर्शन के लिए: ये विकल्प असली NASA डेटा और पूर्व मेदिनीपुर की स्थानीय खेती के आधार पर हैं। बुवाई से पहले अपने नजदीकी कृषि विज्ञान केंद्र (KVK) से मिट्टी और बीज की जांच जरूर करें। पैदावार या मुनाफे की कोई गारंटी नहीं है।',
      currentCropLabel: 'आपकी मौजूदा / पिछली फसल',
      locationLabel: 'स्थान',
      soilTypeLabel: 'खेत की मिट्टी का प्रकार',
      irrigationLabel: 'सिंचाई की सुविधा',
      missingAssumptionNotice:
        'मिट्टी का प्रकार या सिंचाई की जानकारी अभी "अज्ञात" है — इसलिए पूर्व मेदिनीपुर की सामान्य जलोढ़ दोमट मिट्टी और मौसमी नमी मानकर सुझाव दिखाए जा रहे हैं। सटीक सुझाव के लिए ऊपर अपनी मिट्टी और सिंचाई चुनें।',
      currentConditionsTitle: 'तुलना के लिए उपयोग किए गए ताजा NASA हालात',
      optionsTitle: 'फसल चक्र के संभावित विकल्प',
      planTitle: '3-सीजन फसल चक्र योजना',
      planSubtitle: 'धान, कम पानी वाली दलहन/तिलहन और मिट्टी की उर्वरता बचाने का आसान वार्षिक क्रम।',
      exploratoryTag: 'वैकल्पिक सुझाव',
      whySuggestedLabel: 'यह अभी क्यों उपयोगी है',
      waterNeedLabel: 'पानी की जरूरत',
      seasonFitLabel: 'उगाने का मौसम',
      benefitsLabel: 'मुख्य लाभ',
      limitationsLabel: 'सीमाएं और ध्यान देने योग्य बातें',
      dataUsedLabel: 'उपयोग किया गया NASA डेटा',
      askAiRotationBtn: 'FarmOrbit AI से इस फसल पर बात करें',
      lowWater: 'कम पानी की जरूरत',
      mediumWater: 'मध्यम पानी की जरूरत',
      highWater: 'ज्यादा पानी की जरूरत',
      soilOptions: {
        unknown: 'अज्ञात (क्षेत्रीय अनुमान का उपयोग करें)',
        alluvial_loam: 'जलोढ़ दोमट मिट्टी (उपजाऊ नदी मिट्टी)',
        clay_loam: 'चिकनी दोमट मिट्टी (ज्यादा नमी रोकने वाली)',
        sandy_loam: 'बलुई दोमट मिट्टी (तेज जल निकासी वाली)',
        coastal_saline: 'तटीय खारी मिट्टी (हल्दिया / कांथी क्षेत्र)',
      },
      irrigationOptions: {
        unknown: 'अज्ञात (वर्षा आधारित अनुमान)',
        rainfed: 'केवल बारिश पर निर्भर (कोई पंप/नहर नहीं)',
        canal_pond: 'तालाब / नहर से मौसमी सिंचाई',
        tubewell: 'ट्यूबवेल / पंप से हल्की सिंचाई उपलब्ध',
      },
    },
    alerts: {
      title: 'स्मार्ट पर्यावरणीय चेतावनी',
      subtitle: '20-साल के ऐतिहासिक औसत की तुलना में असली NASA और मौसम आंकड़ों पर आधारित चेतावनी।',
      noAlertsTitle: 'अभी कोई असामान्य तनाव चेतावनी नहीं है',
      noAlertsDesc:
        'हाल की बारिश, तापमान और मिट्टी की नमी इस मौसम के सामान्य स्तर के भीतर हैं। खेत की नियमित जांच जारी रखें।',
      checkedSourcesLabel: 'जांचे गए डेटा स्रोत',
      latestObsLabel: 'ताजा जांच तारीख',
      whatHappened: 'क्या बदलाव दिखा',
      recommendedAction: 'किसान के लिए सलाह',
      affectedArea: 'स्थान',
      dataSource: 'डेटा स्रोत और पैमाना',
      observedDate: 'जांच की तारीख',
      askAiAlertBtn: 'AI से पूछें खेत में क्या जांचें',
      severityAttention: 'ध्यान दें',
      severityAdvisory: 'सलाह',
      severityInfo: 'निगरानी',
      futureNote: 'नोट: FarmOrbit केवल असली जांच पर चेतावनी देता है, बिना आधार की भविष्यवाणी नहीं दिखाता।',
    },
    ai: {
      title: 'FarmOrbit AI सहायक',
      subtitle: 'हिंदी, अंग्रेजी या बांग्ला में लिखकर या बोलकर सवाल पूछें।',
      readyStatus: 'AI तैयार है (Gemini + असली NASA डेटा)',
      unavailableStatus: 'सर्वर पर Gemini API कुंजी सेट नहीं है',
      welcomeGreeting:
        'नमस्ते! आप अपने चुने हुए क्षेत्र की बारिश, मिट्टी की नमी, तापमान, चेतावनी या फसल चक्र के बारे में पूछ सकते हैं। मैं असली NASA आंकड़ों के आधार पर आसान हिंदी में जवाब दूँगा।',
      inputPlaceholder: 'बारिश, मिट्टी की नमी, तापमान या फसल चक्र के बारे में पूछें...',
      sendBtn: 'भेजें',
      retryBtn: 'दोबारा कोशिश करें',
      voiceInputBtn: 'बोलें',
      listeningLabel: 'सुन रहे हैं... कृपया साफ बोलें',
      voiceUnsupported: 'इस ब्राउज़र में आवाज से पूछने की सुविधा उपलब्ध नहीं है। आप नीचे लिखकर पूछ सकते हैं।',
      voicePermissionDenied: 'माइक्रोफोन की अनुमति नहीं मिली। कृपया अनुमति दें या नीचे लिखकर पूछें।',
      voiceNoSpeech: 'कोई आवाज सुनाई नहीं दी। कृपया "बोलें" दबाकर साफ बोलें।',
      voiceFailed: 'आवाज पहचानने में समस्या आई। कृपया लिखकर पूछें या दोबारा कोशिश करें।',
      autoSpeakLabel: 'जवाब बोलकर सुनाएं',
      listenBtn: 'सुनें',
      stopBtn: 'रोकें',
      starterTitle: 'किसानों के आम सवाल',
      contextBanner: 'असली NASA डेटा का उपयोग:',
      dataDistinctionNote: 'जवाब में ताजा मौसम, 20-साल के ऐतिहासिक औसत और उपग्रह अनुमान को अलग बताया जाता है।',
      thinkingText: 'NASA आंकड़ों की जांच करके आसान जवाब तैयार कर रहे हैं...',
      errorFallback: 'FarmOrbit AI अभी जवाब नहीं दे सका। कृपया "दोबारा कोशिश करें" दबाएं।',
      clearChatBtn: 'नई बातचीत',
      starters: [
        'क्या मेरी फसल के लिए अभी का मौसम अनुकूल है?',
        'मेरे क्षेत्र में बारिश सामान्य की तुलना में कैसी रही है?',
        'इस क्षेत्र में मिट्टी की नमी की स्थिति कैसी है?',
        'धान के बाद कौन सी वैकल्पिक फसल लगाना बेहतर हो सकता है?',
        'ताजा NASA डेटा के अनुसार क्या सूखे या अधिक पानी का कोई जोखिम है?',
      ],
    },
    sources: {
      title: 'डेटा स्रोत और पारदर्शिता',
      subtitle: 'FarmOrbit में हर संख्या और उपग्रह नक्शा कहां से आता है, और उसकी सीमाएं क्या हैं।',
      truthBanner:
        'FarmOrbit कभी नकली NASA आंकड़े नहीं बनाता। उपग्रह ग्रिड 70 मीटर से ~55 किमी तक के क्षेत्र को मापते हैं — इसलिए हमेशा अपने खेत में मिट्टी की खुद भी जांच करें।',
      colSource: 'डेटासेट / मिशन',
      colMeasures: 'यह क्या मापता है',
      colResolution: 'स्थानिक पैमाना',
      colLatestDate: 'ताजा जांच तारीख',
      colLimitations: 'सीमाएं',
      liveApiLabel: 'लाइव API',
      gibsCompositeLabel: 'ताजा GIBS परत',
      cmrCheckedLabel: 'NASA CMR से जांचा गया',
      hourlyLabel: 'प्रति घंटा',
      rolling8DayLabel: '8-दिन का समग्र डेटा',
    },
    common: {
      loading: 'लोड हो रहा है...',
      retry: 'फिर से कोशिश करें',
      close: 'बंद करें',
      acres: 'एकड़',
      acresShort: 'एकड़',
      hectaresShort: 'हे.',
      days14: '14 दिन',
      days30: '30 दिन',
      meters: 'मी',
      mmUnit: 'मिमी',
      mmPerYr: 'मिमी/वर्ष',
      fetchError: 'अभी NASA आंकड़े लोड नहीं हो सके। कृपया पुनः प्रयास करें।',
    },
  },
  bn: {
    brandName: 'FarmOrbit',
    tagline: 'স্মার্ট চাষ। উজ্জ্বল ভবিষ্যৎ।',
    regionFooter: 'হলদিয়া · তমলুক · পূর্ব মেদিনীপুর, পশ্চিমবঙ্গ',
    nav: {
      home: 'হোম',
      dashboard: 'আমার জমি',
      map: 'মানচিত্র',
      rotation: 'শস্য আবর্তন',
      alerts: 'সতর্কবার্তা',
      ai: 'ফার্মঅরবিট AI',
      sources: 'তথ্য উৎস',
    },
    langLabel: 'ভাষা',
    home: {
      welcomeTitle: 'NASA তথ্যের সাহায্যে আপনার জমির আবহাওয়া, জল ও ফসল বুঝুন',
      welcomeSubtitle:
        'হলদিয়া, তমলুক ও পূর্ব মেদিনীপুরের কৃষকদের জন্য তৈরি। সহজ বাংলায় সাম্প্রতিক বৃষ্টিপাত, মাটির আর্দ্রতা, তাপমাত্রা ও বিকল্প ফসলের তথ্য জানুন।',
      selectLocationLabel: 'আপনার এলাকা বা সংরক্ষিত জমি বেছে নিন',
      searchPlaceholder: 'গ্রাম বা শহর খুঁজুন (যেমন নন্দীগ্রাম, সুতাহাটা, মহিষাদল)',
      searchButton: 'খুঁজুন',
      noSearchResults: 'কোনো মিল থাকা গ্রাম বা শহর পাওয়া যায়নি। অনুগ্রহ করে অন্য নাম খুঁজুন।',
      useCoordinates: 'মানচিত্রে স্থান বেছে নিন',
      askAiButton: 'FarmOrbit AI-কে জিজ্ঞাসা করুন',
      viewFarmButton: 'আমার জমি দেখুন',
      openMapButton: 'জমির মানচিত্র খুলুন',
      quickOverviewTitle: 'এলাকার পরিবেশগত সারসংক্ষেপ',
      quickOverviewNote:
        'নিচের তথ্যগুলো আসল NASA ও স্যাটেলাইট গ্রিড (~১০ থেকে ৫৫ কিমি) থেকে নেওয়া। এটি আপনার এলাকার গড় চিত্র, একটি নির্দিষ্ট প্লটের মাটির সেন্সর নয়।',
      weatherCardTitle: 'বর্তমান আবহাওয়া ও তাপমাত্রা',
      rainfallCardTitle: 'সাম্প্রতিক বৃষ্টিপাত',
      soilCardTitle: 'মাটির আর্দ্রতার সূচক',
      vegetationCardTitle: 'ফসল ও সবুজের অবস্থা',
      explainBtn: 'AI-কে দিয়ে বুঝে নিন',
      observedOn: 'পর্যবেক্ষণের তারিখ',
      sourcePrefix: 'উৎস',
      areaEstimateNote: 'আঞ্চলিক স্যাটেলাইট অনুমান',
      loadingData: 'আসল NASA তথ্য লোড হচ্ছে...',
      unavailable: 'এই মুহূর্তে উপলব্ধ নয়',
      modisMapFallback: 'MODIS ২৫০মি মানচিত্র',
      sentinelModisSource: 'ESA Sentinel-2 ও NASA MODIS',
      toolsTitle: 'চাষের সিদ্ধান্তের সহজ উপায়',
      toolRotationTitle: 'শস্য আবর্তন সহায়ক',
      toolRotationDesc: 'বর্তমান মাটির আর্দ্রতা অনুযায়ী ডাল, সরিষা বা সবজির বিকল্প দেখুন।',
      toolMapTitle: 'স্যাটেলাইট জমির মানচিত্র',
      toolMapDesc: 'আপনার জমির সীমানা আঁকুন এবং বৃষ্টি, মাটির রস ও সবুজের স্তর দেখুন।',
      toolAlertsTitle: 'স্মার্ট সতর্কবার্তা',
      toolAlertsDesc: 'আগের গড়ের তুলনায় বৃষ্টি, তাপ বা মাটির রসের পরিবর্তন হয়েছে কিনা জানুন।',
    },
    dashboard: {
      title: 'আমার জমির ড্যাশবোর্ড',
      subtitle: 'আপনার নির্বাচিত এলাকা বা জমির জন্য আসল স্যাটেলাইট ও আবহাওয়া তথ্য।',
      farmProfileTitle: 'আমার জমির প্রোফাইল',
      farmNamePlaceholder: 'যেমন: পূর্ব দিকের জমি হলদিয়া',
      addNewFarm: 'নতুন জমি যোগ / সংরক্ষণ করুন',
      savedFarmsLabel: 'সংরক্ষিত জমি',
      noSavedFarms: 'এখনও কোনো ব্যক্তিগত জমি সংরক্ষিত নেই। আপনার জমির তথ্য লিখে সংরক্ষণ করুন।',
      farmNameLabel: 'জমির নাম',
      locationLabel: 'গ্রাম / এলাকার নাম',
      cropLabel: 'বর্তমান ফসল',
      seasonLabel: 'মরসুম',
      seasonKharif: 'খরিফ (বর্ষা)',
      seasonRabi: 'রবি (শীত)',
      seasonZaid: 'জায়েদ (গ্রীষ্ম)',
      areaAcresLabel: 'আয়তন (একর)',
      latLabel: 'অক্ষাংশ (Latitude)',
      lonLabel: 'দ্রাঘিমাংশ (Longitude)',
      notesLabel: 'জমির নোট (মাটির ধরন, সেচ, নিকাশি)',
      saveFarmBtn: 'জমি সংরক্ষণ করুন',
      updateFarmBtn: 'তথ্য আপডেট করুন',
      deleteFarmBtn: 'মুছুন',
      saveSuccessMsg: 'জমির প্রোফাইল সফলভাবে সংরক্ষিত হয়েছে।',
      saveErrorMsg: 'জমির তথ্য সংরক্ষণ করা যায়নি। অনুগ্রহ করে স্থানাঙ্ক যাচাই করে আবার চেষ্টা করুন।',
      drawOnMapHint: 'আপনি মানচিত্র পাতায় গিয়ে জমির সীমানা এঁকে এখানে যুক্ত করতে পারেন।',
      boundarySavedText: 'জমির GeoJSON সীমানা সংরক্ষিত হয়েছে',
      pointsLabel: 'বিন্দু',
      savedTag: 'সংরক্ষিত',
      downloadPdfBtn: 'PDF রিপোর্ট ডাউনলোড করুন',
      downloadCsvBtn: 'CSV তথ্য ডাউনলোড করুন',
      tempLabel: 'বাতাসের তাপমাত্রা (২ মিটার)',
      rainfallLabel: 'বৃষ্টিপাত (গত ৩০ দিন)',
      humidityLabel: 'বাতাসের আর্দ্রতা',
      soilMoistureLabel: 'উপরের মাটির আর্দ্রতা',
      landSkinTempLabel: 'মাটির পৃষ্ঠের তাপমাত্রা',
      vegetationLabel: 'ফসল ও সবুজ আচ্ছাদন',
      elevationLabel: 'উচ্চতা (ভূমি স্তর)',
      solarLabel: 'সূর্যালোক বিকিরণ',
      et0Label: 'ফসলের জল বাষ্পীভবন (ET0)',
      highShort: 'সর্বোচ্চ',
      lowShort: 'সর্বনিম্ন',
      currentModelLabel: 'বর্তমান মডেল',
      topsoil0cmLabel: 'উপরের মাটি ০ সেমি',
      askAiAboutCard: 'এই বিষয়ে AI-কে জিজ্ঞাসা করুন',
      chartRainTempTitle: 'গত ৩০ দিনের দৈনিক বৃষ্টি ও তাপমাত্রা (NASA POWER)',
      chartRainTempDesc: 'নীল স্তম্ভ প্রতিদিনের বৃষ্টি (মিমি) এবং রেখাগুলো সর্বোচ্চ ও সর্বনিম্ন তাপমাত্রা (°C) দেখায়।',
      chartWaterTitle: 'জলের তথ্য: উপরের মাটি বনাম শিকড় স্তরের আর্দ্রতা',
      chartWaterDesc: 'গত ৩০ দিনে মাটির উপরের ০–৫ সেমি এবং গভীর ০–১০০ সেমি স্তর কতটা ভেজা ছিল তা দেখায়।',
      chartHistoryTitle: 'পূর্ববর্তী বছরগুলোর সাথে তুলনা (২০২১–২০২৫)',
      chartHistoryDesc: 'দীর্ঘমেয়াদী পরিবর্তন বুঝতে NASA POWER-এর বার্ষিক বৃষ্টি ও গড় তাপমাত্রা তুলনা করুন।',
      chartLegendRain: 'বৃষ্টিপাত (মিমি)',
      chartLegendMaxTemp: 'সর্বোচ্চ তাপমাত্রা (°C)',
      chartLegendMinTemp: 'সর্বনিম্ন তাপমাত্রা (°C)',
      chartLegendAnnualRain: 'আনুমানিক বার্ষিক বৃষ্টিপাত (মিমি)',
      chartLegendMeanTemp: 'গড় বাতাসের তাপমাত্রা (°C)',
      chartAxisWetness: '% আর্দ্রতা',
      compareTitle: 'পূর্ব মেদিনীপুরের এলাকাগুলোর তুলনা',
      compareSubtitle: 'হলদিয়া, তমলুক ও কাঁথির NASA তথ্যের পাশাপাশি তুলনা।',
      sentinelTitle: 'সর্বশেষ ESA Sentinel-2 স্যাটেলাইট পাসের তথ্য',
      sentinelEmpty: 'এই স্থানের জন্য সাম্প্রতিক কম-মেঘযুক্ত ছবি পাওয়া যায়নি।',
      passDateLabel: 'পাসের তারিখ',
      tileLabel: 'টাইল',
      cloudCover: 'মেঘ',
      surfaceWetnessDesc: 'উপরের মাটির আর্দ্রতা (০–৫ সেমি)',
      rootWetnessDesc: 'শিকড় স্তরের আর্দ্রতা (০–১০০ সেমি)',
      rainComparisonBelow: 'গত ১৪ দিনের বৃষ্টিপাত ২০ বছরের ঐতিহাসিক গড়ের চেয়ে কম হয়েছে।',
      rainComparisonNormal: 'গত ১৪ দিনের বৃষ্টিপাত ২০ বছরের ঐতিহাসিক গড়ের কাছাকাছি রয়েছে।',
      rainComparisonAbove: 'গত ১৪ দিনের বৃষ্টিপাত ২০ বছরের ঐতিহাসিক গড়ের চেয়ে বেশি হয়েছে।',
    },
    map: {
      title: 'ইন্টারেক্টিভ জমি ও স্যাটেলাইট মানচিত্র',
      subtitle: 'লাইভ NASA GIBS স্যাটেলাইট স্তরসহ হলদিয়া, তমলুক ও পূর্ব মেদিনীপুর দেখুন।',
      searchVillage: 'গ্রাম বা শহর খুঁজুন...',
      enterLatLon: 'অথবা অক্ষাংশ ও দ্রাঘিমাংশ দিন',
      applyCoords: 'স্থানে যান',
      useMyLocation: 'আমার বর্তমান অবস্থান ব্যবহার করুন',
      locatingText: 'অবস্থান নির্ণয় করা হচ্ছে...',
      locationErrorDenied: 'অবস্থানের অনুমতি পাওয়া যায়নি। অনুগ্রহ করে মানচিত্রে ক্লিক করুন বা গ্রাম খুঁজুন।',
      locationErrorUnsupported: 'আপনার ব্রাউজারে লোকেশন সুবিধা সমর্থিত নয়।',
      invalidCoordsError: 'সঠিক অক্ষাংশ (-90 থেকে 90) এবং দ্রাঘিমাংশ (-180 থেকে 180) দিন।',
      zoomIn: 'বড় করুন',
      zoomOut: 'ছোট করুন',
      baseMapLabel: 'মানচিত্রের ধরন',
      baseStreet: 'রাস্তা ও গ্রাম',
      baseSatellite: 'স্যাটেলাইট ছবি',
      nasaLayerLabel: 'NASA স্যাটেলাইট স্তর',
      layerNone: 'কিছুই না (পরিষ্কার মানচিত্র)',
      layerRainfall: 'বৃষ্টিপাত (NASA GPM IMERG)',
      layerSoilMoisture: 'মাটির আর্দ্রতা (NASA SMAP)',
      layerNdvi: 'ফসলের সবুজ ভাব (MODIS NDVI)',
      layerLst: 'ভূমির তাপমাত্রা (MODIS LST)',
      opacityLabel: 'স্তরের স্বচ্ছতা',
      drawBoundaryBtn: 'জমির সীমানা আঁকুন',
      redrawBoundaryBtn: 'সীমানা পুনরায় আঁকুন',
      finishBoundaryBtn: 'আঁকা শেষ করুন',
      undoPointBtn: 'শেষ বিন্দু সরান',
      clearBoundaryBtn: 'সীমানা মুছুন',
      saveToFarmBtn: 'আমার জমিতে সংরক্ষণ করুন',
      drawingActiveHint: 'মানচিত্রে আপনার জমির কোণগুলোতে ক্লিক করুন (কমপক্ষে ৩টি বিন্দু)। প্রয়োজনে বিন্দু টেনে ঠিক করুন।',
      clickFirstPointHint: 'মানচিত্রে ৩টি বা তার বেশি কোণ বেছে নিন, অথবা বন্ধ করতে ১ নম্বর বিন্দুতে ক্লিক করুন।',
      editVerticesHint: 'সংরক্ষণের আগে কোণার পিন টেনে সীমানা পরিবর্তন করতে পারেন।',
      approxAreaLabel: 'জমির আয়তন',
      boundaryCoordsLabel: 'সীমানার স্থানাঙ্ক',
      hectaresUnit: 'হেক্টর',
      invalidPolygonError: 'শূন্যের বেশি আয়তনের জন্য কমপক্ষে ৩টি আলাদা কোণ বেছে নিন।',
      boundarySavedSuccess: 'জমির সীমানা GeoJSON হিসেবে সফলভাবে সংরক্ষিত হয়েছে!',
      boundarySaveFailed: 'ডাটাবেসে সীমানা সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
      boundaryDeletedSuccess: 'জমির সীমানা মুছে ফেলা হয়েছে।',
      legendTitle: 'মানচিত্রের রঙের ব্যাখ্যা',
      layerDateNote: 'স্যাটেলাইট স্তরের তারিখ',
      areaWarning: 'স্যাটেলাইট মানচিত্র ২৫০ মিটার থেকে ১০ কিমি এলাকার গড় দেখায়, একটি গাছের সরাসরি মাপ নয়।',
      tileLoadWarning: 'কিছু স্যাটেলাইট টাইল লোড হতে সময় নিচ্ছে; চাইলে "রাস্তা ও গ্রাম" মানচিত্র দেখতে পারেন।',
    },
    rotation: {
      title: 'শস্য আবর্তন সহায়ক',
      subtitle: 'বর্তমান আবহাওয়া, মাটির ধরন ও আর্দ্রতা অনুযায়ী বিকল্প ফসলের সম্ভাবনা দেখুন।',
      disclaimerBanner:
        'শুধুমাত্র প্রাথমিক দিকনির্দেশনা: এই পরামর্শগুলো আসল NASA তথ্য ও পূর্ব মেদিনীপুরের স্থানীয় কৃষি পদ্ধতির উপর ভিত্তি করে তৈরি। বীজ বপনের আগে স্থানীয় কৃষি বিজ্ঞান কেন্দ্র (KVK) থেকে মাটির লবণাক্ততা ও বীজ যাচাই করে নিন। ফলন বা লাভের কোনো নিশ্চয়তা দেওয়া হয় না।',
      currentCropLabel: 'আপনার বর্তমান / আগের ফসল',
      locationLabel: 'এলাকা',
      soilTypeLabel: 'জমির মাটির ধরন',
      irrigationLabel: 'সেচের সুবিধা',
      missingAssumptionNotice:
        'মাটির ধরন বা সেচের তথ্য এখনো "অজানা" রাখা হয়েছে — তাই পূর্ব মেদিনীপুরের সাধারণ পলি-দোআঁশ মাটি ও মৌসুমি আর্দ্রতা ধরে পরামর্শ দেখানো হচ্ছে। আরও সঠিক পরামর্শের জন্য উপরে মাটি ও সেচ বেছে নিন।',
      currentConditionsTitle: 'তুলনার জন্য ব্যবহৃত বর্তমান NASA তথ্য',
      optionsTitle: 'সম্ভাব্য শস্য আবর্তনের বিকল্প',
      planTitle: '৩-মরসুমের সহজ শস্য আবর্তন পরিকল্পনা',
      planSubtitle: 'ধান, কম জলের ডাল/তৈলবীজ এবং মাটির উর্বরতা ধরে রাখার বাৎসরিক ক্রম।',
      exploratoryTag: 'বিকল্প প্রস্তাবনা',
      whySuggestedLabel: 'কেন এই ফসল বিবেচনাযোগ্য',
      waterNeedLabel: 'জলের চাহিদা',
      seasonFitLabel: 'চাষের মরসুম',
      benefitsLabel: 'প্রধান সুবিধা',
      limitationsLabel: 'সীমাবদ্ধতা ও সতর্কতা',
      dataUsedLabel: 'ব্যবহৃত NASA তথ্য',
      askAiRotationBtn: 'এই ফসল নিয়ে FarmOrbit AI-এর সাথে কথা বলুন',
      lowWater: 'কম জলের প্রয়োজন',
      mediumWater: 'মাঝারি জলের প্রয়োজন',
      highWater: 'বেশি জলের প্রয়োজন',
      soilOptions: {
        unknown: 'অজানা (আঞ্চলিক অনুমান ব্যবহার করুন)',
        alluvial_loam: 'পলি দোআঁশ মাটি (উর্বর নদীর মাটি)',
        clay_loam: 'এঁটেল দোআঁশ মাটি (বেশি জল ধরে রাখে)',
        sandy_loam: 'বেলে দোআঁশ মাটি (দ্রুত জল সরে যায়)',
        coastal_saline: 'উপকূলীয় লবণাক্ত মাটি (হলদিয়া / কাঁথি)',
      },
      irrigationOptions: {
        unknown: 'অজানা (বৃষ্টি ও মাটির রস ধরে অনুমান)',
        rainfed: 'শুধুমাত্র বৃষ্টিনির্ভর (কোনো পাম্প/খাল নেই)',
        canal_pond: 'পুকুর / খাল থেকে মৌসুমি সেচ',
        tubewell: 'নলকূপ / পাম্প থেকে হালকা সেচ উপলব্ধ',
      },
    },
    alerts: {
      title: 'স্মার্ট পরিবেশগত সতর্কবার্তা',
      subtitle: '২০ বছরের ঐতিহাসিক গড়ের সাথে আসল NASA ও আবহাওয়া তথ্যের তুলনা থেকে তৈরি সতর্কবার্তা।',
      noAlertsTitle: 'এই মুহূর্তে কোনো অস্বাভাবিক চাপের সতর্কবার্তা নেই',
      noAlertsDesc:
        'সাম্প্রতিক বৃষ্টিপাত, তাপমাত্রা ও মাটির আর্দ্রতা এই সময়ের স্বাভাবিক সীমার মধ্যেই রয়েছে। নিয়মিত জমি পর্যবেক্ষণ চালিয়ে যান।',
      checkedSourcesLabel: 'যাচাইকৃত তথ্য উৎস',
      latestObsLabel: 'সর্বশেষ যাচাইকৃত তারিখ',
      whatHappened: 'কী পরিবর্তন দেখা গেছে',
      recommendedAction: 'কৃষকের করণীয়',
      affectedArea: 'এলাকা',
      dataSource: 'তথ্য উৎস ও পরিসর',
      observedDate: 'পর্যবেক্ষণের তারিখ',
      askAiAlertBtn: 'জমিতে কী পরীক্ষা করবেন AI-কে জিজ্ঞাসা করুন',
      severityAttention: 'মনোযোগ প্রয়োজন',
      severityAdvisory: 'পরামর্শ',
      severityInfo: 'নজরদারি',
      futureNote: 'দ্রষ্টব্য: FarmOrbit শুধুমাত্র যাচাইকৃত পর্যবেক্ষণ থেকে সতর্কবার্তা দেয় — ভিত্তিহীন ভবিষ্যদ্বাণী নয়।',
    },
    ai: {
      title: 'FarmOrbit AI সহায়ক',
      subtitle: 'বাংলা, হিন্দি বা ইংরেজিতে লিখে অথবা মুখে বলে প্রশ্ন করুন।',
      readyStatus: 'AI প্রস্তুত (Gemini + আসল NASA তথ্য)',
      unavailableStatus: 'সার্ভারে Gemini API কী সেট করা নেই',
      welcomeGreeting:
        'নমস্কার! আপনার নির্বাচিত এলাকার বৃষ্টিপাত, মাটির আর্দ্রতা, তাপমাত্রা, সতর্কবার্তা বা শস্য আবর্তন নিয়ে জিজ্ঞাসা করুন। আমি আসল NASA তথ্যের ভিত্তিতে সহজ বাংলায় উত্তর দেব।',
      inputPlaceholder: 'বৃষ্টিপাত, মাটির আর্দ্রতা, তাপমাত্রা বা শস্য আবর্তন নিয়ে জিজ্ঞাসা করুন...',
      sendBtn: 'পাঠান',
      retryBtn: 'আবার চেষ্টা করুন',
      voiceInputBtn: 'মুখে বলুন',
      listeningLabel: 'শুনছি... অনুগ্রহ করে স্পষ্ট করে বলুন',
      voiceUnsupported: 'এই ব্রাউজারে ভয়েস ইনপুট সমর্থিত নয়। অনুগ্রহ করে নিচে লিখে প্রশ্ন করুন।',
      voicePermissionDenied: 'মাইক্রোফোনের অনুমতি পাওয়া যায়নি। অনুমতি দিন অথবা লিখে প্রশ্ন করুন।',
      voiceNoSpeech: 'কোনো কথা শোনা যায়নি। আবার "মুখে বলুন" চাপুন।',
      voiceFailed: 'কথা বুঝতে সমস্যা হয়েছে। অনুগ্রহ করে লিখে প্রশ্ন করুন।',
      autoSpeakLabel: 'উত্তর পড়ে শোনান',
      listenBtn: 'শুনুন',
      stopBtn: 'থামুন',
      starterTitle: 'কৃষকদের সাধারণ প্রশ্ন',
      contextBanner: 'আসল NASA তথ্য ব্যবহৃত হচ্ছে:',
      dataDistinctionNote: 'উত্তরে বর্তমান আবহাওয়া, ২০ বছরের ঐতিহাসিক গড় এবং স্যাটেলাইট অনুমান আলাদাভাবে বলা হয়।',
      thinkingText: 'NASA তথ্য যাচাই করে সহজ উত্তর তৈরি করা হচ্ছে...',
      errorFallback: 'FarmOrbit AI এই মুহূর্তে উত্তর দিতে পারেনি। অনুগ্রহ করে "আবার চেষ্টা করুন" চাপুন।',
      clearChatBtn: 'নতুন চ্যাট',
      starters: [
        'আমার ফসলের জন্য বর্তমান আবহাওয়া কি উপযুক্ত?',
        'আমার এলাকার বৃষ্টিপাত স্বাভাবিকের তুলনায় কেমন?',
        'এই এলাকায় মাটির আর্দ্রতার অবস্থা কেমন?',
        'ধান কাটার পর কোন কোন বিকল্প ফসল চাষ করা যেতে পারে?',
        'সাম্প্রতিক NASA তথ্য অনুযায়ী খরা বা অতিরিক্ত জলের কোনো ঝুঁকি আছে কি?',
      ],
    },
    sources: {
      title: 'তথ্য উৎস ও স্বচ্ছতা',
      subtitle: 'FarmOrbit-এর প্রতিটি সংখ্যা ও মানচিত্র কোথা থেকে আসে এবং এগুলোর সীমাবদ্ধতা কী।',
      truthBanner:
        'FarmOrbit কখনোই ভুয়া NASA তথ্য তৈরি করে না। স্যাটেলাইট গ্রিড ৭০ মিটার থেকে ~৫৫ কিমি এলাকা মাপে — তাই সবসময় নিজের জমিতে মাটি হাতে পরীক্ষা করে সিদ্ধান্ত নিন।',
      colSource: 'তথ্য উৎস / মিশন',
      colMeasures: 'কী পরিমাপ করে',
      colResolution: 'ভৌগোলিক পরিসর',
      colLatestDate: 'সর্বশেষ যাচাইকৃত তারিখ',
      colLimitations: 'সীমাবদ্ধতা',
      liveApiLabel: 'লাইভ API',
      gibsCompositeLabel: 'সর্বশেষ GIBS স্তর',
      cmrCheckedLabel: 'NASA CMR থেকে যাচাইকৃত',
      hourlyLabel: 'প্রতি ঘণ্টায়',
      rolling8DayLabel: '৮-দিনের সংকলন',
    },
    common: {
      loading: 'লোড হচ্ছে...',
      retry: 'আবার চেষ্টা করুন',
      close: 'বন্ধ করুন',
      acres: 'একর',
      acresShort: 'একর',
      hectaresShort: 'হে.',
      days14: '১৪ দিন',
      days30: '৩০ দিন',
      meters: 'মি',
      mmUnit: 'মিমি',
      mmPerYr: 'মিমি/বছর',
      fetchError: 'এই মুহূর্তে NASA তথ্য লোড করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    },
  },
};
