'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from './layout';
import { 
  mockUsers, 
  mockOutings, 
  mockReports,
  Outing,
  Report,
  Province
} from '@/lib/mockData';
import climbingDataJson from '@/lib/climbingData.json';

const climbingData = climbingDataJson as Province[];
import { 
  Map, 
  Users, 
  Compass, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  ShieldAlert,
  Server,
  PlusCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, doc, setDoc } from 'firebase/firestore';

export default function Dashboard() {
  const { isDemoMode } = useAdmin();
  const [stats, setStats] = useState({
    provincesCount: 0,
    sectorsCount: 0,
    routesCount: 0,
    usersCount: 0,
    outingsCount: 0,
    reportsCount: 0
  });

  const [recentOutings, setRecentOutings] = useState<Outing[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    setFirebaseError(null);
    try {
      // 1. Seed provinces, areas, sectors, and routes
      for (const province of climbingData) {
        const provRef = doc(db, 'provincias', province.id);
        await setDoc(provRef, { nombre: province.nombre });
        
        for (const area of province.areas) {
          const areaRef = doc(db, `provincias/${province.id}/areas`, area.id);
          await setDoc(areaRef, {
            nombre: area.nombre,
            descripcion: area.descripcion || '',
            tiempoCaminata: area.tiempoCaminata || '',
            googleMapsLink: area.googleMapsLink || '',
            hospitalLink: area.hospitalLink || '',
            windguruLink: area.windguruLink || '',
            imageUrl: area.imageUrl || '',
            howToGetImageUrl: area.howToGetImageUrl || '',
            overviewImageUrl: area.overviewImageUrl || ''
          });
          
          for (const sector of area.sectores) {
            const sectorRef = doc(db, `provincias/${province.id}/areas/${area.id}/sectores`, sector.id);
            await setDoc(sectorRef, {
              nombre: sector.nombre,
              descripcion: sector.descripcion || '',
              imageUrl: sector.imageUrl || '',
              overviewImageUrl: sector.overviewImageUrl || '',
              comoLlegarImageUrl: sector.comoLlegarImageUrl || '',
              generalImageUrl: sector.generalImageUrl || '',
              izquierdaImageUrl: sector.izquierdaImageUrl || '',
              centroImageUrl: sector.centroImageUrl || '',
              derechaImageUrl: sector.derechaImageUrl || '',
              vias: sector.vias
            });
          }
        }
      }

      // Reload window to trigger data reload
      window.location.reload();
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Error seeding database: ", error);
      setFirebaseError(`Error al popular la base de datos: ${error.message || 'Verifica las reglas de seguridad'}`);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setFirebaseError(null);

      if (isDemoMode) {
        // Calculate mock stats
        const pCount = climbingData.length;
        let sCount = 0;
        let rCount = 0;
        climbingData.forEach(p => {
          p.areas.forEach(a => {
            sCount += a.sectores.length;
            a.sectores.forEach(s => {
              rCount += s.vias.length;
            });
          });
        });

        setStats({
          provincesCount: pCount,
          sectorsCount: sCount,
          routesCount: rCount,
          usersCount: mockUsers.length,
          outingsCount: mockOutings.length,
          reportsCount: mockReports.filter(r => r.estado === 'Pendiente').length
        });

        setRecentOutings(mockOutings.slice(0, 3));
        setPendingReports(mockReports.filter(r => r.estado === 'Pendiente').slice(0, 3));
        setLoading(false);
      } else {
        try {
          // Load from live Firestore
          let pCount = 0;
          let sCount = 0;
          let rCount = 0;
          let uCount = 0;
          let oCount = 0;
          let repCount = 0;
          let liveOutings: Outing[] = [];
          let liveReports: Report[] = [];

          // 1. Fetch Provinces & Sectors
          try {
            const provincesSnap = await getDocs(collection(db, 'provincias'));
            pCount = provincesSnap.size;
            
            if (pCount > 0) {
              // Attempt to count sectors
              for (const docRef of provincesSnap.docs) {
                // Try to find sectors inside the subcollections nested path
                // Note: the provincias layout screen uses subcollection areas, then subcollection sectores.
                // Here we fetch all areas in a province, and then sectors in each area to count them properly.
                const areasSnap = await getDocs(collection(db, `provincias/${docRef.id}/areas`));
                for (const areaDoc of areasSnap.docs) {
                  const sectorsSnap = await getDocs(collection(db, `provincias/${docRef.id}/areas/${areaDoc.id}/sectores`));
                  sCount += sectorsSnap.size;
                  sectorsSnap.docs.forEach(secDoc => {
                    const vias = secDoc.data().vias;
                    if (Array.isArray(vias)) {
                      rCount += vias.length;
                    }
                  });
                }
              }
            }
          } catch (e: unknown) {
            const err = e as { message?: string };
            console.warn("Error loading provincias collection:", err.message);
          }

          // 2. Fetch Users (profiles)
          try {
            const totalUsersSnap = await getDocs(collection(db, 'profiles'));
            uCount = totalUsersSnap.size;
          } catch (e: unknown) {
            const err = e as { message?: string };
            console.warn("Error loading profiles collection:", err.message);
          }

          // 3. Fetch Outings (cordadas)
          try {
            // Use createdAt (real field from mobile app)
            const outingsQuery = query(collection(db, 'cordadas'), orderBy('createdAt', 'desc'), limit(5));
            const outingsSnap = await getDocs(outingsQuery);
            liveOutings = outingsSnap.docs.map(docVal => ({
              id: docVal.id,
              ...docVal.data()
            } as unknown as Outing));

            const totalOutingsSnap = await getDocs(collection(db, 'cordadas'));
            oCount = totalOutingsSnap.size;
          } catch (e: unknown) {
            const err = e as { message?: string };
            console.warn("Error loading cordadas collection:", err.message);
          }

          // 4. Fetch Reports (cordada_reports)
          try {
            const reportsQuery = query(collection(db, 'cordada_reports'), orderBy('timestamp', 'desc'), limit(5));
            const reportsSnap = await getDocs(reportsQuery);
            liveReports = reportsSnap.docs.map(docVal => ({
              id: docVal.id,
              ...docVal.data()
            } as unknown as Report));

            // All reports count as "pending" until resolved — count all for badge
            repCount = liveReports.length;
          } catch (e: unknown) {
            const err = e as { message?: string };
            console.warn("Error loading cordada_reports collection:", err.message);
          }

          setStats({
            provincesCount: pCount,
            sectorsCount: sCount,
            routesCount: rCount,
            usersCount: uCount,
            outingsCount: oCount,
            reportsCount: repCount
          });

          setRecentOutings(liveOutings.slice(0, 3));
          setPendingReports(liveReports.filter(r => r.estado === 'Pendiente').slice(0, 3));

          if (pCount === 0 && uCount === 0) {
            setFirebaseError("La base de datos de Firestore está vacía. Usa el botón de abajo para popularla con los datos de prueba de climbing.");
          }
        } catch (err: unknown) {
          const error = err as { message?: string };
          console.error("Firebase fetch error: ", error);
          setFirebaseError(`Error al consultar Firestore: ${error.message || 'Verifica las reglas de seguridad'}`);
        } finally {
          setLoading(false);
        }
      }
    }

    loadData();
  }, [isDemoMode]);

  const statCards = [
    {
      title: 'Vías Registradas',
      value: stats.routesCount,
      subtitle: `${stats.provincesCount} Provincias • ${stats.sectorsCount} Sectores`,
      icon: Map,
      color: 'from-emerald-500/20 to-teal-500/5',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      link: '/admin/provincias'
    },
    {
      title: 'Escaladores Activos',
      value: stats.usersCount,
      subtitle: 'Usuarios en ClipApp',
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/5',
      iconColor: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      link: '/admin/usuarios'
    },
    {
      title: 'Salidas (Cordadas)',
      value: stats.outingsCount,
      subtitle: 'Propuestas de escalada',
      icon: Compass,
      color: 'from-purple-500/20 to-pink-500/5',
      iconColor: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      link: '/admin/salidas'
    },
    {
      title: 'Reportes Pendientes',
      value: stats.reportsCount,
      subtitle: 'Moderación de spam/bots',
      icon: AlertTriangle,
      color: stats.reportsCount > 0 ? 'from-red-500/20 to-orange-500/5' : 'from-zinc-800/50 to-zinc-900/10',
      iconColor: stats.reportsCount > 0 ? 'text-red-400 animate-pulse' : 'text-zinc-400',
      borderColor: stats.reportsCount > 0 ? 'border-red-500/20' : 'border-zinc-800',
      link: '/admin/reportes'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Cargando métricas del sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Firebase Setup and Seeding Banner */}
      {(firebaseError || stats.provincesCount === 0) && (
        <div className="bg-zinc-900/60 backdrop-blur-md border border-amber-500/35 rounded-2xl p-6 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -right-24 -top-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl"></div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Configuración y Población de Datos
              </h3>
              <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed">
                Para que el panel de administración funcione correctamente con Firebase, asegúrate de configurar las <strong>Reglas de Seguridad de Cloud Firestore</strong> en tu Firebase Console. Luego, puedes usar el botón de abajo para popular la base de datos en tiempo real con las provincias, sectores y vías de la app móvil.
              </p>
              {firebaseError && (
                <div className="p-3.5 bg-red-950/40 border border-red-900/30 text-red-200 text-xs rounded-xl mt-3 flex flex-col gap-1">
                  <span className="font-bold uppercase tracking-wider text-[10px] text-red-400">Detalle del error / estado:</span>
                  <span>{firebaseError}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="w-full lg:w-auto flex-shrink-0 bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold px-6 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 text-sm"
            >
              {seeding ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                  Sincronizando DB...
                </>
              ) : (
                'Popular Provincias y Vías'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link 
              key={idx} 
              href={card.link}
              className={`block bg-zinc-900/60 hover:bg-zinc-900 border ${card.borderColor} rounded-2xl p-6 transition duration-300 group hover:shadow-lg hover:shadow-zinc-950`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-gradient-to-tr ${card.color} border border-zinc-800 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <p className="text-sm font-semibold text-zinc-400">{card.title}</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{card.value}</h3>
              <p className="text-xs text-zinc-500 mt-2 font-medium">{card.subtitle}</p>
            </Link>
          );
        })}
      </div>

      {/* Database Mode Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Acciones Rápidas</h3>
            <p className="text-sm text-zinc-400 mb-6">Herramientas administrativas directas para la base de datos de ClipApp.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link 
              href="/admin/provincias?action=new-provincia"
              className="flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition text-sm font-semibold text-zinc-200 group"
            >
              <PlusCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
              <span>Añadir Nueva Provincia</span>
            </Link>
            <Link 
              href="/admin/provincias?action=new-sector"
              className="flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition text-sm font-semibold text-zinc-200 group"
            >
              <PlusCircle className="w-5 h-5 text-teal-400 group-hover:scale-110 transition" />
              <span>Añadir Sector a Córdoba</span>
            </Link>
            <button
              onClick={() => {
                if (window.confirm("¿Estás seguro de que deseas sincronizar toda la base de datos de vías desde el archivo JSON compilado? Esto sobrescribirá los datos de provincias, áreas, sectores y vías.")) {
                  handleSeedDatabase();
                }
              }}
              disabled={seeding}
              className="flex items-center gap-3 p-4 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-xl transition text-sm font-semibold text-zinc-200 group text-left disabled:opacity-50"
            >
              {seeding ? (
                <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
              ) : (
                <Database className="w-5 h-5 text-amber-400 group-hover:scale-110 transition flex-shrink-0" />
              )}
              <div className="flex flex-col">
                <span>Sincronizar Vías (JSON)</span>
                <span className="block text-[10px] text-zinc-500 font-normal mt-0.5">Sincroniza info desde la app móvil</span>
              </div>
            </button>
          </div>
        </div>

        {/* Database Status Card */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Estado Conexión</h3>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isDemoMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`}></div>
                <span className="text-lg font-extrabold text-white">
                  {isDemoMode ? 'Modo Demo / Local' : 'Base de datos activa'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                {isDemoMode 
                  ? 'Visualizando y editando datos cargados localmente de prueba. Cambios no afectarán a Firebase.' 
                  : 'Operaciones en tiempo real sobre colecciones de Cloud Firestore ("profiles", "cordadas", "cordada_reports").'}
              </p>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-800/60 text-[11px] text-zinc-500 font-mono">
            DB: {isDemoMode ? 'MEM_MOCK_STORAGE' : 'clipapp-62a1f.firestore'}
          </div>
        </div>

      </div>

      {/* Bottom sections (Activity Lists) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Outings / Cordadas */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              Propuestas Recientes (&quot;Encontrar Cordada&quot;)
            </h3>
            <Link href="/admin/salidas" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              Ver todo <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentOutings.length === 0 ? (
              <p className="text-sm text-zinc-500 py-6 text-center">No hay propuestas de salida registradas.</p>
            ) : (
              recentOutings.map((outing) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const o = outing as unknown as Record<string, any>;
                return (
                  <div key={o.id} className="p-4 bg-zinc-900/60 border border-zinc-800/50 rounded-xl hover:border-zinc-800 transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex gap-3">
                        {(() => {
                          const av: string = o.avatar || '';
                          if (av.includes('.png')) {
                            const fn = av.split('/').pop() || av;
                            // eslint-disable-next-line @next/next/no-img-element
                            return <img src={`/avatars/${fn}`} alt={o.name || ''} className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-800 flex-shrink-0" />;
                          }
                          return (
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg flex-shrink-0">
                              {av || '🧗'}
                            </div>
                          );
                        })()}
                        <div>
                          <h4 className="text-sm font-bold text-zinc-150">{o.name || o.creadorNombre || '—'}</h4>
                          <p className="text-xs text-zinc-500 mt-0.5">{o.destination || o.zona || '—'} • {o.province || o.provincia || '—'}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-zinc-800 border border-zinc-750 text-zinc-400 rounded-full flex items-center gap-1 font-semibold whitespace-nowrap">
                        <Clock className="w-3 h-3 text-purple-400" /> {o.date || o.fechaSalida || '—'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-3 line-clamp-2 leading-relaxed">{o.role || o.descripcion || ''}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Reports / Moderation */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Reportes de Moderación Pendientes
            </h3>
            <Link href="/admin/reportes" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
              Ver todo <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {pendingReports.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-800/80 rounded-xl text-center">
                <p className="text-sm text-zinc-500">¡Todo limpio! No hay reportes pendientes.</p>
              </div>
            ) : (
              pendingReports.map((report) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const r = report as unknown as Record<string, any>;
                return (
                  <div key={r.id} className="p-4 bg-red-950/10 border border-red-900/20 hover:border-red-900/45 rounded-xl transition">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-300 truncate">{r.destination || r.targetTitulo || '—'}</h4>
                        <p className="text-xs text-zinc-500 mt-1 font-medium">Motivo: <span className="text-red-400">{r.reason || r.motivo || '—'}</span></p>
                        <p className="text-xs text-zinc-600 mt-0.5">Denunciado: <span className="text-zinc-400">{r.postedByName || r.reportadoPorNombre || '—'}</span></p>
                      </div>
                      <span className="text-[10px] text-zinc-600 whitespace-nowrap font-mono flex-shrink-0">
                        {r.estado && r.estado !== 'Pendiente'
                          ? <span className="text-emerald-500">{r.estado}</span>
                          : '⏳ Pendiente'
                        }
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
