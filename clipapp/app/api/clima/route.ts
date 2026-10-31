import { NextRequest, NextResponse } from 'next/server';

interface WeatherHourlyItem {
  time: string;
  hour: string;
  day: string;
  temp: number;
  precipMm: number;
  precipProb: number;
  windKmH: number;
  gustsKmH: number;
  condition: string;
  isClimbable: boolean;
}

interface WeatherDailyItem {
  date: string;
  dayName: string;
  minTemp: number;
  maxTemp: number;
  rainSumMm: number;
  rainProbMax: number;
  condition: string;
  climbingScore: number;
}

interface ClimbingVerdict {
  status: 'excelente' | 'bueno' | 'regular' | 'no_recomendable';
  score: number;
  badgeText: string;
  color: 'green' | 'blue' | 'amber' | 'red';
  reason: string;
  bestWindow: string;
  rainAlert: string;
}

interface WeatherResponseData {
  source: 'windguru' | 'open-meteo' | 'hybrid';
  spotId?: string;
  spotName?: string;
  lat?: number;
  lon?: number;
  current: {
    temp: number;
    windKmH: number;
    humidity?: number;
    rainMm: number;
    condition: string;
    updatedAt: string;
  };
  verdict: ClimbingVerdict;
  hourly: WeatherHourlyItem[];
  daily: WeatherDailyItem[];
}

// In-memory cache to prevent abuse and guarantee super fast response times
const cache = new Map<string, { timestamp: number; data: WeatherResponseData }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

function weatherCodeToCondition(code: number): string {
  if (code === 0) return 'Despejado';
  if (code === 1 || code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if ([45, 48].includes(code)) return 'Niebla';
  if ([51, 53, 55].includes(code)) return 'Llovizna';
  if ([61, 63, 65].includes(code)) return 'Lluvia';
  if ([71, 73, 75].includes(code)) return 'Nieve';
  if ([80, 81, 82].includes(code)) return 'Chaparrones';
  if ([95, 96, 99].includes(code)) return 'Tormenta eléctrica';
  return 'Nublado';
}

function calculateClimbingVerdict(
  currentTemp: number,
  currentWind: number,
  hourly: WeatherHourlyItem[]
): ClimbingVerdict {
  // Analyze daylight hours today (between 08:00 and 19:00)
  const todayDaylight = hourly.slice(0, 16);
  const maxRain = Math.max(...todayDaylight.map((h) => h.precipMm), 0);
  const maxRainProb = Math.max(...todayDaylight.map((h) => h.precipProb), 0);
  const maxWind = Math.max(...todayDaylight.map((h) => h.windKmH), currentWind);
  const minTemp = Math.min(...todayDaylight.map((h) => h.temp), currentTemp);

  // Find best climbing hours
  const climbableHours = todayDaylight.filter(
    (h) => h.precipMm < 0.2 && h.precipProb < 35 && h.temp >= 10 && h.temp <= 30 && h.windKmH < 40
  );

  let bestWindow = 'Todo el día';
  if (climbableHours.length > 0) {
    bestWindow = `${climbableHours[0].hour} a ${climbableHours[climbableHours.length - 1].hour}`;
  } else {
    bestWindow = 'Ventana reducida o no recomendada';
  }

  // Rain alerts
  let rainAlert = 'Sin lluvia prevista hoy';
  const firstRainHour = todayDaylight.find((h) => h.precipMm >= 0.5 || h.precipProb >= 50);
  if (firstRainHour) {
    rainAlert = `Lluvia esperada hacia las ${firstRainHour.hour} (${firstRainHour.precipMm > 0 ? firstRainHour.precipMm + ' mm' : firstRainHour.precipProb + '% prob.'})`;
  }

  // Calculate score and verdict
  if (maxRain >= 2.0 || maxRainProb >= 70) {
    return {
      status: 'no_recomendable',
      score: 25,
      badgeText: 'No recomendable / Lluvia',
      color: 'red',
      reason: 'Riesgo alto de lluvia o roca mojada. Se desaconseja ir a escalar vías expuestas.',
      bestWindow: 'No recomendable hoy',
      rainAlert,
    };
  }

  if (maxRain >= 0.5 || maxRainProb >= 45 || maxWind >= 50 || minTemp < 5) {
    return {
      status: 'regular',
      score: 55,
      badgeText: 'Condición Regular / Precaución',
      color: 'amber',
      reason: maxWind >= 50
        ? 'Vientos fuertes en altura. Buscar sectores resguardados.'
        : maxRain > 0
        ? 'Inestable con posibles lloviznas intermitentes. Salir temprano y prever escape.'
        : 'Temperatura muy baja. Llevar abrigo térmico y calentar dedos.',
      bestWindow,
      rainAlert,
    };
  }

  if (currentTemp >= 14 && currentTemp <= 25 && maxWind < 30 && maxRain < 0.1) {
    return {
      status: 'excelente',
      score: 95,
      badgeText: 'Excelente para escalar',
      color: 'green',
      reason: 'Condición de adherencia óptima, temperatura templada y cielo seco. ¡Ideal para apretar proyectos!',
      bestWindow,
      rainAlert,
    };
  }

  return {
    status: 'bueno',
    score: 80,
    badgeText: 'Buena para escalar',
    color: 'blue',
    reason: currentTemp > 25
      ? 'Temperatura cálida: buscar paredes con orientación a la sombra.'
      : 'Clima fresco y seco: excelente para boulder y deportiva.',
    bestWindow,
    rainAlert,
  };
}

async function fetchFromOpenMeteo(lat: number, lon: number): Promise<Partial<WeatherResponseData>> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code&timezone=auto&forecast_days=3`;

  const res = await fetch(url, { headers: { 'User-Agent': 'ClipApp/1.0' }, next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const data = await res.json();

  const current = {
    temp: Math.round(data.current.temperature_2m),
    windKmH: Math.round(data.current.wind_speed_10m),
    humidity: Math.round(data.current.relative_humidity_2m),
    rainMm: Number(data.current.precipitation || 0),
    condition: weatherCodeToCondition(data.current.weather_code),
    updatedAt: new Date().toISOString(),
  };

  const hourlyTimes: string[] = data.hourly.time || [];
  const hourlyTemps: number[] = data.hourly.temperature_2m || [];
  const hourlyPrecip: number[] = data.hourly.precipitation || [];
  const hourlyProb: number[] = data.hourly.precipitation_probability || [];
  const hourlyWind: number[] = data.hourly.wind_speed_10m || [];
  const hourlyGusts: number[] = data.hourly.wind_gusts_10m || [];
  const hourlyCodes: number[] = data.hourly.weather_code || [];

  // Filter next 36 hours from now
  const nowHourIndex = Math.max(
    0,
    hourlyTimes.findIndex((t) => new Date(t).getTime() >= Date.now() - 3600000)
  );

  const hourly: WeatherHourlyItem[] = [];
  const dayNamesShort = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  for (let i = nowHourIndex; i < Math.min(nowHourIndex + 36, hourlyTimes.length); i++) {
    const d = new Date(hourlyTimes[i]);
    const hourStr = `${d.getHours().toString().padStart(2, '0')}:00`;
    const isToday = d.toDateString() === new Date().toDateString();
    const dayLabel = isToday ? 'Hoy' : dayNamesShort[d.getDay()];

    const temp = Math.round(hourlyTemps[i]);
    const precipMm = Number((hourlyPrecip[i] || 0).toFixed(1));
    const precipProb = Math.round(hourlyProb[i] || 0);
    const windKmH = Math.round(hourlyWind[i] || 0);
    const gustsKmH = Math.round(hourlyGusts[i] || 0);
    const condition = weatherCodeToCondition(hourlyCodes[i]);

    hourly.push({
      time: hourlyTimes[i],
      hour: hourStr,
      day: dayLabel,
      temp,
      precipMm,
      precipProb,
      windKmH,
      gustsKmH,
      condition,
      isClimbable: precipMm < 0.2 && precipProb < 40 && windKmH < 45,
    });
  }

  // Daily for 3 days
  const daily: WeatherDailyItem[] = [];
  const dailyDates: string[] = data.daily.time || [];
  const dailyMaxTemps: number[] = data.daily.temperature_2m_max || [];
  const dailyMinTemps: number[] = data.daily.temperature_2m_min || [];
  const dailyPrecipSum: number[] = data.daily.precipitation_sum || [];
  const dailyRainProbMax: number[] = data.daily.precipitation_probability_max || [];
  const dailyCodes: number[] = data.daily.weather_code || [];

  for (let i = 0; i < Math.min(3, dailyDates.length); i++) {
    const d = new Date(dailyDates[i] + 'T12:00:00');
    const dayName = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : dayNamesShort[d.getDay()];
    const rainMm = Number((dailyPrecipSum[i] || 0).toFixed(1));
    const rainProb = Math.round(dailyRainProbMax[i] || 0);

    let score = 90;
    if (rainMm > 2 || rainProb > 60) score = 25;
    else if (rainMm > 0.5 || rainProb > 40) score = 55;
    else if (dailyMaxTemps[i] > 32 || dailyMinTemps[i] < 4) score = 70;

    daily.push({
      date: dailyDates[i],
      dayName,
      minTemp: Math.round(dailyMinTemps[i]),
      maxTemp: Math.round(dailyMaxTemps[i]),
      rainSumMm: rainMm,
      rainProbMax: rainProb,
      condition: weatherCodeToCondition(dailyCodes[i]),
      climbingScore: score,
    });
  }

  const verdict = calculateClimbingVerdict(current.temp, current.windKmH, hourly);

  return {
    source: 'open-meteo',
    lat,
    lon,
    current,
    verdict,
    hourly,
    daily,
  };
}

async function fetchFromWindguruWap(spotId: string): Promise<{
  spotName: string;
  hourly: { hour: string; day: string; temp: number; precipMm: number; windKmH: number; gustsKmH: number }[];
} | null> {
  try {
    const url = `https://wap2.windguru.cz/view.php?sc=${spotId}&m=3&full=1`;
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      next: { revalidate: 1800 },
    });

    if (!res.ok) return null;
    const html = await res.text();

    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const spotName = titleMatch ? titleMatch[1].trim() : `Spot ${spotId}`;

    const rowMatches = html.match(/<tr>([\s\S]*?)<\/tr>/gi);
    if (!rowMatches || rowMatches.length < 7) return null;

    const extractTds = (rowStr: string) => {
      const tds = rowStr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi) || [];
      return tds.map((td) => td.replace(/<[^>]+>/g, ' ').replace(/&#160;/g, '0').trim());
    };

    const timeRow = extractTds(rowMatches[0]).slice(1);
    const windRow = extractTds(rowMatches[1]).slice(1);
    const gustRow = extractTds(rowMatches[2]).slice(1);
    const tempRow = extractTds(rowMatches[4]).slice(1);
    const precipRow = extractTds(rowMatches[6]).slice(1);

    const hourly: { hour: string; day: string; temp: number; precipMm: number; windKmH: number; gustsKmH: number }[] = [];
    let currentDay = 'Hoy';

    for (let i = 0; i < Math.min(36, timeRow.length); i++) {
      const tText = timeRow[i] || '';
      const parts = tText.split(/\s+/);
      let hour = tText;
      if (parts.length >= 2) {
        currentDay = parts[0];
        hour = parts[1];
      } else if (parts.length === 1 && parts[0].includes('h')) {
        hour = parts[0];
      }

      // Windguru wind is in knots -> convert to km/h (1 knot = 1.852 km/h)
      const windKnots = parseFloat(windRow[i]) || 0;
      const gustKnots = parseFloat(gustRow[i]) || windKnots;
      const windKmH = Math.round(windKnots * 1.852);
      const gustsKmH = Math.round(gustKnots * 1.852);

      const temp = Math.round(parseFloat(tempRow[i]) || 18);
      const precipRaw = precipRow[i] || '0';
      const precipMm = parseFloat(precipRaw.replace('-', '0')) || 0;

      hourly.push({
        hour: hour.replace('h', ':00'),
        day: currentDay,
        temp,
        precipMm,
        windKmH,
        gustsKmH,
      });
    }

    return { spotName, hourly };
  } catch (err) {
    console.error('Windguru fetch error:', err);
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const spotId = searchParams.get('spotId') || undefined;
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');

  const lat = latStr ? parseFloat(latStr) : undefined;
  const lon = lonStr ? parseFloat(lonStr) : undefined;

  const cacheKey = spotId ? `spot_${spotId}` : lat && lon ? `coords_${lat.toFixed(3)}_${lon.toFixed(3)}` : 'default';

  // Check Cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=900',
      },
    });
  }

  try {
    // Strategy: If coordinates available, get Open-Meteo (fast, complete with prob %, UV, daily)
    let omData: Partial<WeatherResponseData> | null = null;
    if (lat !== undefined && lon !== undefined) {
      try {
        omData = await fetchFromOpenMeteo(lat, lon);
      } catch (err) {
        console.warn('Open-Meteo fetch failed:', err);
      }
    }

    // If spotId available, get Windguru microclimate
    let wgData: {
      spotName: string;
      hourly: { hour: string; day: string; temp: number; precipMm: number; windKmH: number; gustsKmH: number }[];
    } | null = null;

    if (spotId) {
      wgData = await fetchFromWindguruWap(spotId);
    }

    // Assemble best response
    let finalData: WeatherResponseData;

    if (omData && omData.current && omData.hourly) {
      // If we also have Windguru, we can refine hourly temp/precip with Windguru data
      if (wgData && wgData.hourly && wgData.hourly.length > 0) {
        const enrichedHourly = omData.hourly.map((h, idx) => {
          const wgItem = wgData!.hourly[idx];
          if (!wgItem) return h;
          return {
            ...h,
            temp: wgItem.temp ?? h.temp,
            precipMm: wgItem.precipMm ?? h.precipMm,
            windKmH: wgItem.windKmH ?? h.windKmH,
            gustsKmH: wgItem.gustsKmH ?? h.gustsKmH,
          };
        });

        const currentTemp = wgData.hourly[0]?.temp ?? omData.current.temp;
        const currentWind = wgData.hourly[0]?.windKmH ?? omData.current.windKmH;
        const verdict = calculateClimbingVerdict(currentTemp, currentWind, enrichedHourly);

        finalData = {
          source: 'hybrid',
          spotId,
          spotName: wgData.spotName,
          lat,
          lon,
          current: {
            ...omData.current,
            temp: currentTemp,
            windKmH: currentWind,
          },
          verdict,
          hourly: enrichedHourly,
          daily: omData.daily || [],
        };
      } else {
        // Pure Open-Meteo
        finalData = {
          source: 'open-meteo',
          spotId,
          lat,
          lon,
          current: omData.current!,
          verdict: omData.verdict!,
          hourly: omData.hourly!,
          daily: omData.daily || [],
        };
      }
    } else if (wgData && wgData.hourly && wgData.hourly.length > 0) {
      // Pure Windguru fallback if Open-Meteo was not available
      const first = wgData.hourly[0];
      const hourlyItems: WeatherHourlyItem[] = wgData.hourly.map((h, i) => ({
        time: `+${i}h`,
        hour: h.hour,
        day: h.day,
        temp: h.temp,
        precipMm: h.precipMm,
        precipProb: h.precipMm > 0 ? 80 : 5,
        windKmH: h.windKmH,
        gustsKmH: h.gustsKmH,
        condition: h.precipMm > 0.5 ? 'Lluvia' : h.precipMm > 0 ? 'Llovizna' : 'Despejado / Viento',
        isClimbable: h.precipMm < 0.2 && h.windKmH < 45,
      }));

      const verdict = calculateClimbingVerdict(first.temp, first.windKmH, hourlyItems);

      finalData = {
        source: 'windguru',
        spotId,
        spotName: wgData.spotName,
        lat,
        lon,
        current: {
          temp: first.temp,
          windKmH: first.windKmH,
          rainMm: first.precipMm,
          condition: first.precipMm > 0 ? 'Lluvia' : 'Despejado',
          updatedAt: new Date().toISOString(),
        },
        verdict,
        hourly: hourlyItems,
        daily: [],
      };
    } else {
      return NextResponse.json(
        { error: 'No se pudo obtener el pronóstico para los parámetros provistos' },
        { status: 502 }
      );
    }

    cache.set(cacheKey, { timestamp: Date.now(), data: finalData });

    return NextResponse.json(finalData, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=900',
      },
    });
  } catch (err: unknown) {
    console.error('Error in /api/clima:', err);
    const message = err instanceof Error ? err.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
