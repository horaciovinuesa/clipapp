'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../layout';
import { 
  Province, 
  Area, 
  Sector, 
  Route
} from '@/lib/mockData';
import climbingDataJson from '@/lib/climbingData.json';

const climbingData = climbingDataJson as Province[];
import { 
  MapPin, 
  Plus, 
  Folder, 
  ChevronRight, 
  Image as ImageIcon, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Check, 
  Database,
  ArrowRight,
  Sliders,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

export default function ProvinciasEditor() {
  const { isDemoMode } = useAdmin();

  // Navigation & selection state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');
  const [selectedAreaId, setSelectedAreaId] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Editor states (for adding new Province/Area/Sector)
  const [showAddProvinceModal, setShowAddProvinceModal] = useState(false);
  const [newProvinceName, setNewProvinceName] = useState('');

  const [showAddAreaModal, setShowAddAreaModal] = useState(false);
  const [newAreaName, setNewAreaName] = useState('');

  const [showAddSectorModal, setShowAddSectorModal] = useState(false);
  const [newSectorName, setNewSectorName] = useState('');
  const [newSectorDesc, setNewSectorDesc] = useState('');
  const [newSectorImage, setNewSectorImage] = useState('');

  // Route edit states
  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [routeForm, setRouteForm] = useState<Partial<Route>>({
    nombre: '',
    grado: '',
    altura: '',
    chapas: 0,
    grupo: 'General'
  });
  const [newRouteForm, setNewRouteForm] = useState<Partial<Route>>({
    nombre: '',
    grado: '',
    altura: '',
    chapas: 6,
    grupo: 'General'
  });

  // Active route set tab inside Sector view
  const [activeGroupTab, setActiveGroupTab] = useState<'General' | 'Izquierda' | 'Centro' | 'Derecha'>('General');

  // Sector title/image inline edits
  const [sectorEditName, setSectorEditName] = useState('');
  const [sectorEditDesc, setSectorEditDesc] = useState('');
  const [sectorEditImage, setSectorEditImage] = useState('');

  // Auto-clear success message
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  // Load Provinces
  const loadProvinces = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // Load from LocalStorage or fallback to climbingData
        const localData = localStorage.getItem('clipapp_provinces');
        if (localData) {
          const parsed = JSON.parse(localData);
          setProvinces(parsed);
          if (parsed.length > 0) {
            setSelectedProvinceId(parsed[0].id);
            if (parsed[0].areas.length > 0) {
              setSelectedAreaId(parsed[0].areas[0].id);
            }
          }
        } else {
          setProvinces(climbingData);
          localStorage.setItem('clipapp_provinces', JSON.stringify(climbingData));
          if (climbingData.length > 0) {
            setSelectedProvinceId(climbingData[0].id);
            if (climbingData[0].areas.length > 0) {
              setSelectedAreaId(climbingData[0].areas[0].id);
            }
          }
        }
      } else {
        // Load from live Firestore
        const tempProvinces: Province[] = [];
        const provSnap = await getDocs(collection(db, 'provincias'));
        
        for (const provDoc of provSnap.docs) {
          const pData = provDoc.data();
          const provId = provDoc.id;
          const areas: Area[] = [];
          
          // Get subcollection areas
          const areasSnap = await getDocs(collection(db, `provincias/${provId}/areas`));
          for (const areaDoc of areasSnap.docs) {
            const aData = areaDoc.data();
            const areaId = areaDoc.id;
            const sectores: Sector[] = [];
            
            // Get subcollection sectores
            const sectoresSnap = await getDocs(collection(db, `provincias/${provId}/areas/${areaId}/sectores`));
            sectoresSnap.docs.forEach(secDoc => {
              const sData = secDoc.data();
              sectores.push({
                id: secDoc.id,
                nombre: sData.nombre || '',
                descripcion: sData.descripcion || '',
                imageUrl: sData.imageUrl || '',
                vias: sData.vias || []
              });
            });
            
            areas.push({
              id: areaId,
              nombre: aData.nombre || '',
              sectores
            });
          }
          
          tempProvinces.push({
            id: provId,
            nombre: pData.nombre || '',
            areas
          });
        }
        
        setProvinces(tempProvinces);
        if (tempProvinces.length > 0) {
          setSelectedProvinceId(tempProvinces[0].id);
          if (tempProvinces[0].areas.length > 0) {
            setSelectedAreaId(tempProvinces[0].areas[0].id);
          }
        }
      }
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error(e);
      setActionMessage({ text: `Error al cargar provincias: ${e.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProvinces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  // Sync edited sector data to state when opening Sector Editor
  useEffect(() => {
    if (selectedSector) {
      setSectorEditName(selectedSector.nombre);
      setSectorEditDesc(selectedSector.descripcion || '');
      setSectorEditImage(selectedSector.imageUrl || '');
      // Select appropriate tab based on routes.
      // If there are left/center/right routes, default to Left. Otherwise General.
      const hasGroups = selectedSector.vias.some(v => v.grupo !== 'General');
      setActiveGroupTab(hasGroups ? 'Izquierda' : 'General');
    }
  }, [selectedSector]);

  const activeProvince = provinces.find(p => p.id === selectedProvinceId);
  const activeArea = activeProvince?.areas.find(a => a.id === selectedAreaId);

  // Local Save utility (Demo mode helper)
  const saveProvincesToLocal = (updatedProvinces: Province[]) => {
    setProvinces(updatedProvinces);
    localStorage.setItem('clipapp_provinces', JSON.stringify(updatedProvinces));
  };

  // Seeding Firebase DB
  const seedFirebase = async () => {
    if (window.confirm("¿Estás seguro de que quieres sincronizar Firestore con los datos reales de la app móvil? Esto sobrescribirá las provincias, sectores y vías.")) {
      setSeeding(true);
      setActionMessage({ text: "Iniciando subida de datos de la app a Firestore...", type: 'info' });
      try {
        for (const prov of climbingData) {
          // Write Province
          const provRef = doc(db, 'provincias', prov.id);
          await setDoc(provRef, { nombre: prov.nombre });

          for (const area of prov.areas) {
            // Write Area
            const areaRef = doc(db, `provincias/${prov.id}/areas`, area.id);
            await setDoc(areaRef, { nombre: area.nombre });

            for (const sector of area.sectores) {
              // Write Sector
              const secRef = doc(db, `provincias/${prov.id}/areas/${area.id}/sectores`, sector.id);
              await setDoc(secRef, {
                nombre: sector.nombre,
                descripcion: sector.descripcion || '',
                imageUrl: sector.imageUrl || '',
                vias: sector.vias
              });
            }
          }
        }
        setActionMessage({ text: "Firestore inicializado con éxito.", type: 'success' });
        loadProvinces();
      } catch (err: unknown) {
        const e = err as { message?: string };
        console.error(e);
        setActionMessage({ text: `Fallo al inicializar: ${e.message}`, type: 'error' });
      } finally {
        setSeeding(false);
      }
    }
  };

  // CRUD -- ADD PROVINCE
  const handleAddProvince = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvinceName.trim()) return;

    const newId = newProvinceName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const newProvObj: Province = {
      id: newId,
      nombre: newProvinceName.trim(),
      areas: []
    };

    if (isDemoMode) {
      const updated = [...provinces, newProvObj];
      saveProvincesToLocal(updated);
      setSelectedProvinceId(newId);
      setShowAddProvinceModal(false);
      setNewProvinceName('');
      setActionMessage({ text: `Provincia '${newProvinceName}' creada localmente.`, type: 'success' });
    } else {
      setSaving(true);
      try {
        await setDoc(doc(db, 'provincias', newId), { nombre: newProvObj.nombre });
        const updated = [...provinces, newProvObj];
        setProvinces(updated);
        setSelectedProvinceId(newId);
        setShowAddProvinceModal(false);
        setNewProvinceName('');
        setActionMessage({ text: `Provincia '${newProvObj.nombre}' guardada en Firestore.`, type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error: ${e.message}`, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  // CRUD -- ADD AREA
  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedProvinceId) return;

    const newId = newAreaName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const newAreaObj: Area = {
      id: newId,
      nombre: newAreaName.trim(),
      sectores: []
    };

    const updatedProvinces = provinces.map(p => {
      if (p.id === selectedProvinceId) {
        return { ...p, areas: [...p.areas, newAreaObj] };
      }
      return p;
    });

    if (isDemoMode) {
      saveProvincesToLocal(updatedProvinces);
      setSelectedAreaId(newId);
      setShowAddAreaModal(false);
      setNewAreaName('');
      setActionMessage({ text: `Zona '${newAreaName}' creada localmente.`, type: 'success' });
    } else {
      setSaving(true);
      try {
        await setDoc(doc(db, `provincias/${selectedProvinceId}/areas`, newId), { nombre: newAreaObj.nombre });
        setProvinces(updatedProvinces);
        setSelectedAreaId(newId);
        setShowAddAreaModal(false);
        setNewAreaName('');
        setActionMessage({ text: `Zona '${newAreaObj.nombre}' guardada en Firestore.`, type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error: ${e.message}`, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  // CRUD -- ADD SECTOR
  const handleAddSector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectorName.trim() || !selectedProvinceId || !selectedAreaId) return;

    const newId = newSectorName.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const newSecObj: Sector = {
      id: newId,
      nombre: newSectorName.trim(),
      descripcion: newSectorDesc.trim(),
      imageUrl: newSectorImage.trim() || 'https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=600&q=80',
      vias: []
    };

    const updatedProvinces = provinces.map(p => {
      if (p.id === selectedProvinceId) {
        return {
          ...p,
          areas: p.areas.map(a => {
            if (a.id === selectedAreaId) {
              return { ...a, sectores: [...a.sectores, newSecObj] };
            }
            return a;
          })
        };
      }
      return p;
    });

    if (isDemoMode) {
      saveProvincesToLocal(updatedProvinces);
      setShowAddSectorModal(false);
      setNewSectorName('');
      setNewSectorDesc('');
      setNewSectorImage('');
      setActionMessage({ text: `Sector '${newSecObj.nombre}' creado localmente.`, type: 'success' });
    } else {
      setSaving(true);
      try {
        await setDoc(doc(db, `provincias/${selectedProvinceId}/areas/${selectedAreaId}/sectores`, newId), {
          nombre: newSecObj.nombre,
          descripcion: newSecObj.descripcion,
          imageUrl: newSecObj.imageUrl,
          vias: []
        });
        setProvinces(updatedProvinces);
        setShowAddSectorModal(false);
        setNewSectorName('');
        setNewSectorDesc('');
        setNewSectorImage('');
        setActionMessage({ text: `Sector '${newSecObj.nombre}' guardado en Firestore.`, type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error: ${e.message}`, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  // CRUD -- SAVE SECTOR DETAILS & ROUTES
  const handleSaveSectorData = async (updatedSector: Sector) => {
    setSaving(true);
    
    const updatedProvinces = provinces.map(p => {
      if (p.id === selectedProvinceId) {
        return {
          ...p,
          areas: p.areas.map(a => {
            if (a.id === selectedAreaId) {
              return {
                ...a,
                sectores: a.sectores.map(s => {
                  if (s.id === updatedSector.id) {
                    return updatedSector;
                  }
                  return s;
                })
              };
            }
            return a;
          })
        };
      }
      return p;
    });

    if (isDemoMode) {
      saveProvincesToLocal(updatedProvinces);
      setSelectedSector(updatedSector);
      setSaving(false);
      setActionMessage({ text: "Sector actualizado localmente.", type: 'success' });
    } else {
      try {
        const secRef = doc(db, `provincias/${selectedProvinceId}/areas/${selectedAreaId}/sectores`, updatedSector.id);
        await updateDoc(secRef, {
          nombre: updatedSector.nombre,
          descripcion: updatedSector.descripcion || '',
          imageUrl: updatedSector.imageUrl || '',
          vias: updatedSector.vias
        });
        setProvinces(updatedProvinces);
        setSelectedSector(updatedSector);
        setActionMessage({ text: "Sector sincronizado con Firestore exitosamente.", type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error al guardar: ${e.message}`, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  const handleUpdateSectorInfo = () => {
    if (!selectedSector) return;
    const updated = {
      ...selectedSector,
      nombre: sectorEditName,
      descripcion: sectorEditDesc,
      imageUrl: sectorEditImage
    };
    handleSaveSectorData(updated);
  };

  // CRUD -- ADD ROUTE TO SECTOR
  const handleAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSector || !newRouteForm.nombre || !newRouteForm.grado) return;

    const newRoute: Route = {
      id: `r-${Date.now()}`,
      nombre: newRouteForm.nombre,
      grado: newRouteForm.grado,
      altura: newRouteForm.altura || '15m',
      chapas: Number(newRouteForm.chapas) || 0,
      grupo: activeGroupTab
    };

    const updatedSector = {
      ...selectedSector,
      vias: [...selectedSector.vias, newRoute]
    };

    handleSaveSectorData(updatedSector);
    setNewRouteForm({
      nombre: '',
      grado: '',
      altura: '',
      chapas: 6,
      grupo: activeGroupTab
    });
  };

  // CRUD -- DELETE ROUTE FROM SECTOR
  const handleDeleteRoute = (routeId: string) => {
    if (!selectedSector) return;
    if (window.confirm("¿Seguro que quieres eliminar esta vía?")) {
      const updatedSector = {
        ...selectedSector,
        vias: selectedSector.vias.filter(v => v.id !== routeId)
      };
      handleSaveSectorData(updatedSector);
    }
  };

  // CRUD -- INLINE EDIT ROUTE
  const startEditRoute = (route: Route) => {
    setEditingRouteId(route.id);
    setRouteForm(route);
  };

  const handleSaveRouteEdit = () => {
    if (!selectedSector || !editingRouteId) return;
    
    const updatedSector = {
      ...selectedSector,
      vias: selectedSector.vias.map(v => {
        if (v.id === editingRouteId) {
          return { ...v, ...routeForm } as Route;
        }
        return v;
      })
    };
    
    handleSaveSectorData(updatedSector);
    setEditingRouteId(null);
  };

  // CRUD -- DELETE SECTOR
  const handleDeleteSector = async (sectorId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este sector y todas sus vías de manera permanente?")) return;
    
    const updatedProvinces = provinces.map(p => {
      if (p.id === selectedProvinceId) {
        return {
          ...p,
          areas: p.areas.map(a => {
            if (a.id === selectedAreaId) {
              return {
                ...a,
                sectores: a.sectores.filter(s => s.id !== sectorId)
              };
            }
            return a;
          })
        };
      }
      return p;
    });

    if (isDemoMode) {
      saveProvincesToLocal(updatedProvinces);
      setSelectedSector(null);
      setActionMessage({ text: "Sector eliminado localmente.", type: 'success' });
    } else {
      setSaving(true);
      try {
        await deleteDoc(doc(db, `provincias/${selectedProvinceId}/areas/${selectedAreaId}/sectores`, sectorId));
        setProvinces(updatedProvinces);
        setSelectedSector(null);
        setActionMessage({ text: "Sector eliminado de Firestore.", type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error: ${e.message}`, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Cargando base de datos geográfica...</p>
      </div>
    );
  }

  // Filter routes based on selected tab group
  const filteredRoutes = selectedSector?.vias.filter(v => v.grupo === activeGroupTab) || [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Toast Alert */}
      {actionMessage && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 border text-sm font-medium transition duration-300 ${
          actionMessage.type === 'success' ? 'bg-zinc-900 border-emerald-500/30 text-emerald-400' :
          actionMessage.type === 'error' ? 'bg-red-950 border-red-800 text-red-200' :
          'bg-zinc-900 border-zinc-800 text-zinc-300'
        }`}>
          {actionMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Database control banner for empty Firestore */}
      {!isDemoMode && provinces.length === 0 && (
        <div className="p-8 bg-zinc-900/60 border border-dashed border-zinc-800 rounded-3xl text-center space-y-4">
          <Database className="w-12 h-12 text-zinc-500 mx-auto" />
          <h3 className="text-lg font-bold text-white">Base de datos de producción vacía</h3>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            No se han encontrado registros de provincias en tu base de datos de Firestore. Puedes inicializar la base de datos de producción con la información de provincias, sectores y vías extraída de la app móvil.
          </p>
          <button
            onClick={seedFirebase}
            disabled={seeding}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-zinc-950 text-sm font-bold rounded-xl transition flex items-center gap-2 mx-auto"
          >
            {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            Sincronizar Provincias y Vías desde la App
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar (Provincias & Areas) */}
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-5 space-y-6 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Provincias</span>
            <button
              onClick={() => setShowAddProvinceModal(true)}
              className="p-1 hover:bg-zinc-800 rounded-md text-emerald-400 hover:text-emerald-300 transition"
              title="Añadir provincia"
            >
              <Plus className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Provinces List */}
          <div className="space-y-1">
            {provinces.map((prov) => (
              <button
                key={prov.id}
                onClick={() => {
                  setSelectedProvinceId(prov.id);
                  setSelectedAreaId(prov.areas[0]?.id || '');
                  setSelectedSector(null);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition ${
                  selectedProvinceId === prov.id 
                    ? 'bg-zinc-800 text-white border border-zinc-700/50' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className={`w-4 h-4 ${selectedProvinceId === prov.id ? 'text-emerald-400' : 'text-zinc-500'}`} />
                  {prov.nombre}
                </span>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </div>

          {/* Areas Section (if a province is selected) */}
          {activeProvince && (
            <div className="space-y-4 pt-4 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Zonas / Áreas</span>
                <button
                  onClick={() => setShowAddAreaModal(true)}
                  className="p-1 hover:bg-zinc-800 rounded-md text-emerald-400 hover:text-emerald-300 transition"
                  title="Añadir zona"
                >
                  <Plus className="w-4.5 h-4.5" />
                </button>
              </div>

              <div className="space-y-1">
                {activeProvince.areas.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-2">Sin zonas creadas.</p>
                ) : (
                  activeProvince.areas.map((area) => (
                    <button
                      key={area.id}
                      onClick={() => {
                        setSelectedAreaId(area.id);
                        setSelectedSector(null);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        selectedAreaId === area.id 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" />
                      <span className="truncate">{area.nombre}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sectors and Routes display */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Top Info Bar */}
          <div className="bg-zinc-900/30 border border-zinc-800 px-6 py-4 rounded-2xl flex items-center justify-between text-xs font-medium text-zinc-400">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold">{activeProvince?.nombre || 'Provincias'}</span>
              {activeArea && (
                <>
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span className="text-zinc-300 font-bold">{activeArea.nombre}</span>
                </>
              )}
            </div>
            {activeArea && (
              <button
                onClick={() => setShowAddSectorModal(true)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Nuevo Sector
              </button>
            )}
          </div>

          {/* Grid of Sectors */}
          {activeArea && !selectedSector && (
            <div>
              {activeArea.sectores.length === 0 ? (
                <div className="p-12 border border-dashed border-zinc-800 rounded-3xl text-center space-y-2">
                  <Folder className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm font-bold text-zinc-300">Zona sin sectores</p>
                  <p className="text-xs text-zinc-500 max-w-xs mx-auto">Añade un sector para comenzar a cargar las vías y detalles de escalada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeArea.sectores.map((sector) => (
                    <div 
                      key={sector.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl hover:border-zinc-700/80 transition flex flex-col justify-between"
                    >
                      <div className="h-32 bg-zinc-950 relative">
                        {sector.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={sector.imageUrl} alt={sector.nombre} className="w-full h-full object-cover opacity-75" />
                        ) : (
                          <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-zinc-700" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent"></div>
                        <h4 className="absolute bottom-3 left-4 text-base font-extrabold text-white">{sector.nombre}</h4>
                      </div>
                      
                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {sector.descripcion || 'Sin descripción cargada.'}
                        </p>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                          <span className="text-[11px] font-bold text-zinc-500 uppercase">
                            {sector.vias.length} Vías registradas
                          </span>
                          <button
                            onClick={() => setSelectedSector(sector)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition flex items-center gap-1 border border-zinc-700/50"
                          >
                            Editar Sector & Vías <ArrowRight className="w-3 h-3 text-emerald-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sector Editor Details View (when selected) */}
          {selectedSector && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 pb-6">
              
              {/* Cover Header */}
              <div className="h-44 bg-zinc-950 relative">
                {sectorEditImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={sectorEditImage} alt={selectedSector.nombre} className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-zinc-800" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/60 to-transparent"></div>
                <button
                  onClick={() => setSelectedSector(null)}
                  className="absolute top-4 right-4 p-2 bg-zinc-950/70 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-full transition"
                  title="Cerrar editor"
                >
                  <X className="w-4.5 h-4.5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                      Editor de Vías
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1">{selectedSector.nombre}</h3>
                  </div>
                  <button
                    onClick={() => handleDeleteSector(selectedSector.id)}
                    className="px-3 py-1.5 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/40 text-xs font-bold rounded-lg transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar Sector
                  </button>
                </div>
              </div>

              {/* Sector settings / Inline edit fields */}
              <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-zinc-850">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Nombre Sector</label>
                  <input
                    type="text"
                    value={sectorEditName}
                    onChange={(e) => setSectorEditName(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-150 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Descripción</label>
                  <input
                    type="text"
                    value={sectorEditDesc}
                    onChange={(e) => setSectorEditDesc(e.target.value)}
                    placeholder="Descripción breve..."
                    className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-150 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">Imagen (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sectorEditImage}
                      onChange={(e) => setSectorEditImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-150 outline-none"
                    />
                    <button
                      onClick={handleUpdateSectorInfo}
                      disabled={saving}
                      className="px-3 bg-zinc-800 hover:bg-zinc-755 hover:text-white text-zinc-300 rounded-xl transition border border-zinc-700 flex items-center justify-center"
                      title="Guardar metadatos"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Vias Set Multi-Group Tabs */}
              <div className="px-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white">Lista de Vías por Sectores Sets</span>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex bg-zinc-950/60 p-1 rounded-xl border border-zinc-850">
                    {(['General', 'Izquierda', 'Centro', 'Derecha'] as const).map((tab) => {
                      const count = selectedSector.vias.filter(v => v.grupo === tab).length;
                      return (
                        <button
                          key={tab}
                          onClick={() => {
                            setActiveGroupTab(tab);
                            setEditingRouteId(null);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                            activeGroupTab === tab 
                              ? 'bg-zinc-800 text-emerald-400 shadow-inner' 
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span>{tab}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            activeGroupTab === tab ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Vias table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="py-2.5 px-3">Nombre Vía</th>
                        <th className="py-2.5 px-3">Grado</th>
                        <th className="py-2.5 px-3">Altura</th>
                        <th className="py-2.5 px-3">Chapas</th>
                        <th className="py-2.5 px-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850/60 text-xs">
                      {filteredRoutes.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-zinc-500 italic">
                            No hay vías registradas en el sector set &quot;{activeGroupTab}&quot;.
                          </td>
                        </tr>
                      ) : (
                        filteredRoutes.map((route) => {
                          const isEditing = editingRouteId === route.id;
                          return (
                            <tr key={route.id} className="hover:bg-zinc-850/30 transition group">
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={routeForm.nombre || ''}
                                    onChange={(e) => setRouteForm({ ...routeForm, nombre: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none w-full max-w-[160px]"
                                  />
                                ) : (
                                  <span className="font-bold text-zinc-200">{route.nombre}</span>
                                )}
                              </td>
                              <td className="py-2 px-3">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={routeForm.grado || ''}
                                    onChange={(e) => setRouteForm({ ...routeForm, grado: e.target.value })}
                                    placeholder="e.g. 6a+"
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none w-16"
                                  />
                                ) : (
                                  <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700/40 rounded font-semibold text-[10px]">
                                    {route.grado}
                                  </span>
                                )}
                              </td>
                              <td className="py-2 px-3 text-zinc-400">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={routeForm.altura || ''}
                                    onChange={(e) => setRouteForm({ ...routeForm, altura: e.target.value })}
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none w-16"
                                  />
                                ) : (
                                  route.altura || '-'
                                )}
                              </td>
                              <td className="py-2 px-3 text-zinc-400">
                                {isEditing ? (
                                  <input
                                    type="number"
                                    value={routeForm.chapas || 0}
                                    onChange={(e) => setRouteForm({ ...routeForm, chapas: Number(e.target.value) })}
                                    className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none w-14"
                                  />
                                ) : (
                                  route.chapas || '-'
                                )}
                              </td>
                              <td className="py-2 px-3 text-right">
                                {isEditing ? (
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={handleSaveRouteEdit}
                                      className="p-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500 hover:text-zinc-950 transition"
                                      title="Confirmar cambios"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingRouteId(null)}
                                      className="p-1 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded hover:text-white transition"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => startEditRoute(route)}
                                      className="p-1 text-zinc-450 hover:text-emerald-450 hover:bg-zinc-800 rounded transition"
                                      title="Editar vía"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteRoute(route.id)}
                                      className="p-1 text-zinc-450 hover:text-red-400 hover:bg-zinc-800 rounded transition"
                                      title="Eliminar vía"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Form to add a new route */}
                <form onSubmit={handleAddRoute} className="pt-4 border-t border-zinc-850 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Nueva vía..."
                      value={newRouteForm.nombre}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, nombre: e.target.value })}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Grado (e.g. 7a)"
                      value={newRouteForm.grado}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, grado: e.target.value })}
                      required
                      className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Altura"
                      value={newRouteForm.altura}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, altura: e.target.value })}
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Chapas"
                      value={newRouteForm.chapas || ''}
                      onChange={(e) => setNewRouteForm({ ...newRouteForm, chapas: Number(e.target.value) })}
                      className="w-1/2 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 py-2"
                  >
                    <Plus className="w-4 h-4" /> Registrar Vía en {activeGroupTab}
                  </button>
                </form>

              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL -- ADD PROVINCE */}
      {showAddProvinceModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-850 w-full max-w-sm rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Crear Provincia</h3>
              <button onClick={() => setShowAddProvinceModal(false)} className="text-zinc-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddProvince} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nombre de la Provincia</label>
                <input
                  type="text"
                  placeholder="e.g. Córdoba, San Juan, etc."
                  value={newProvinceName}
                  onChange={(e) => setNewProvinceName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 transition outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1"
              >
                Crear Provincia
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL -- ADD AREA */}
      {showAddAreaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-850 w-full max-w-sm rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Crear Área/Zona</h3>
              <button onClick={() => setShowAddAreaModal(false)} className="text-zinc-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddArea} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nombre del Área</label>
                <input
                  type="text"
                  placeholder="e.g. El Pantano, Los Gigantes, Copina"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 transition outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1"
              >
                Crear Área
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL -- ADD SECTOR */}
      {showAddSectorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-850 w-full max-w-md rounded-2xl overflow-hidden p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
              <h3 className="font-bold text-white text-base">Crear Nuevo Sector</h3>
              <button onClick={() => setShowAddSectorModal(false)} className="text-zinc-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSector} className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Nombre Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Desplome de Satán, Placas"
                  value={newSectorName}
                  onChange={(e) => setNewSectorName(e.target.value)}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 transition outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Descripción</label>
                <textarea
                  placeholder="Comentarios o indicaciones de la roca..."
                  value={newSectorDesc}
                  onChange={(e) => setNewSectorDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-650 transition outline-none h-16 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Imagen URL (opcional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newSectorImage}
                  onChange={(e) => setNewSectorImage(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 transition outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1"
              >
                Crear Sector
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
