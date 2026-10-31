'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ClimbingZone } from '@/lib/climbingAreas';
import { 
  CloudSun, 
  CloudRain, 
  Sun, 
  Droplets, 
  ExternalLink, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft,
  ChevronRight,
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar,
  MoveHorizontal,
  Compass
} from 'lucide-react';

interface WeatherData {
  source: string;
  spotName?: string;
  current: {
    temp: number;
    windKmH: number;
    humidity?: number;
    rainMm: number;
    condition: string;
    updatedAt: string;
  };
  verdict: {
    status: 'excelente' | 'bueno' | 'regular' | 'no_recomendable';
    score: number;
    badgeText: string;
    color: 'green' | 'blue' | 'amber' | 'red';
    reason: string;
    bestWindow: string;
    rainAlert: string;
  };
  hourly: Array<{
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
  }>;
  daily: Array<{
    date: string;
    dayName: string;
    minTemp: number;
    maxTemp: number;
    rainSumMm: number;
    rainProbMax: number;
    condition: string;
    climbingScore: number;
  }>;
}

interface AreaWeatherCardProps {
  zone: ClimbingZone;
  escudo?: string;
  isInitialExpanded?: boolean;
}

export default function AreaWeatherCard({ zone, escudo, isInitialExpanded = false }: AreaWeatherCardProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(isInitialExpanded);
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  // Drag-to-scroll state & refs for hourly timeline
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (zone.windguruSpotId) params.append('spotId', zone.windguruSpotId);
        if (zone.lat) params.append('lat', zone.lat.toString());
        if (zone.lon) params.append('lon', zone.lon.toString());

        const res = await fetch(`/api/clima?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (isMounted) {
          setWeather(data);
          setLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error(`Error loading weather for ${zone.nombre}:`, err);
          setError('No se pudo cargar el clima');
          setLoading(false);
        }
      }
    }

    loadWeather();
    return () => {
      isMounted = false;
    };
  }, [zone.windguruSpotId, zone.lat, zone.lon, zone.nombre]);

  // Drag-to-scroll handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 240;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const getVerdictStyles = (status?: string) => {
    switch (status) {
      case 'excelente':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          badge: 'bg-emerald-500 text-slate-950 font-bold',
          icon: CheckCircle2,
          borderGlow: 'hover:border-emerald-500/50',
        };
      case 'bueno':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          badge: 'bg-sky-500 text-slate-950 font-bold',
          icon: CheckCircle2,
          borderGlow: 'hover:border-sky-500/50',
        };
      case 'regular':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500 text-slate-950 font-bold',
          icon: AlertTriangle,
          borderGlow: 'hover:border-amber-500/50',
        };
      case 'no_recomendable':
      default:
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          badge: 'bg-rose-500 text-white font-bold',
          icon: AlertTriangle,
          borderGlow: 'hover:border-rose-500/50',
        };
    }
  };

  const verdictStyles = getVerdictStyles(weather?.verdict.status);
  const VerdictIcon = verdictStyles.icon;

  return (
    <div
      className={`bg-slate-900/95 border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all duration-300 ${verdictStyles.borderGlow} flex flex-col`}
    >
      {/* Card Header - Responsive Layout */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {escudo && (
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 drop-shadow-md">
                <Image
                  src={escudo}
                  alt={zone.provinciaNombre}
                  fill
                  className="object-contain"
                  sizes="48px"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
                  {zone.nombre}
                </h3>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-x-2.5 gap-y-1 flex-wrap mt-1">
                <span className="font-semibold text-slate-300">{zone.provinciaNombre}</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5" />
                  Ref: {zone.referenciaNombre}
                </span>
                {zone.altitudMetros && <span>• ⛰️ {zone.altitudMetros} msnm</span>}
              </p>
            </div>
          </div>

          {/* Quick status badge if loaded */}
          {!loading && weather && (
            <div className="self-start sm:self-auto">
              <span
                className={`inline-block text-xs px-2.5 py-1 rounded-full uppercase tracking-wider ${verdictStyles.badge} whitespace-nowrap shadow-sm`}
              >
                {weather.verdict.badgeText}
              </span>
            </div>
          )}
        </div>

        {/* Included Sectors Pills */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/60">
          <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
            Sectores incluidos ({zone.sectores.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {zone.sectores.map((sec, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/70"
              >
                {sec}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Consultando datos de {zone.referenciaNombre} en Windguru...</p>
          </div>
        ) : error || !weather ? (
          <div className="py-8 text-center text-slate-400">
            <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm">{error || 'Información no disponible temporalmente'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Verdict summary banner */}
            <div className={`p-3.5 rounded-xl border ${verdictStyles.bg} flex items-start gap-3`}>
              <VerdictIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-semibold leading-relaxed">{weather.verdict.reason}</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-300 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Ventana:</strong> {weather.verdict.bestWindow}
                  </span>
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-slate-400" />
                    <strong>Lluvia hoy:</strong> {weather.verdict.rainAlert}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Snapshot Grid - Responsive 2 cols on small mobile, 4 cols on tablet/desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-center">
              <div className="p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Temp</span>
                <span className="text-lg sm:text-xl font-extrabold text-white flex items-center justify-center gap-1">
                  {weather.current.temp}°C
                </span>
                <span className="text-[10px] text-slate-400 truncate block">{weather.current.condition}</span>
              </div>
              <div className="p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Viento</span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-200">
                  {weather.current.windKmH}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">km/h</span>
                </span>
                <span className="text-[10px] text-slate-400 block">Ráfagas</span>
              </div>
              <div className="p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Lluvia hoy</span>
                <span
                  className={`text-lg sm:text-xl font-extrabold ${
                    weather.current.rainMm > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {weather.current.rainMm}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">mm</span>
                </span>
                <span className="text-[10px] text-slate-400 block">Acumulada</span>
              </div>
              <div className="p-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Escalada</span>
                <span
                  className={`text-lg sm:text-xl font-extrabold ${
                    weather.verdict.score >= 80
                      ? 'text-emerald-400'
                      : weather.verdict.score >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {weather.verdict.score}
                  <span className="text-[10px] text-slate-400 font-normal">/100</span>
                </span>
                <span className="text-[10px] text-slate-400 block">Índice</span>
              </div>
            </div>

            {/* Expand / Collapse Forecast details */}
            <div>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors border-t border-slate-800/60 mt-1"
              >
                <span className="flex items-center gap-1.5">
                  <CloudSun className="w-4 h-4 text-emerald-400" />
                  {isExpanded ? 'Ocultar pronóstico por hora' : 'Ver pronóstico hora por hora y 3 días'}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-3 pt-1">
                  {/* Tabs: Hourly vs 3-Days + Drag Indicator */}
                  <div className="flex items-center justify-between border-b border-slate-800 text-xs pb-1 gap-2 flex-wrap">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('hourly')}
                        className={`pb-1.5 px-2.5 font-semibold transition-colors flex items-center gap-1.5 ${
                          activeTab === 'hourly'
                            ? 'border-b-2 border-emerald-500 text-emerald-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>Por Hora</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('daily')}
                        className={`pb-1.5 px-2.5 font-semibold transition-colors flex items-center gap-1.5 ${
                          activeTab === 'daily'
                            ? 'border-b-2 border-emerald-500 text-emerald-400'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>3 Días</span>
                      </button>
                    </div>

                    {activeTab === 'hourly' && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-normal">
                        <MoveHorizontal className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span className="hidden sm:inline">Arrastrá con mouse o dedo</span>
                        <span className="sm:hidden">Deslizá</span>
                      </div>
                    )}
                  </div>

                  {activeTab === 'hourly' ? (
                    /* DRAGGABLE & SWIPEABLE Hourly Container with Controls */
                    <div className="relative group/slider">
                      {/* Left Arrow Button for Desktop / Tablet */}
                      <button
                        type="button"
                        onClick={() => scrollSlider('left')}
                        className="hidden md:flex absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-800/90 hover:bg-emerald-600 text-white items-center justify-center shadow-lg border border-slate-700 opacity-80 hover:opacity-100 transition-all"
                        aria-label="Desplazar horas hacia la izquierda"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Drag-to-scroll & Touch container */}
                      <div
                        ref={sliderRef}
                        onMouseDown={handleMouseDown}
                        onMouseLeave={handleMouseLeave}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className={`overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700 select-none ${
                          isDragging ? 'cursor-grabbing' : 'cursor-grab'
                        } touch-pan-x overscroll-contain active:cursor-grabbing`}
                        style={{ WebkitOverflowScrolling: 'touch' }}
                      >
                        <div className="flex gap-2 min-w-max">
                          {weather.hourly.slice(0, 24).map((hourData, idx) => {
                            const isWet = hourData.precipMm >= 0.5 || hourData.precipProb >= 50;
                            return (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-xl border text-center w-[78px] sm:w-[84px] flex-shrink-0 transition-all select-none ${
                                  isWet
                                    ? 'bg-rose-950/40 border-rose-800/60'
                                    : hourData.isClimbable
                                    ? 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/50'
                                    : 'bg-slate-950/40 border-slate-800/60'
                                }`}
                              >
                                <span className="text-[10px] text-slate-400 block font-mono">
                                  {hourData.day} {hourData.hour}
                                </span>

                                <div className="my-1.5 flex items-center justify-center pointer-events-none">
                                  {isWet ? (
                                    <CloudRain className="w-5 h-5 text-rose-400" />
                                  ) : (
                                    <Sun className="w-5 h-5 text-amber-400" />
                                  )}
                                </div>

                                <span className="text-sm sm:text-base font-bold text-white block">
                                  {hourData.temp}°C
                                </span>

                                {/* Rain indicator */}
                                <div className="mt-1">
                                  {hourData.precipMm > 0 ? (
                                    <span className="text-[10px] font-bold text-sky-400 block">
                                      {hourData.precipMm} mm
                                    </span>
                                  ) : hourData.precipProb > 0 ? (
                                    <span className="text-[10px] text-slate-400 block">
                                      {hourData.precipProb}%
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-emerald-400/90 block">Seco</span>
                                  )}
                                </div>

                                {/* Wind */}
                                <span className="text-[9px] text-slate-400 block mt-0.5">
                                  {hourData.windKmH} km/h
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right Arrow Button for Desktop / Tablet */}
                      <button
                        type="button"
                        onClick={() => scrollSlider('right')}
                        className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-slate-800/90 hover:bg-emerald-600 text-white items-center justify-center shadow-lg border border-slate-700 opacity-80 hover:opacity-100 transition-all"
                        aria-label="Desplazar horas hacia la derecha"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    /* 3-Days Forecast Grid - Responsive on Mobile */
                    <div className="grid grid-cols-3 gap-2">
                      {weather.daily.map((dayData, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-950/70 border border-slate-800 p-2.5 sm:p-3 rounded-xl text-center space-y-1"
                        >
                          <span className="text-xs font-bold text-slate-200 block truncate">
                            {dayData.dayName}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {dayData.condition}
                          </span>
                          <div className="text-xs sm:text-sm font-bold text-white">
                            <span className="text-amber-400">{dayData.maxTemp}°</span> /{' '}
                            <span className="text-sky-400">{dayData.minTemp}°</span>
                          </div>
                          <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-center gap-1">
                            <Droplets className="w-3 h-3 text-sky-400" />
                            <span>{dayData.rainProbMax}%</span>
                          </div>
                          <div
                            className={`text-[9px] sm:text-[10px] font-bold py-0.5 px-1 rounded ${
                              dayData.climbingScore >= 80
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : dayData.climbingScore >= 50
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {dayData.climbingScore >= 80
                              ? 'Apto'
                              : dayData.climbingScore >= 50
                              ? 'Atención'
                              : 'Lluvia'}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Card Footer Actions - Responsive Stacking on Small Mobile */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
          {zone.windguruLink ? (
            <a
              href={zone.windguruLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors bg-emerald-950/40 hover:bg-emerald-900/60 px-3.5 py-2 rounded-xl border border-emerald-800/40"
            >
              <span>Windguru ({zone.referenciaNombre})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-slate-400 text-[11px] py-1 text-center sm:text-left">
              Pronóstico satelital de alta resolución
            </span>
          )}

          {zone.googleMapsLink && (
            <a
              href={zone.googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 text-slate-300 hover:text-white transition-colors px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Cómo llegar ({zone.referenciaNombre})</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
