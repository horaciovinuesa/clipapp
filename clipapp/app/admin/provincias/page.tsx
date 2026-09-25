'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../layout';
import { 
  Province, 
  Area, 
  Sector, 
  Route,
  TopoBlock
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
  RefreshCw,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ListOrdered,
  Hash,
  Tag
} from 'lucide-react';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject, StorageReference } from 'firebase/storage';
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

// Helper to ensure sector has a dynamic topos array and vias have topoId
export function ensureSectorTopos(sData: any): { topos: TopoBlock[]; vias: Route[] } {
  let topos: TopoBlock[] = Array.isArray(sData.topos)
    ? sData.topos.map((t: any) => ({ ...t }))
    : [];
  let vias: Route[] = Array.isArray(sData.vias)
    ? sData.vias.map((v: any) => ({ ...v }))
    : [];

  if (topos.length === 0) {
    const legacyBlocks = [
      { id: 'topo_izq', nombre: 'Pared Izquierda', imageUrl: sData.izquierdaImageUrl },
      { id: 'topo_cen', nombre: 'Pared Central', imageUrl: sData.centroImageUrl },
      { id: 'topo_der', nombre: 'Pared Derecha', imageUrl: sData.derechaImageUrl },
      { id: 'topo_gen', nombre: 'Pared General', imageUrl: sData.generalImageUrl },
    ];
    for (const lb of legacyBlocks) {
      if (lb.imageUrl && typeof lb.imageUrl === 'string' && lb.imageUrl.trim() !== '') {
        topos.push({
          id: lb.id,
          nombre: lb.nombre,
          imageUrl: lb.imageUrl,
        });
      }
    }
  }

  // Ensure every via has a topoId
  vias = vias.map(via => {
    let topoId = via.topoId;
    if (!topoId) {
      const g = (via.grupo || '').toLowerCase();
      if (g === 'izquierda') topoId = 'topo_izq';
      else if (g === 'centro') topoId = 'topo_cen';
      else if (g === 'derecha') topoId = 'topo_der';
      else if (g === 'general') topoId = 'topo_gen';
    }
    return {
      ...via,
      topoId: topoId || (topos.length > 0 ? topos[0].id : undefined),
    };
  });

  return { topos, vias };
}

export function normalizeProvincesData(provList: Province[]): Province[] {
  return provList.map(p => ({
    ...p,
    areas: p.areas.map(a => ({
      ...a,
      sectores: a.sectores.map(s => {
        const { topos, vias } = ensureSectorTopos(s);
        return {
          ...s,
          topos,
          vias
        };
      })
    }))
  }));
}

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
  const [newAreaSubRegion, setNewAreaSubRegion] = useState('General');
  const [newAreaCustomSubRegion, setNewAreaCustomSubRegion] = useState('');

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
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Active route set tab inside Sector view
  const [activeGroupTab, setActiveGroupTab] = useState<'General' | 'Izquierda' | 'Centro' | 'Derecha'>('General');

  // Province metadata edit states
  const [isEditingProvince, setIsEditingProvince] = useState(false);
  const [provinceEditName, setProvinceEditName] = useState('');
  const [provinceEditImage, setProvinceEditImage] = useState('');
  const [provinceEditPdf, setProvinceEditPdf] = useState('');

  // Area metadata edit states
  const [isEditingArea, setIsEditingArea] = useState(false);
  const [areaEditName, setAreaEditName] = useState('');
  const [areaEditDesc, setAreaEditDesc] = useState('');
  const [areaEditTiempoCaminata, setAreaEditTiempoCaminata] = useState('');
  const [areaEditGoogleMapsLink, setAreaEditGoogleMapsLink] = useState('');
  const [areaEditHospitalLink, setAreaEditHospitalLink] = useState('');
  const [areaEditWindguruLink, setAreaEditWindguruLink] = useState('');
  const [areaEditImage, setAreaEditImage] = useState('');
  const [areaEditHowToGetImage, setAreaEditHowToGetImage] = useState('');
  const [areaEditOverviewImage, setAreaEditOverviewImage] = useState('');
  const [areaEditSubRegion, setAreaEditSubRegion] = useState('');

  // Sector title/image inline edits
  const [sectorEditName, setSectorEditName] = useState('');
  const [sectorEditDesc, setSectorEditDesc] = useState('');
  const [sectorEditImage, setSectorEditImage] = useState('');
  const [sectorEditOverviewImage, setSectorEditOverviewImage] = useState('');
  const [sectorEditComoLlegarImage, setSectorEditComoLlegarImage] = useState('');
  const [sectorEditGeneralImage, setSectorEditGeneralImage] = useState('');
  const [sectorEditIzquierdaImage, setSectorEditIzquierdaImage] = useState('');
  const [sectorEditCentroImage, setSectorEditCentroImage] = useState('');
  const [sectorEditDerechaImage, setSectorEditDerechaImage] = useState('');

  // Auto-clear success message
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const [isUploading, setIsUploading] = useState<Record<string, boolean>>({});

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    entityType: 'province' | 'area' | 'sector',
    fieldName: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (entityType === 'province' && !selectedProvinceId) {
      setActionMessage({ text: 'Por favor, selecciona una provincia primero.', type: 'error' });
      return;
    }
    if (entityType === 'area' && (!selectedProvinceId || !selectedAreaId)) {
      setActionMessage({ text: 'Por favor, selecciona una provincia y una zona primero.', type: 'error' });
      return;
    }
    if (entityType === 'sector' && (!selectedProvinceId || !selectedAreaId || !selectedSector)) {
      setActionMessage({ text: 'Por favor, selecciona una provincia, zona y sector primero.', type: 'error' });
      return;
    }

    const key = `${entityType}-${fieldName}`;
    setIsUploading(prev => ({ ...prev, [key]: true }));
    setActionMessage({ text: `Subiendo archivo a Storage...`, type: 'info' });

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      let path = '';
      if (entityType === 'province') {
        path = `provincias/${selectedProvinceId}/${fieldName}.${ext}`;
      } else if (entityType === 'area') {
        path = `provincias/${selectedProvinceId}/${selectedAreaId}/${fieldName}.${ext}`;
      } else {
        path = `provincias/${selectedProvinceId}/${selectedAreaId}/${selectedSector!.id}/${fieldName}.${ext}`;
      }

      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update corresponding state
      if (entityType === 'province') {
        if (fieldName === 'imageUrl') setProvinceEditImage(downloadURL);
        else if (fieldName === 'pdfUrl') setProvinceEditPdf(downloadURL);
      } else if (entityType === 'area') {
        if (fieldName === 'imageUrl') setAreaEditImage(downloadURL);
        else if (fieldName === 'howToGetImageUrl') setAreaEditHowToGetImage(downloadURL);
        else if (fieldName === 'overviewImageUrl') setAreaEditOverviewImage(downloadURL);
      } else {
        if (fieldName === 'imageUrl') setSectorEditImage(downloadURL);
        else if (fieldName === 'overviewImageUrl') setSectorEditOverviewImage(downloadURL);
        else if (fieldName === 'comoLlegarImageUrl') setSectorEditComoLlegarImage(downloadURL);
        else if (fieldName === 'generalImageUrl') setSectorEditGeneralImage(downloadURL);
        else if (fieldName === 'izquierdaImageUrl') setSectorEditIzquierdaImage(downloadURL);
        else if (fieldName === 'centroImageUrl') setSectorEditCentroImage(downloadURL);
        else if (fieldName === 'derechaImageUrl') setSectorEditDerechaImage(downloadURL);
      }

      setActionMessage({ text: 'Archivo subido y URL actualizada.', type: 'success' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(err);
      setActionMessage({ text: `Error al subir archivo: ${errorMsg}`, type: 'error' });
    } finally {
      setIsUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Load Provinces
  const loadProvinces = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // Load from LocalStorage or fallback to climbingData
        const localData = localStorage.getItem('clipapp_provinces');
        if (localData) {
          const parsed = JSON.parse(localData);
          const normalized = normalizeProvincesData(parsed);
          setProvinces(normalized);
          if (normalized.length > 0) {
            // Find "córdoba" (case-insensitive) or default to index 0
            const cordobaIndex = normalized.findIndex((p: Province) => p.nombre.toLowerCase().includes('cordoba') || p.id === 'cordoba');
            const defaultIndex = cordobaIndex !== -1 ? cordobaIndex : 0;
            setSelectedProvinceId(normalized[defaultIndex].id);
            if (normalized[defaultIndex].areas.length > 0) {
              setSelectedAreaId(normalized[defaultIndex].areas[0].id);
            }
          }
        } else {
          const normalized = normalizeProvincesData(climbingData);
          setProvinces(normalized);
          localStorage.setItem('clipapp_provinces', JSON.stringify(normalized));
          if (normalized.length > 0) {
            const cordobaIndex = normalized.findIndex((p: Province) => p.nombre.toLowerCase().includes('cordoba') || p.id === 'cordoba');
            const defaultIndex = cordobaIndex !== -1 ? cordobaIndex : 0;
            setSelectedProvinceId(normalized[defaultIndex].id);
            if (normalized[defaultIndex].areas.length > 0) {
              setSelectedAreaId(normalized[defaultIndex].areas[0].id);
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
              const { topos, vias } = ensureSectorTopos(sData);
              sectores.push({
                id: secDoc.id,
                nombre: sData.nombre || '',
                descripcion: sData.descripcion || '',
                imageUrl: sData.imageUrl || '',
                overviewImageUrl: sData.overviewImageUrl || '',
                comoLlegarImageUrl: sData.comoLlegarImageUrl || '',
                generalImageUrl: sData.generalImageUrl || '',
                izquierdaImageUrl: sData.izquierdaImageUrl || '',
                centroImageUrl: sData.centroImageUrl || '',
                derechaImageUrl: sData.derechaImageUrl || '',
                topos,
                vias
              });
            });
            
            areas.push({
              id: areaId,
              nombre: aData.nombre || '',
              descripcion: aData.descripcion || '',
              tiempoCaminata: aData.tiempoCaminata || '',
              googleMapsLink: aData.googleMapsLink || '',
              hospitalLink: aData.hospitalLink || '',
              windguruLink: aData.windguruLink || '',
              imageUrl: aData.imageUrl || '',
              howToGetImageUrl: aData.howToGetImageUrl || '',
              overviewImageUrl: aData.overviewImageUrl || '',
              sectores,
              subRegion: aData.subRegion || 'General'
            });
          }
          
          tempProvinces.push({
            id: provId,
            nombre: pData.nombre || '',
            imageUrl: pData.imageUrl || '',
            pdfUrl: pData.pdfUrl || '',
            areas
          });
        }
        
        setProvinces(tempProvinces);
        if (tempProvinces.length > 0) {
          const cordobaIndex = tempProvinces.findIndex((p: Province) => p.nombre.toLowerCase().includes('cordoba') || p.id === 'cordoba');
          const defaultIndex = cordobaIndex !== -1 ? cordobaIndex : 0;
          setSelectedProvinceId(tempProvinces[defaultIndex].id);
          if (tempProvinces[defaultIndex].areas.length > 0) {
            setSelectedAreaId(tempProvinces[defaultIndex].areas[0].id);
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

  const activeProvince = provinces.find(p => p.id === selectedProvinceId);
  const activeArea = activeProvince?.areas.find(a => a.id === selectedAreaId);

  // Sync edited area data to state when selecting a different Area
  useEffect(() => {
    if (activeArea) {
      setAreaEditName(activeArea.nombre);
      setAreaEditDesc(activeArea.descripcion || '');
      setAreaEditTiempoCaminata(activeArea.tiempoCaminata || '');
      setAreaEditGoogleMapsLink(activeArea.googleMapsLink || '');
      setAreaEditHospitalLink(activeArea.hospitalLink || '');
      setAreaEditWindguruLink(activeArea.windguruLink || '');
      setAreaEditImage(activeArea.imageUrl || '');
      setAreaEditHowToGetImage(activeArea.howToGetImageUrl || '');
      setAreaEditOverviewImage(activeArea.overviewImageUrl || '');
      setAreaEditSubRegion(activeArea.subRegion || 'General');
      setIsEditingArea(false);
    } else {
      setIsEditingArea(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAreaId, selectedProvinceId]);

  // Sync edited province data to state when selecting a different Province
  useEffect(() => {
    if (activeProvince) {
      setProvinceEditName(activeProvince.nombre);
      setProvinceEditImage(activeProvince.imageUrl || '');
      setProvinceEditPdf(activeProvince.pdfUrl || '');
      setIsEditingProvince(false);
    } else {
      setIsEditingProvince(false);
    }
  }, [selectedProvinceId, activeProvince]);

  // Sync edited sector data to state when opening Sector Editor
  useEffect(() => {
    if (selectedSector) {
      setSectorEditName(selectedSector.nombre);
      setSectorEditDesc(selectedSector.descripcion || '');
      setSectorEditImage(selectedSector.imageUrl || '');
      setSectorEditOverviewImage(selectedSector.overviewImageUrl || '');
      setSectorEditComoLlegarImage(selectedSector.comoLlegarImageUrl || '');
      setSectorEditGeneralImage(selectedSector.generalImageUrl || '');
      setSectorEditIzquierdaImage(selectedSector.izquierdaImageUrl || '');
      setSectorEditCentroImage(selectedSector.centroImageUrl || '');
      setSectorEditDerechaImage(selectedSector.derechaImageUrl || '');
      // Select appropriate tab based on routes.
      // If there are left/center/right routes, default to Left. Otherwise General.
      const hasGroups = selectedSector.vias.some(v => v.grupo !== 'General');
      setActiveGroupTab(hasGroups ? 'Izquierda' : 'General');
    }
  }, [selectedSector]);

  // Local Save utility (Demo mode helper)
  const saveProvincesToLocal = (updatedProvinces: Province[]) => {
    setProvinces(updatedProvinces);
    localStorage.setItem('clipapp_provinces', JSON.stringify(updatedProvinces));
  };

  // Seeding Firebase DB
  // Seeding Firebase DB (Factory Reset)
  const seedFirebase = async () => {
    const confirmMessage = 
      "⚠️ ADVERTENCIA CRÍTICA DE SOBRESCRITURA ⚠️\n\n" +
      "Esta función REEMPLAZARÁ TODOS LOS DATOS EN VIVO DE FIRESTORE por el archivo estático inicial 'climbingData.json'.\n\n" +
      "Cualquier modificación manual que hayas realizado en el Admin Web (vías agregadas, borradas o editadas) SE PERDERÁ PERMANENTEMENTE.\n\n" +
      "¿Estás seguro de que deseas restablecer la base de datos a los valores de fábrica?";

    if (!window.confirm(confirmMessage)) return;
    if (!window.confirm("CONFIRMACIÓN FINAL: ¿Deseas sobrescribir Firestore con la copia de fábrica estática?")) return;

    setSeeding(true);
    setActionMessage({ text: "Iniciando restablecimiento de base de datos...", type: 'info' });
    try {
      for (const prov of climbingData) {
        // Write Province
        const provRef = doc(db, 'provincias', prov.id);
        await setDoc(provRef, { 
          nombre: prov.nombre,
          imageUrl: prov.imageUrl || '',
          pdfUrl: prov.pdfUrl || ''
        });

        for (const area of prov.areas) {
          // Write Area
          const areaRef = doc(db, `provincias/${prov.id}/areas`, area.id);
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
            // Write Sector
            const secRef = doc(db, `provincias/${prov.id}/areas/${area.id}/sectores`, sector.id);
            await setDoc(secRef, {
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
      setActionMessage({ text: "Firestore inicializado con éxito.", type: 'success' });
      loadProvinces();
    } catch (err: unknown) {
      const e = err as { message?: string };
      console.error(e);
      setActionMessage({ text: `Fallo al inicializar: ${e.message}`, type: 'error' });
    } finally {
      setSeeding(false);
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
      areas: [],
      imageUrl: '',
      pdfUrl: ''
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
        await setDoc(doc(db, 'provincias', newId), { 
          nombre: newProvObj.nombre,
          imageUrl: '',
          pdfUrl: ''
        });
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

  // CRUD -- SAVE PROVINCE DETAILS
  const handleSaveProvinceData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProvince) return;

    setSaving(true);

    const updatedProvObj: Province = {
      ...activeProvince,
      nombre: provinceEditName.trim(),
      imageUrl: provinceEditImage.trim(),
      pdfUrl: provinceEditPdf.trim()
    };

    const updatedProvinces = provinces.map(p => {
      if (p.id === activeProvince.id) {
        return updatedProvObj;
      }
      return p;
    });

    if (isDemoMode) {
      saveProvincesToLocal(updatedProvinces);
      setIsEditingProvince(false);
      setSaving(false);
      setActionMessage({ text: "Datos de la provincia actualizados localmente.", type: 'success' });
    } else {
      try {
        const provRef = doc(db, 'provincias', activeProvince.id);
        await updateDoc(provRef, {
          nombre: updatedProvObj.nombre,
          imageUrl: updatedProvObj.imageUrl || '',
          pdfUrl: updatedProvObj.pdfUrl || ''
        });
        setProvinces(updatedProvinces);
        setIsEditingProvince(false);
        setActionMessage({ text: "Provincia guardada en Firestore con éxito.", type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error al guardar provincia: ${e.message}`, type: 'error' });
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

    const subRegionValue = newAreaSubRegion === 'Otro' 
      ? (newAreaCustomSubRegion.trim() || 'General') 
      : newAreaSubRegion;

    const newAreaObj: Area = {
      id: newId,
      nombre: newAreaName.trim(),
      descripcion: '',
      tiempoCaminata: '',
      googleMapsLink: '',
      hospitalLink: '',
      windguruLink: '',
      imageUrl: '',
      howToGetImageUrl: '',
      overviewImageUrl: '',
      sectores: [],
      subRegion: subRegionValue
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
      setNewAreaSubRegion('General');
      setNewAreaCustomSubRegion('');
      setActionMessage({ text: `Zona '${newAreaName}' creada localmente.`, type: 'success' });
    } else {
      setSaving(true);
      try {
        await setDoc(doc(db, `provincias/${selectedProvinceId}/areas`, newId), {
          nombre: newAreaObj.nombre,
          descripcion: '',
          tiempoCaminata: '',
          googleMapsLink: '',
          hospitalLink: '',
          windguruLink: '',
          imageUrl: '',
          howToGetImageUrl: '',
          overviewImageUrl: '',
          subRegion: subRegionValue
        });
        setProvinces(updatedProvinces);
        setSelectedAreaId(newId);
        setShowAddAreaModal(false);
        setNewAreaName('');
        setNewAreaSubRegion('General');
        setNewAreaCustomSubRegion('');
        setActionMessage({ text: `Zona '${newAreaObj.nombre}' guardada en Firestore.`, type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error: ${e.message}`, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  // CRUD -- SAVE AREA DETAILS
  const handleSaveAreaData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArea || !selectedProvinceId) return;

    setSaving(true);

    const updatedAreaObj: Area = {
      ...activeArea,
      nombre: areaEditName.trim(),
      descripcion: areaEditDesc.trim(),
      tiempoCaminata: areaEditTiempoCaminata.trim(),
      googleMapsLink: areaEditGoogleMapsLink.trim(),
      hospitalLink: areaEditHospitalLink.trim(),
      windguruLink: areaEditWindguruLink.trim(),
      imageUrl: areaEditImage.trim(),
      howToGetImageUrl: areaEditHowToGetImage.trim(),
      overviewImageUrl: areaEditOverviewImage.trim(),
      subRegion: areaEditSubRegion.trim() || 'General'
    };

    const updatedProvinces = provinces.map(p => {
      if (p.id === selectedProvinceId) {
        return {
          ...p,
          areas: p.areas.map(a => {
            if (a.id === activeArea.id) {
              return updatedAreaObj;
            }
            return a;
          })
        };
      }
      return p;
    });

    if (isDemoMode) {
      saveProvincesToLocal(updatedProvinces);
      setIsEditingArea(false);
      setSaving(false);
      setActionMessage({ text: "Datos de la zona actualizados localmente.", type: 'success' });
    } else {
      try {
        const areaRef = doc(db, `provincias/${selectedProvinceId}/areas`, activeArea.id);
        await updateDoc(areaRef, {
          nombre: updatedAreaObj.nombre,
          descripcion: updatedAreaObj.descripcion || '',
          tiempoCaminata: updatedAreaObj.tiempoCaminata || '',
          googleMapsLink: updatedAreaObj.googleMapsLink || '',
          hospitalLink: updatedAreaObj.hospitalLink || '',
          windguruLink: updatedAreaObj.windguruLink || '',
          imageUrl: updatedAreaObj.imageUrl || '',
          howToGetImageUrl: updatedAreaObj.howToGetImageUrl || '',
          overviewImageUrl: updatedAreaObj.overviewImageUrl || '',
          subRegion: updatedAreaObj.subRegion
        });
        setProvinces(updatedProvinces);
        setIsEditingArea(false);
        setActionMessage({ text: "Zona guardada en Firestore con éxito.", type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error al guardar: ${e.message}`, type: 'error' });
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
      overviewImageUrl: '',
      comoLlegarImageUrl: '',
      generalImageUrl: '',
      izquierdaImageUrl: '',
      centroImageUrl: '',
      derechaImageUrl: '',
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
          overviewImageUrl: '',
          comoLlegarImageUrl: '',
          generalImageUrl: '',
          izquierdaImageUrl: '',
          centroImageUrl: '',
          derechaImageUrl: '',
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
          overviewImageUrl: updatedSector.overviewImageUrl || '',
          comoLlegarImageUrl: updatedSector.comoLlegarImageUrl || '',
          topos: updatedSector.topos || [],
          generalImageUrl: updatedSector.generalImageUrl || '',
          izquierdaImageUrl: updatedSector.izquierdaImageUrl || '',
          centroImageUrl: updatedSector.centroImageUrl || '',
          derechaImageUrl: updatedSector.derechaImageUrl || '',
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
      imageUrl: sectorEditImage,
      overviewImageUrl: sectorEditOverviewImage,
      comoLlegarImageUrl: sectorEditComoLlegarImage,
      generalImageUrl: sectorEditGeneralImage,
      izquierdaImageUrl: sectorEditIzquierdaImage,
      centroImageUrl: sectorEditCentroImage,
      derechaImageUrl: sectorEditDerechaImage
    };
    handleSaveSectorData(updated);
  };

  // Topo Block management
  const handleAddTopoBlock = () => {
    if (!selectedSector) return;
    const currentTopos = selectedSector.topos || [];
    const newTopo: TopoBlock = {
      id: `topo_${Date.now()}`,
      nombre: `Bloque ${currentTopos.length + 1}`,
      imageUrl: ''
    };
    const updatedSector: Sector = {
      ...selectedSector,
      topos: [...currentTopos, newTopo]
    };
    handleSaveSectorData(updatedSector);
    setActionMessage({ text: "Nuevo bloque de croquis añadido.", type: 'success' });
  };

  const handleDeleteTopoBlock = (topoId: string) => {
    if (!selectedSector) return;
    if (!window.confirm("¿Seguro que deseas eliminar este bloque de croquis? Las vías asociadas pasarán a estar Sin Asignar.")) return;
    const currentTopos = (selectedSector.topos || []).filter(t => t.id !== topoId);
    const updatedVias = selectedSector.vias.map(v => v.topoId === topoId ? { ...v, topoId: undefined } : v);
    handleSaveSectorData({
      ...selectedSector,
      topos: currentTopos,
      vias: updatedVias
    });
  };

  const handleMoveTopoBlock = (index: number, direction: 'up' | 'down') => {
    if (!selectedSector || !selectedSector.topos) return;
    const currentTopos = [...selectedSector.topos];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentTopos.length) return;
    const temp = currentTopos[index];
    currentTopos[index] = currentTopos[targetIndex];
    currentTopos[targetIndex] = temp;
    handleSaveSectorData({
      ...selectedSector,
      topos: currentTopos
    });
  };

  const handleUpdateTopoBlockInfo = (topoId: string, updates: Partial<TopoBlock>) => {
    if (!selectedSector || !selectedSector.topos) return;
    const currentTopos = selectedSector.topos.map(t => t.id === topoId ? { ...t, ...updates } : t);
    handleSaveSectorData({
      ...selectedSector,
      topos: currentTopos
    });
  };

  const handleTopoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, topoId: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProvinceId || !selectedAreaId || !selectedSector) return;

    const key = `topo-${topoId}`;
    setIsUploading(prev => ({ ...prev, [key]: true }));
    setActionMessage({ text: `Subiendo imagen de croquis...`, type: 'info' });

    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `provincias/${selectedProvinceId}/${selectedAreaId}/${selectedSector.id}/topos/${topoId}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      handleUpdateTopoBlockInfo(topoId, { imageUrl: downloadURL });
      setActionMessage({ text: 'Imagen de croquis actualizada.', type: 'success' });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(err);
      setActionMessage({ text: `Error al subir imagen: ${errorMsg}`, type: 'error' });
    } finally {
      setIsUploading(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleAddRouteToTopo = (topoId?: string) => {
    if (!selectedSector) return;
    const newRoute: Route = {
      id: `r-${Date.now()}`,
      nombre: 'Nueva Vía',
      grado: '6a',
      altura: '15m',
      chapas: 6,
      topoId: topoId
    };
    handleSaveSectorData({
      ...selectedSector,
      vias: [...selectedSector.vias, newRoute]
    });
    setEditingRouteId(newRoute.id);
    setRouteForm(newRoute);
  };

  const handleBulkNumberViasForTopo = (topoId?: string) => {
    if (!selectedSector) return;
    let counter = 1;
    const updatedVias = selectedSector.vias.map((via) => {
      if (topoId !== undefined && via.topoId !== topoId) return via;
      const cleanNombre = via.nombre.replace(/^\d+\s*[\-\.]\s*/, '').trim();
      const numberedNombre = `${counter}- ${cleanNombre}`;
      counter++;
      return { ...via, nombre: numberedNombre };
    });
    handleSaveSectorData({ ...selectedSector, vias: updatedVias });
  };

  const handleBulkRemoveNumberingForTopo = (topoId?: string) => {
    if (!selectedSector) return;
    const updatedVias = selectedSector.vias.map((via) => {
      if (topoId !== undefined && via.topoId !== topoId) return via;
      const cleanNombre = via.nombre.replace(/^\d+\s*[\-\.]\s*/, '').trim();
      return { ...via, nombre: cleanNombre };
    });
    handleSaveSectorData({ ...selectedSector, vias: updatedVias });
  };

  const moveRouteInTopo = (topoId: string | undefined, index: number, direction: 'up' | 'down') => {
    if (!selectedSector) return;
    const topoVias = selectedSector.vias.filter(v => v.topoId === topoId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= topoVias.length) return;

    const itemA = topoVias[index];
    const itemB = topoVias[targetIndex];

    const viasCopy = [...selectedSector.vias];
    const indexA = viasCopy.findIndex(v => v.id === itemA.id);
    const indexB = viasCopy.findIndex(v => v.id === itemB.id);

    if (indexA !== -1 && indexB !== -1) {
      const temp = viasCopy[indexA];
      viasCopy[indexA] = viasCopy[indexB];
      viasCopy[indexB] = temp;
      handleSaveSectorData({ ...selectedSector, vias: viasCopy });
    }
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

  // Bulk Editor Vías
  const startBulkEdit = () => {
    if (!selectedSector) return;
    const text = selectedSector.vias
      .map(v => `${v.nombre} | ${v.grado} | ${v.altura || ''} | ${v.chapas || 0} | ${v.grupo || 'General'}`)
      .join('\n');
    setBulkText(text);
    setIsBulkEditing(true);
  };

  const handleSaveBulk = () => {
    if (!selectedSector) return;
    if (!window.confirm("¿Estás seguro de que deseas guardar esta edición en lote? Esto actualizará permanentemente las vías en la base de datos de Firestore.")) return;

    const lines = bulkText.split('\n');
    const parsedVias: Route[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      const parts = trimmedLine.split('|');
      const nombre = parts[0]?.trim() || '';
      const grado = parts[1]?.trim() || '';
      const altura = parts[2]?.trim() || '15m';
      const chapas = Number(parts[3]?.trim()) || 0;
      let grupo = parts[4]?.trim() || 'General';

      const validGroups = ['General', 'Izquierda', 'Centro', 'Derecha'];
      if (!validGroups.includes(grupo)) {
        grupo = validGroups.includes(activeGroupTab) ? activeGroupTab : 'General';
      }

      parsedVias.push({
        id: `r-${Date.now()}-${index}`,
        nombre,
        grado,
        altura,
        chapas,
        grupo: grupo as 'General' | 'Izquierda' | 'Centro' | 'Derecha'
      });
    });

    const updatedSector = {
      ...selectedSector,
      vias: parsedVias
    };

    handleSaveSectorData(updatedSector);
    setIsBulkEditing(false);
  };

  // Automatic Sequential Numbering for Vías
  const handleBulkNumberVias = (scope: 'group' | 'all') => {
    if (!selectedSector) return;

    const scopeLabel = scope === 'group' ? `las vías del grupo "${activeGroupTab}"` : 'TODAS las vías de este sector';
    const confirmMessage = `¿Estás seguro de que deseas aplicar la numeración secuencial (1-, 2-...) a ${scopeLabel}?\n\nEsta acción modificará y actualizará permanentemente los nombres de las vías en la base de datos de Firestore.`;

    if (!window.confirm(confirmMessage)) return;
    
    let counter = 1;
    const updatedVias = selectedSector.vias.map((via) => {
      if (scope === 'group' && via.grupo !== activeGroupTab) {
        return via;
      }
      
      const cleanNombre = via.nombre.replace(/^\d+\s*[\-\.]\s*/, '').trim();
      const numberedNombre = `${counter}- ${cleanNombre}`;
      counter++;

      return {
        ...via,
        nombre: numberedNombre
      };
    });

    const updatedSector = {
      ...selectedSector,
      vias: updatedVias
    };

    handleSaveSectorData(updatedSector);
    setActionMessage({ 
      text: scope === 'group' 
        ? `Se aplicó numeración (1-, 2-...) a las vías de ${activeGroupTab}.` 
        : 'Se aplicó numeración (1-, 2-...) a todas las vías del sector.', 
      type: 'success' 
    });
  };

  // Remove Sequential Numbering from Vías
  const handleBulkRemoveNumbering = (scope: 'group' | 'all') => {
    if (!selectedSector) return;

    const scopeLabel = scope === 'group' ? `las vías del grupo "${activeGroupTab}"` : 'TODAS las vías de este sector';
    const confirmMessage = `¿Estás seguro de que deseas quitar la numeración de ${scopeLabel}?\n\nEsta acción modificará y actualizará permanentemente los nombres de las vías en la base de datos de Firestore.`;

    if (!window.confirm(confirmMessage)) return;

    const updatedVias = selectedSector.vias.map((via) => {
      if (scope === 'group' && via.grupo !== activeGroupTab) {
        return via;
      }

      const cleanNombre = via.nombre.replace(/^\d+\s*[\-\.]\s*/, '').trim();

      return {
        ...via,
        nombre: cleanNombre
      };
    });

    const updatedSector = {
      ...selectedSector,
      vias: updatedVias
    };

    handleSaveSectorData(updatedSector);
    setActionMessage({ 
      text: scope === 'group' 
        ? `Se quitó la numeración a las vías de ${activeGroupTab}.` 
        : 'Se quitó la numeración a todas las vías del sector.', 
      type: 'success' 
    });
  };

  // Reordering Vías
  const moveRoute = (index: number, direction: 'up' | 'down') => {
    if (!selectedSector) return;
    const routesToOrder = selectedSector.vias.filter(v => v.grupo === activeGroupTab) || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= routesToOrder.length) return;

    const itemA = routesToOrder[index];
    const itemB = routesToOrder[targetIndex];

    const viasCopy = [...selectedSector.vias];
    const indexA = viasCopy.findIndex(v => v.id === itemA.id);
    const indexB = viasCopy.findIndex(v => v.id === itemB.id);

    if (indexA !== -1 && indexB !== -1) {
      const temp = viasCopy[indexA];
      viasCopy[indexA] = viasCopy[indexB];
      viasCopy[indexB] = temp;

      handleSaveSectorData({
        ...selectedSector,
        vias: viasCopy
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || !selectedSector) return;

    const routesToOrder = selectedSector.vias.filter(v => v.grupo === activeGroupTab) || [];
    const itemA = routesToOrder[draggedIndex];
    const itemB = routesToOrder[targetIndex];

    const viasCopy = [...selectedSector.vias];
    const indexA = viasCopy.findIndex(v => v.id === itemA.id);
    const indexB = viasCopy.findIndex(v => v.id === itemB.id);

    if (indexA !== -1 && indexB !== -1) {
      const [removed] = viasCopy.splice(indexA, 1);
      const newIndexB = viasCopy.findIndex(v => v.id === itemB.id);
      viasCopy.splice(newIndexB, 0, removed);

      handleSaveSectorData({
        ...selectedSector,
        vias: viasCopy
      });
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
        // Delete Firestore document
        await deleteDoc(doc(db, `provincias/${selectedProvinceId}/areas/${selectedAreaId}/sectores`, sectorId));

        // Delete Firebase Storage files for this sector
        const sectorStorageRef = ref(storage, `provincias/${selectedProvinceId}/${selectedAreaId}/${sectorId}`);
        try {
          const listResult = await listAll(sectorStorageRef);
          await Promise.all(
            listResult.items.map((itemRef) => deleteObject(itemRef))
          );
        } catch (storageErr) {
          console.warn("Storage deletion error (probably empty folder or permission issue):", storageErr);
        }

        setProvinces(updatedProvinces);
        setSelectedSector(null);
        setActionMessage({ text: "Sector y sus imágenes eliminados de Firestore y Storage.", type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error: ${e.message}`, type: 'error' });
      } finally {
        setSaving(false);
      }
    }
  };

  // CRUD -- DELETE AREA
  const handleDeleteArea = async (areaId: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta zona, todos sus sectores y todas sus vías y archivos asociados permanentemente?")) return;
    
    const updatedProvinces = provinces.map(p => {
      if (p.id === selectedProvinceId) {
        return {
          ...p,
          areas: p.areas.filter(a => a.id !== areaId)
        };
      }
      return p;
    });

    if (isDemoMode) {
      saveProvincesToLocal(updatedProvinces);
      setSelectedAreaId('');
      setSelectedSector(null);
      setActionMessage({ text: "Zona eliminada localmente.", type: 'success' });
    } else {
      setSaving(true);
      try {
        // Delete all sectors in this area (Firestore)
        const areaSectorsRef = collection(db, `provincias/${selectedProvinceId}/areas/${areaId}/sectores`);
        const sectorsSnap = await getDocs(areaSectorsRef);
        await Promise.all(
          sectorsSnap.docs.map(sectorDoc => deleteDoc(doc(db, `provincias/${selectedProvinceId}/areas/${areaId}/sectores`, sectorDoc.id)))
        );

        // Delete parent Area document (Firestore)
        await deleteDoc(doc(db, `provincias/${selectedProvinceId}/areas`, areaId));

        // Delete all Firebase Storage files under `provincias/{provinceId}/{areaId}` recursively
        const areaStorageRef = ref(storage, `provincias/${selectedProvinceId}/${areaId}`);
        
        const deleteStorageFolderRecursive = async (folderRef: StorageReference) => {
          const listResult = await listAll(folderRef);
          
          // Delete files
          const deleteFiles = listResult.items.map((itemRef) => deleteObject(itemRef));
          
          // Recursively delete subfolders
          const deleteSubfolders = listResult.prefixes.map((prefixRef) => deleteStorageFolderRecursive(prefixRef));
          
          await Promise.all([...deleteFiles, ...deleteSubfolders]);
        };

        try {
          await deleteStorageFolderRecursive(areaStorageRef);
        } catch (storageErr) {
          console.warn("Storage recursive deletion error (likely empty folder or permission issue):", storageErr);
        }

        setProvinces(updatedProvinces);
        setSelectedAreaId('');
        setSelectedSector(null);
        setActionMessage({ text: "Zona, sectores y archivos eliminados de Firestore y Storage.", type: 'success' });
      } catch (err: unknown) {
        const e = err as { message?: string };
        setActionMessage({ text: `Error al eliminar zona: ${e.message}`, type: 'error' });
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

  const getActiveCroquisUrl = () => {
    if (activeGroupTab === 'General') return sectorEditGeneralImage;
    if (activeGroupTab === 'Izquierda') return sectorEditIzquierdaImage;
    if (activeGroupTab === 'Centro') return sectorEditCentroImage;
    if (activeGroupTab === 'Derecha') return sectorEditDerechaImage;
    return '';
  };

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
                  setSelectedAreaId('');
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

              <div className="space-y-3">
                {activeProvince.areas.length === 0 ? (
                  <p className="text-xs text-zinc-500 italic p-2">Sin zonas creadas.</p>
                ) : (
                  Object.entries(
                    activeProvince.areas.reduce((acc, area) => {
                      const group = area.subRegion?.trim() || 'General';
                      if (!acc[group]) acc[group] = [];
                      acc[group].push(area);
                      return acc;
                    }, {} as Record<string, Area[]>)
                  ).map(([groupName, groupAreas]) => (
                    <div key={groupName} className="space-y-1">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400/90 bg-zinc-900/80 rounded-lg border border-zinc-800/60">
                        <Tag className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{groupName}</span>
                        <span className="ml-auto text-[9px] text-zinc-500 font-normal flex-shrink-0">({groupAreas.length})</span>
                      </div>
                      <div className="space-y-0.5 pl-1">
                        {groupAreas.map((area) => (
                          <button
                            key={area.id}
                            onClick={() => {
                              setSelectedAreaId(area.id);
                              setSelectedSector(null);
                            }}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                              selectedAreaId === area.id 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold' 
                                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                            }`}
                          >
                            <Folder className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                            <span className="truncate">{area.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>
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
              <button
                type="button"
                onClick={() => {
                  setSelectedAreaId('');
                  setSelectedSector(null);
                }}
                className="text-white font-bold hover:text-emerald-450 transition"
              >
                {activeProvince?.nombre || 'Provincias'}
              </button>
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

          {/* Detalles de la Provincia (Province Details Editor) */}
          {activeProvince && !activeArea && !selectedSector && (
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
              
              {/* Province Editor Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-450" />
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                    {isEditingProvince ? `Editar Provincia: ${activeProvince.nombre}` : `Detalles de la Provincia: ${activeProvince.nombre}`}
                  </h3>
                </div>
                {!isEditingProvince ? (
                  <button
                    type="button"
                    key="edit-province-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditingProvince(true);
                    }}
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition flex items-center gap-1 border border-zinc-700/50"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Editar Provincia
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      form="province-edit-form"
                      disabled={saving}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" /> Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProvinceEditName(activeProvince.nombre);
                        setProvinceEditImage(activeProvince.imageUrl || '');
                        setProvinceEditPdf(activeProvince.pdfUrl || '');
                        setIsEditingProvince(false);
                      }}
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 border border-zinc-700/50"
                    >
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </div>
                )}
              </div>

              {/* Province Editor Body */}
              {!isEditingProvince ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Left: Metadata list */}
                  <div className="space-y-4 md:col-span-1 border-r border-zinc-800/40 pr-6">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nombre</span>
                      <p className="text-sm text-zinc-200 font-bold">{activeProvince.nombre}</p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Guía PDF</span>
                      {activeProvince.pdfUrl ? (
                        <a 
                          href={activeProvince.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-emerald-455 hover:text-emerald-350 hover:underline flex items-center gap-1 bg-zinc-950/40 border border-zinc-850 px-3 py-2 rounded-xl"
                        >
                          Descargar Guía PDF
                        </a>
                      ) : (
                        <p className="text-xs text-zinc-500 bg-zinc-950/40 border border-zinc-850 px-3 py-2 rounded-xl italic">
                          No disponible
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Icon Preview */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Icono / Escudo</span>
                      <div className="w-24 h-24 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center p-4 relative">
                        {activeProvince.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={activeProvince.imageUrl} alt="Icono" className="w-full h-full object-contain" />
                        ) : (
                          <MapPin className="w-8 h-8 text-zinc-700" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form id="province-edit-form" onSubmit={handleSaveProvinceData} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left inputs */}
                    <div className="md:col-span-1 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={provinceEditName}
                          onChange={(e) => setProvinceEditName(e.target.value)}
                          required
                          className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-zinc-200 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Guía PDF URL / Archivo</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={provinceEditPdf}
                            onChange={(e) => setProvinceEditPdf(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-2 text-xs text-zinc-200 outline-none"
                          />
                          <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-650 cursor-pointer rounded-xl px-4 text-xs font-semibold text-zinc-200 gap-1.5 transition shrink-0">
                            {isUploading['province-pdfUrl'] ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-450" />
                            ) : (
                              <ImageIcon className="w-4 h-4" />
                            )}
                            <span>Subir PDF</span>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => handleImageUpload(e, 'province', 'pdfUrl')}
                              className="hidden"
                              disabled={isUploading['province-pdfUrl']}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Right inputs (Icon Upload) */}
                    <div className="md:col-span-2 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Icono de la Provincia (Imagen PNG/JPG)</label>
                        <div className="flex items-start gap-4">
                          <div className="w-24 h-24 bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 flex items-center justify-center p-4 relative shrink-0">
                            {provinceEditImage ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={provinceEditImage} alt="Icono" className="w-full h-full object-contain" />
                            ) : (
                              <MapPin className="w-8 h-8 text-zinc-700" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={provinceEditImage}
                              onChange={(e) => setProvinceEditImage(e.target.value)}
                              placeholder="URL del icono..."
                              className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-4 py-2 text-xs text-zinc-200 outline-none"
                            />
                            <label className="inline-flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-650 cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-zinc-200 gap-1.5 transition">
                              {isUploading['province-imageUrl'] ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-emerald-450" />
                              ) : (
                                <ImageIcon className="w-4 h-4" />
                              )}
                              <span>Subir Imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'province', 'imageUrl')}
                                className="hidden"
                                disabled={isUploading['province-imageUrl']}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeArea && !selectedSector && (
            <div className="space-y-6">
              
              {/* Detalles de la Zona (Area Details Editor) */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
                
                {/* Area Editor Header */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-450" />
                    <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                      {isEditingArea ? `Editar Zona: ${activeArea.nombre}` : `Detalles de la Zona: ${activeArea.nombre}`}
                    </h3>
                  </div>
                  {!isEditingArea ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        key="edit-zone-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsEditingArea(true);
                        }}
                        className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition flex items-center gap-1 border border-zinc-700/50"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar Zona
                      </button>
                      <button
                        type="button"
                        key="delete-zone-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeleteArea(activeArea.id);
                        }}
                        disabled={saving}
                        className="px-3.5 py-1.5 bg-red-950/80 hover:bg-red-900 disabled:bg-red-950/40 text-red-200 text-xs font-semibold rounded-xl transition flex items-center gap-1 border border-red-800/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Eliminar Zona
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        form="area-edit-form"
                        disabled={saving}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" /> Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAreaEditName(activeArea.nombre);
                          setAreaEditDesc(activeArea.descripcion || '');
                          setAreaEditTiempoCaminata(activeArea.tiempoCaminata || '');
                          setAreaEditGoogleMapsLink(activeArea.googleMapsLink || '');
                          setAreaEditHospitalLink(activeArea.hospitalLink || '');
                          setAreaEditWindguruLink(activeArea.windguruLink || '');
                          setAreaEditImage(activeArea.imageUrl || '');
                          setAreaEditHowToGetImage(activeArea.howToGetImageUrl || '');
                          setAreaEditOverviewImage(activeArea.overviewImageUrl || '');
                          setIsEditingArea(false);
                        }}
                        className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 border border-zinc-700/50"
                      >
                        <X className="w-3.5 h-3.5" /> Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* Area Editor Body */}
                {!isEditingArea ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left: Metadata list */}
                    <div className="space-y-4 md:col-span-1 border-r border-zinc-800/40 pr-6">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nombre</span>
                        <p className="text-sm text-zinc-200 font-bold">{activeArea.nombre}</p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Sector / Grupo</span>
                        <p className="text-xs text-zinc-200 bg-zinc-950/40 border border-zinc-850 px-3 py-2 rounded-xl">
                          {activeArea.subRegion || 'General'}
                        </p>
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Tiempo aproximado caminata</span>
                        <p className="text-xs text-zinc-200 bg-zinc-950/40 border border-zinc-850 px-3 py-2 rounded-xl">
                          {activeArea.tiempoCaminata || <span className="text-zinc-650 italic">No especificado</span>}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Enlaces de utilidad</span>
                        <div className="flex flex-col gap-1.5">
                          {activeArea.googleMapsLink ? (
                            <a href={activeArea.googleMapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-455 hover:text-emerald-350 hover:underline flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Cómo llegar (Google Maps)
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-600 italic">Sin enlace a Google Maps</span>
                          )}
                          {activeArea.hospitalLink ? (
                            <a href={activeArea.hospitalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-red-400/80" /> Hospital Cercano (Maps)
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-600 italic">Sin enlace a Hospital</span>
                          )}
                          {activeArea.windguruLink ? (
                            <a href={activeArea.windguruLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1">
                              <Sliders className="w-3.5 h-3.5 text-blue-400/80" /> Windguru (Reporte Clima)
                            </a>
                          ) : (
                            <span className="text-xs text-zinc-600 italic">Sin enlace a Windguru</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Desc & Images */}
                    <div className="space-y-4 md:col-span-2">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Descripción de la zona & aproximación</span>
                        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-950/40 p-4 rounded-xl border border-zinc-850 max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {activeArea.descripcion || 'Sin descripción o indicaciones cargadas.'}
                        </p>
                      </div>

                      {/* Images grid previews */}
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1 truncate">Portada Zona</span>
                          <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/80 relative">
                            {activeArea.imageUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={activeArea.imageUrl} alt="Portada" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-4 h-4" /></div>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1 truncate">Detalle Acceso</span>
                          <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/80 relative">
                            {activeArea.howToGetImageUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={activeArea.howToGetImageUrl} alt="Cómo llegar" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-4 h-4" /></div>
                            )}
                          </div>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-500 mb-1 truncate">Vista General (Mapa)</span>
                          <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/80 relative">
                            {activeArea.overviewImageUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={activeArea.overviewImageUrl} alt="Overview" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-4 h-4" /></div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form id="area-edit-form" onSubmit={handleSaveAreaData} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Column 1 */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Nombre Zona</label>
                          <input
                            type="text"
                            value={areaEditName}
                            onChange={(e) => setAreaEditName(e.target.value)}
                            required
                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Tiempo de Caminata</label>
                          <input
                            type="text"
                            value={areaEditTiempoCaminata}
                            onChange={(e) => setAreaEditTiempoCaminata(e.target.value)}
                            placeholder="e.g. 15 min / 1 hora"
                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Google Maps Link</label>
                          <input
                            type="text"
                            value={areaEditGoogleMapsLink}
                            onChange={(e) => setAreaEditGoogleMapsLink(e.target.value)}
                            placeholder="https://maps.google.com/..."
                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Sector / Grupo de la Provincia</label>
                          <input
                            type="text"
                            value={areaEditSubRegion}
                            onChange={(e) => setAreaEditSubRegion(e.target.value)}
                            placeholder="e.g. Altas Cumbres, Copina, General"
                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Hospital Link</label>
                          <input
                            type="text"
                            value={areaEditHospitalLink}
                            onChange={(e) => setAreaEditHospitalLink(e.target.value)}
                            placeholder="https://maps.google.com/..."
                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Windguru Link</label>
                          <input
                            type="text"
                            value={areaEditWindguruLink}
                            onChange={(e) => setAreaEditWindguruLink(e.target.value)}
                            placeholder="https://www.windguru.cz/..."
                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Descripción de la zona & aproximación</label>
                          <textarea
                            value={areaEditDesc}
                            onChange={(e) => setAreaEditDesc(e.target.value)}
                            placeholder="Descripción general o detalles sobre cómo llegar a la roca..."
                            className="w-full bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 outline-none h-[72px] resize-none"
                          />
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Imagen Portada (URL)</label>
                            <span className="text-[9px] text-zinc-500 truncate font-mono max-w-[180px]" title={`provincias/${selectedProvinceId}/${selectedAreaId}/imageUrl.jpg`}>
                              📂 {selectedProvinceId}/{selectedAreaId}/imageUrl.jpg
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={areaEditImage}
                              onChange={(e) => setAreaEditImage(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                            />
                            <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer rounded-xl px-3 text-xs text-zinc-200 gap-1.5 transition">
                              {isUploading['area-imageUrl'] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline">Subir</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'area', 'imageUrl')}
                                className="hidden"
                                disabled={isUploading['area-imageUrl']}
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Imagen Acceso (URL)</label>
                            <span className="text-[9px] text-zinc-500 truncate font-mono max-w-[180px]" title={`provincias/${selectedProvinceId}/${selectedAreaId}/howToGetImageUrl.jpg`}>
                              📂 {selectedProvinceId}/{selectedAreaId}/howToGetImageUrl.jpg
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={areaEditHowToGetImage}
                              onChange={(e) => setAreaEditHowToGetImage(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                            />
                            <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer rounded-xl px-3 text-xs text-zinc-200 gap-1.5 transition">
                              {isUploading['area-howToGetImageUrl'] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline">Subir</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'area', 'howToGetImageUrl')}
                                className="hidden"
                                disabled={isUploading['area-howToGetImageUrl']}
                              />
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Imagen Overview/Mapa (URL)</label>
                            <span className="text-[9px] text-zinc-500 truncate font-mono max-w-[180px]" title={`provincias/${selectedProvinceId}/${selectedAreaId}/overviewImageUrl.jpg`}>
                              📂 {selectedProvinceId}/{selectedAreaId}/overviewImageUrl.jpg
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={areaEditOverviewImage}
                              onChange={(e) => setAreaEditOverviewImage(e.target.value)}
                              placeholder="https://..."
                              className="flex-1 bg-zinc-950/50 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none"
                            />
                            <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer rounded-xl px-3 text-xs text-zinc-200 gap-1.5 transition">
                              {isUploading['area-overviewImageUrl'] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5" />
                              )}
                              <span className="hidden sm:inline">Subir</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'area', 'overviewImageUrl')}
                                className="hidden"
                                disabled={isUploading['area-overviewImageUrl']}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Sectores Title Bar */}
              <div className="flex items-center justify-between pt-2">
                <h3 className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Folder className="w-4 h-4 text-emerald-450" />
                  Sectores de Escalada ({activeArea.sectores.length})
                </h3>
              </div>

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
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleDeleteSector(sector.id)}
                              className="p-1.5 text-zinc-550 hover:text-red-450 hover:bg-zinc-850 rounded-lg transition border border-transparent hover:border-red-900/30"
                              title="Eliminar Sector"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedSector(sector)}
                              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition flex items-center gap-1 border border-zinc-700/50"
                            >
                              Editar Sector & Vías <ArrowRight className="w-3 h-3 text-emerald-450" />
                            </button>
                          </div>
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
              <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-zinc-850">
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
              </div>

              {/* Header Images (Cover, Overview, Como Llegar) */}
              <div className="px-6 space-y-4 pb-4 border-b border-zinc-850">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-450" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Imágenes Principales del Sector</span>
                  </div>
                  <button
                    onClick={handleUpdateSectorInfo}
                    disabled={saving}
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-zinc-955 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5 text-zinc-950" /> Guardar Datos
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Card 1: Portada (Cover) */}
                  <div className="bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Portada (Cover)</span>
                      <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/60 relative">
                        {sectorEditImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={sectorEditImage} alt="Portada" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-4 h-4" /></div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        value={sectorEditImage}
                        onChange={(e) => setSectorEditImage(e.target.value)}
                        placeholder="URL..."
                        className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-zinc-200 outline-none"
                      />
                      <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer rounded-lg px-2 py-1 text-[10px] text-zinc-200 gap-1 transition shrink-0">
                        {isUploading['sector-imageUrl'] ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-450" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        <span>Subir</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'sector', 'imageUrl')}
                          className="hidden"
                          disabled={isUploading['sector-imageUrl']}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Card 2: Overview (Vista General) */}
                  <div className="bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Overview (Vista General)</span>
                      <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/60 relative">
                        {sectorEditOverviewImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={sectorEditOverviewImage} alt="Vista General" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-4 h-4" /></div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        value={sectorEditOverviewImage}
                        onChange={(e) => setSectorEditOverviewImage(e.target.value)}
                        placeholder="URL..."
                        className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-zinc-200 outline-none"
                      />
                      <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer rounded-lg px-2 py-1 text-[10px] text-zinc-200 gap-1 transition shrink-0">
                        {isUploading['sector-overviewImageUrl'] ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-450" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        <span>Subir</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'sector', 'overviewImageUrl')}
                          className="hidden"
                          disabled={isUploading['sector-overviewImageUrl']}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Card 3: Cómo Llegar */}
                  <div className="bg-zinc-950/40 border border-zinc-800/80 p-3 rounded-xl space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Cómo Llegar (Mapa/Sendero)</span>
                      <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800/60 relative">
                        {sectorEditComoLlegarImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={sectorEditComoLlegarImage} alt="Cómo Llegar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-700"><ImageIcon className="w-4 h-4" /></div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5 mt-1">
                      <input
                        type="text"
                        value={sectorEditComoLlegarImage}
                        onChange={(e) => setSectorEditComoLlegarImage(e.target.value)}
                        placeholder="URL..."
                        className="flex-1 min-w-0 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-2 py-1 text-[10px] text-zinc-200 outline-none"
                      />
                      <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer rounded-lg px-2 py-1 text-[10px] text-zinc-200 gap-1 transition shrink-0">
                        {isUploading['sector-comoLlegarImageUrl'] ? (
                          <RefreshCw className="w-3 h-3 animate-spin text-emerald-450" />
                        ) : (
                          <ImageIcon className="w-3 h-3" />
                        )}
                        <span>Subir</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'sector', 'comoLlegarImageUrl')}
                          className="hidden"
                          disabled={isUploading['sector-comoLlegarImageUrl']}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* BLOQUES DINÁMICOS DE CROQUIS Y VÍAS */}
              <div className="px-6 space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-bold text-white uppercase tracking-wider">Bloques de Croquis y Vías del Sector</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTopoBlock}
                    className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Agregar Imagen de Croquis
                  </button>
                </div>

                {/* Render list of Topo Blocks */}
                {((selectedSector.topos && selectedSector.topos.length > 0) ? selectedSector.topos : []).map((topo, topoIdx) => {
                  const topoVias = selectedSector.vias.filter(v => v.topoId === topo.id);

                  return (
                    <div key={topo.id} className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 space-y-4 shadow-lg">
                      {/* Top Bar of Topo Block */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-850">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                            Bloque #{topoIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={topo.nombre || ''}
                            onChange={(e) => handleUpdateTopoBlockInfo(topo.id, { nombre: e.target.value })}
                            placeholder="Nombre del bloque (ej. Pared Izquierda)..."
                            className="bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none flex-1 max-w-sm font-semibold"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleBulkNumberViasForTopo(topo.id)}
                            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-800/60 transition flex items-center gap-1"
                            title="Numerar 1-, 2-... las vías de este bloque"
                          >
                            <ListOrdered className="w-3 h-3" /> Numerar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleBulkRemoveNumberingForTopo(topo.id)}
                            className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-[10px] font-bold rounded-lg border border-zinc-800 transition flex items-center gap-1"
                            title="Quitar números de vía"
                          >
                            <Hash className="w-3 h-3" /> Quitar N°
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTopoBlock(topoIdx, 'up')}
                            disabled={topoIdx === 0}
                            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 rounded-lg border border-zinc-800 transition"
                            title="Mover Bloque Arriba"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveTopoBlock(topoIdx, 'down')}
                            disabled={topoIdx === (selectedSector.topos?.length || 0) - 1}
                            className="p-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 disabled:opacity-30 rounded-lg border border-zinc-800 transition"
                            title="Mover Bloque Abajo"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTopoBlock(topo.id)}
                            className="p-1 bg-red-950/60 hover:bg-red-900 text-red-300 rounded-lg border border-red-800/40 transition ml-1"
                            title="Eliminar este Bloque de Croquis"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Image Preview & Upload Controls */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-zinc-900/60 p-3 rounded-xl border border-zinc-850">
                        <div className="aspect-video bg-zinc-950 rounded-lg overflow-hidden border border-zinc-800 relative flex items-center justify-center">
                          {topo.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={topo.imageUrl} alt={topo.nombre || 'Croquis'} className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center p-3 text-zinc-600 flex flex-col items-center gap-1">
                              <ImageIcon className="w-6 h-6" />
                              <span className="text-[10px]">Sin imagen cargada</span>
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">URL / Archivo de Imagen del Croquis</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={topo.imageUrl || ''}
                              onChange={(e) => handleUpdateTopoBlockInfo(topo.id, { imageUrl: e.target.value })}
                              placeholder="URL de la imagen de croquis..."
                              className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 outline-none"
                            />
                            <label className="flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 cursor-pointer rounded-xl px-3 py-1.5 text-xs text-zinc-200 gap-1.5 transition shrink-0 font-bold">
                              {isUploading[`topo-${topo.id}`] ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-450" />
                              ) : (
                                <ImageIcon className="w-3.5 h-3.5" />
                              )}
                              <span>Subir Imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleTopoImageUpload(e, topo.id)}
                                className="hidden"
                                disabled={isUploading[`topo-${topo.id}`]}
                              />
                            </label>
                          </div>
                          <span className="text-[10px] text-zinc-555 block font-mono truncate">
                            📂 Storage Path: provincias/{selectedProvinceId}/{selectedAreaId}/{selectedSector.id}/topos/{topo.id}.jpg
                          </span>
                        </div>
                      </div>

                      {/* Routes Table for this Topo Block */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                            Vías en este croquis ({topoVias.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddRouteToTopo(topo.id)}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 text-xs font-bold rounded-lg border border-zinc-700 transition flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> Registrar Vía
                          </button>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-zinc-850">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                <th className="py-2 px-3 w-16">Orden</th>
                                <th className="py-2 px-3">Nombre Vía</th>
                                <th className="py-2 px-3">Grado</th>
                                <th className="py-2 px-3">Altura</th>
                                <th className="py-2 px-3">Chapas</th>
                                <th className="py-2 px-3 text-right">Acciones</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-850/60 text-xs bg-zinc-900/30">
                              {topoVias.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="py-4 text-center text-zinc-500 italic text-[11px]">
                                    No hay vías asignadas a este croquis todavía.
                                  </td>
                                </tr>
                              ) : (
                                topoVias.map((route, vIdx) => {
                                  const isEditing = editingRouteId === route.id;
                                  return (
                                    <tr key={route.id} className="hover:bg-zinc-850/40 transition">
                                      <td className="py-1.5 px-3">
                                        <div className="flex items-center gap-1">
                                          <button
                                            type="button"
                                            onClick={() => moveRouteInTopo(topo.id, vIdx, 'up')}
                                            disabled={vIdx === 0}
                                            className="p-0.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition"
                                            title="Subir"
                                          >
                                            <ChevronUp className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => moveRouteInTopo(topo.id, vIdx, 'down')}
                                            disabled={vIdx === topoVias.length - 1}
                                            className="p-0.5 text-zinc-500 hover:text-zinc-300 disabled:opacity-20 transition"
                                            title="Bajar"
                                          >
                                            <ChevronDown className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </td>
                                      <td className="py-1.5 px-3">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={routeForm.nombre || ''}
                                            onChange={(e) => setRouteForm({ ...routeForm, nombre: e.target.value })}
                                            className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none w-full max-w-[180px]"
                                          />
                                        ) : (
                                          <span className="font-bold text-zinc-200">{route.nombre}</span>
                                        )}
                                      </td>
                                      <td className="py-1.5 px-3">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={routeForm.grado || ''}
                                            onChange={(e) => setRouteForm({ ...routeForm, grado: e.target.value })}
                                            className="bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-white outline-none w-16"
                                          />
                                        ) : (
                                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700/40 rounded font-semibold text-[10px]">
                                            {route.grado}
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-1.5 px-3 text-zinc-400">
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
                                      <td className="py-1.5 px-3 text-zinc-400">
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
                                      <td className="py-1.5 px-3 text-right">
                                        {isEditing ? (
                                          <div className="flex justify-end gap-1">
                                            <button
                                              type="button"
                                              onClick={handleSaveRouteEdit}
                                              className="p-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500 hover:text-zinc-950 transition"
                                            >
                                              <Check className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => setEditingRouteId(null)}
                                              className="p-1 bg-zinc-800 text-zinc-450 border border-zinc-700 rounded hover:text-white transition"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="flex justify-end gap-1 opacity-60 hover:opacity-100 transition">
                                            <button
                                              type="button"
                                              onClick={() => startEditRoute(route)}
                                              className="p-1 text-zinc-400 hover:text-emerald-450 hover:bg-zinc-800 rounded transition"
                                              title="Editar vía"
                                            >
                                              <Edit3 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteRoute(route.id)}
                                              className="p-1 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition"
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
                      </div>
                    </div>
                  );
                })}

                {/* Section for Unassigned Vías (if any) */}
                {(() => {
                  const unassignedVias = selectedSector.vias.filter(v => !v.topoId || !selectedSector.topos?.some(t => t.id === v.topoId));
                  if (unassignedVias.length === 0) return null;
                  return (
                    <div className="bg-zinc-950/40 border border-amber-900/40 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          Vías Sin Asignar a Imagen ({unassignedVias.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddRouteToTopo(undefined)}
                          className="px-2.5 py-1 bg-zinc-800 text-amber-300 text-xs font-bold rounded-lg border border-zinc-700 hover:bg-zinc-700 transition"
                        >
                          <Plus className="w-3.5 h-3.5 inline" /> Registrar Vía Sin Asignar
                        </button>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-zinc-850">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                              <th className="py-2 px-3">Nombre Vía</th>
                              <th className="py-2 px-3">Grado</th>
                              <th className="py-2 px-3">Asignar a Croquis</th>
                              <th className="py-2 px-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-850/60 text-xs">
                            {unassignedVias.map(route => (
                              <tr key={route.id} className="hover:bg-zinc-850/40 transition">
                                <td className="py-2 px-3 font-bold text-zinc-200">{route.nombre}</td>
                                <td className="py-2 px-3"><span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded font-semibold text-[10px]">{route.grado}</span></td>
                                <td className="py-2 px-3">
                                  <select
                                    value={route.topoId || ''}
                                    onChange={(e) => {
                                      const updatedSector = {
                                        ...selectedSector,
                                        vias: selectedSector.vias.map(v => v.id === route.id ? { ...v, topoId: e.target.value } : v)
                                      };
                                      handleSaveSectorData(updatedSector);
                                    }}
                                    className="bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 outline-none"
                                  >
                                    <option value="">-- Seleccionar Bloque --</option>
                                    {(selectedSector.topos || []).map(t => (
                                      <option key={t.id} value={t.id}>{t.nombre || t.id}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRoute(route.id)}
                                    className="p-1 text-zinc-400 hover:text-red-400 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom Add Topo Block Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddTopoBlock}
                    className="w-full py-3 bg-zinc-950/80 hover:bg-zinc-900 border border-dashed border-emerald-500/40 hover:border-emerald-500 text-emerald-400 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Agregar Nuevo Bloque de Croquis / Imagen
                  </button>
                </div>
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
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Sector / Grupo de la Provincia</label>
                <select
                  value={newAreaSubRegion}
                  onChange={(e) => setNewAreaSubRegion(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-2.5 text-xs text-zinc-100 transition outline-none"
                >
                  <option value="General">General / Alrededores</option>
                  <option value="Altas Cumbres">Altas Cumbres</option>
                  <option value="Capilla Del Monte">Capilla Del Monte</option>
                  <option value="Copina">Copina</option>
                  <option value="Los Gigantes">Los Gigantes</option>
                  <option value="Otro">Otro (Especificar)</option>
                </select>
              </div>
              
              {newAreaSubRegion === 'Otro' && (
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Especificar Grupo / Sector</label>
                  <input
                    type="text"
                    placeholder="e.g. Traslasierra, Ongamira, etc."
                    value={newAreaCustomSubRegion}
                    onChange={(e) => setNewAreaCustomSubRegion(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-650 transition outline-none"
                  />
                </div>
              )}
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
