'use client';

import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Layout from '../components/Layout';
import AreaWeatherCard from './AreaWeatherCard';
import { PROVINCIAS, CLIMBING_ZONES } from '@/lib/climbingAreas';
import { 
  CloudSun, 
  Search, 
  MapPin, 
  Compass, 
  ShieldCheck, 
  Sparkles, 
  Filter,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Mountain,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ClimaPage() {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('cordoba');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'high_altitude'>('all');

  // Province ribbon drag & scroll ref
  const provRibbonRef = useRef<HTMLDivElement>(null);

  const scrollProvRibbon = (direction: 'left' | 'right') => {
    if (!provRibbonRef.current) return;
    provRibbonRef.current.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth',
    });
  };

  // Filtered zones calculation
  const filteredZones = useMemo(() => {
    return CLIMBING_ZONES.filter((zone) => {
      // Province filter
      if (selectedProvinceId !== 'all' && zone.provinciaId !== selectedProvinceId) {
        return false;
      }

      // Search query: searches in Zone Name, Reference Spot, Province, or any included sector!
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = zone.nombre.toLowerCase().includes(q);
        const matchRef = zone.referenciaNombre.toLowerCase().includes(q);
        const matchProv = zone.provinciaNombre.toLowerCase().includes(q);
        const matchSector = zone.sectores.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchRef && !matchProv && !matchSector) return false;
      }

      // Altitude filter
      if (filterType === 'high_altitude' && (!zone.altitudMetros || zone.altitudMetros < 1500)) {
        return false;
      }

      return true;
    });
  }, [selectedProvinceId, searchQuery, filterType]);

  const selectedProvince = PROVINCIAS.find((p) => p.id === selectedProvinceId);

  // Map province id to escudo path
  const provinceEscudos = useMemo(() => {
    const map: Record<string, string> = {};
    PROVINCIAS.forEach((p) => {
      map[p.id] = p.escudo;
    });
    return map;
  }, []);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
        {/* Hero Banner Section */}
        <div className="relative bg-gradient-to-b from-green-900 via-slate-900 to-slate-950 border-b border-slate-800 pt-10 pb-12 sm:pt-16 sm:pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>

          <div className="relative max-w-5xl mx-auto text-center space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
              <CloudSun className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Condición de Escalada en Tiempo Real</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Clima en <span className="text-emerald-400">Zonas de Escalada</span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed px-2">
              Agrupado por zonas con su punto de referencia de Windguru. Arrastrá la línea de tiempo para ver la temperatura y lluvia hora por hora.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-2 text-[11px] sm:text-xs text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                Zonas principales y sectores
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                Spots de referencia Windguru
              </span>
              <span className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Semáforo de adherencia y lluvia
              </span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Province Selector with Escudos - Swipeable ribbon on Mobile/Tablet */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs sm:text-sm uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Seleccioná una Provincia</span>
              </h2>
              {selectedProvinceId !== 'all' ? (
                <button
                  type="button"
                  onClick={() => setSelectedProvinceId('all')}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
                >
                  Ver todas las zonas ({CLIMBING_ZONES.length})
                </button>
              ) : (
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  Mostrando todas las zonas
                </span>
              )}
            </div>

            {/* Mobile & Tablet Swipeable Ribbon / Desktop Grid with Arrow Navigation */}
            <div className="relative group/prov">
              {/* Left Arrow for Desktop */}
              <button
                type="button"
                onClick={() => scrollProvRibbon('left')}
                className="hidden lg:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-white items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
                aria-label="Provincias anteriores"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div
                ref={provRibbonRef}
                className="flex lg:grid lg:grid-cols-10 gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin scrollbar-thumb-slate-800 touch-pan-x"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {/* All Provinces Button */}
                <button
                  type="button"
                  onClick={() => setSelectedProvinceId('all')}
                  className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all flex-shrink-0 w-24 lg:w-auto min-h-[96px] ${
                    selectedProvinceId === 'all'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-950 ring-2 ring-emerald-500/40'
                      : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 flex items-center justify-center mb-1 border border-slate-700">
                    <Compass className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-xs font-bold truncate block w-full">Todas</span>
                  <span className="text-[10px] opacity-80">{CLIMBING_ZONES.length} zonas</span>
                </button>

                {/* Individual Provinces */}
                {PROVINCIAS.map((prov) => {
                  const count = CLIMBING_ZONES.filter((z) => z.provinciaId === prov.id).length;
                  const isSelected = selectedProvinceId === prov.id;
                  return (
                    <button
                      type="button"
                      key={prov.id}
                      onClick={() => setSelectedProvinceId(prov.id)}
                      className={`p-2.5 sm:p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all flex-shrink-0 w-24 lg:w-auto min-h-[96px] group relative ${
                        isSelected
                          ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-500/40'
                          : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="relative w-8 h-8 sm:w-9 sm:h-9 mb-1 flex-shrink-0 transition-transform group-hover:scale-110">
                        <Image
                          src={prov.escudo}
                          alt={prov.nombre}
                          fill
                          className="object-contain"
                          sizes="36px"
                        />
                      </div>
                      <span className="text-xs font-bold truncate block w-full">{prov.nombre}</span>
                      <span className="text-[10px] text-slate-400">{count} {count === 1 ? 'zona' : 'zonas'}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right Arrow for Desktop */}
              <button
                type="button"
                onClick={() => scrollProvRibbon('right')}
                className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-white items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
                aria-label="Provincias siguientes"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {selectedProvince && selectedProvinceId !== 'all' && (
              <p className="text-xs text-slate-400 italic pt-0.5">
                📍 {selectedProvince.descripcion}
              </p>
            )}
          </div>

          {/* Search Bar & Filter Chips - Responsive layout */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-3 sm:p-4 space-y-3 shadow-md">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por zona o sector (ej. Altas Cumbres, La Ola, Secretillo, Gigantes, Cantera, Horno...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-16 py-2 sm:py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                  >
                    Borrar
                  </button>
                )}
              </div>

              {/* Filter chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterType === 'all'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  Todas las zonas ({filteredZones.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('high_altitude')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    filterType === 'high_altitude'
                      ? 'bg-sky-600 text-white border border-sky-400'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-850'
                  }`}
                >
                  <Mountain className="w-3.5 h-3.5" />
                  Alta Montaña (&gt; 1500m)
                </button>
              </div>
            </div>
          </div>

          {/* Area Weather Cards Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <span>Zonas de Escalada</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {filteredZones.length} {filteredZones.length === 1 ? 'zona' : 'zonas'}
                </span>
              </h3>
            </div>

            {filteredZones.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center space-y-3">
                <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-slate-500 mx-auto" />
                <h4 className="text-base sm:text-lg font-bold text-white">No se encontraron zonas</h4>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Probá ajustando el término de búsqueda o seleccionando &quot;Todas las provincias&quot;.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedProvinceId('all');
                    setFilterType('all');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors mt-2"
                >
                  Restablecer filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {filteredZones.map((zone, index) => (
                  <AreaWeatherCard
                    key={zone.id}
                    zone={zone}
                    escudo={provinceEscudos[zone.provinciaId]}
                    isInitialExpanded={index === 0}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Climbing Weather Guide & Legend */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 mt-8 sm:mt-12">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
              ¿Cómo interpretar el semáforo meteorológico de ClipApp?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 space-y-1">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Excelente (80 - 100)
                </span>
                <p className="text-slate-300">
                  Temperatura ideal (14° a 24°C), sin precipitaciones y viento moderado. Máxima adherencia en roca.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 space-y-1">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  Regular / Atención (50 - 79)
                </span>
                <p className="text-slate-300">
                  Puede haber viento en altura, calor (buscar sectores con sombra) o frío intenso (llevar abrigo térmico).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-1">
                <span className="font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  No recomendable (&lt; 50)
                </span>
                <p className="text-slate-300">
                  Probabilidad alta de lluvia o precipitaciones recientes. Riesgo de roca mojada y resbalones.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center pt-1">
              Las condiciones se calculan con el punto de referencia meteorológico de cada zona (Windguru y satélite de alta resolución).
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
