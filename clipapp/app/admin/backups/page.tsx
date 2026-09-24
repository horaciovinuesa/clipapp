'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../layout';
import { Province } from '@/lib/mockData';
import climbingDataJson from '@/lib/climbingData.json';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Clock, 
  Plus, 
  HardDrive,
  FileJson,
  ShieldCheck
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';

interface BackupItem {
  id: string;
  filename: string;
  dateStr: string;
  timestamp: number;
  provincesCount: number;
  sectorsCount: number;
  viasCount: number;
  sizeBytes: number;
  sizeFormatted: string;
  data: Province[];
}

export default function BackupsPage() {
  const { isDemoMode } = useAdmin();

  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Helper to format bytes to MB or KB
  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / 1024).toFixed(1)} KB`;
  };

  // Helper to calculate stats & size
  const calculateStats = (data: Province[]) => {
    let sectorsCount = 0;
    let viasCount = 0;
    if (Array.isArray(data)) {
      for (const prov of data) {
        for (const area of prov.areas || []) {
          for (const sec of area.sectores || []) {
            sectorsCount++;
            viasCount += (sec.vias || []).length;
          }
        }
      }
    }
    const jsonStr = JSON.stringify(data);
    const sizeBytes = new Blob([jsonStr]).size;
    const sizeFormatted = formatSize(sizeBytes);
    return { provincesCount: data.length, sectorsCount, viasCount, sizeBytes, sizeFormatted };
  };

  // Helper to format date filename DDMMYYYY_HHMM
  const generateFilename = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `climbingData_${day}${month}${year}_${hours}${minutes}.json`;
  };

  // Load backups list on mount
  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    try {
      const stored = localStorage.getItem('clipapp_backups_list');
      if (stored) {
        setBackups(JSON.parse(stored));
      } else {
        // Create initial default backup snapshot from climbingDataJson
        const now = new Date();
        const initialData = climbingDataJson as Province[];
        const stats = calculateStats(initialData);
        const initialBackup: BackupItem = {
          id: `backup-initial`,
          filename: `climbingData_INICIAL_${generateFilename(now)}`,
          dateStr: now.toLocaleString('es-AR'),
          timestamp: now.getTime(),
          ...stats,
          data: initialData
        };
        const initialList = [initialBackup];
        setBackups(initialList);
        localStorage.setItem('clipapp_backups_list', JSON.stringify(initialList));
      }
    } catch (e) {
      console.error('Error loading backups list', e);
    }
  };

  const saveBackupsList = (newList: BackupItem[]) => {
    setBackups(newList);
    localStorage.setItem('clipapp_backups_list', JSON.stringify(newList));
  };

  // Fetch current live Firestore data and create a new Backup item
  const handleCreateLiveBackup = async () => {
    setLoading(true);
    setActionMessage({ text: 'Obteniendo estado actual de la base de datos...', type: 'info' });
    try {
      let currentProvinces: Province[] = [];

      if (isDemoMode) {
        const localData = localStorage.getItem('clipapp_provinces');
        currentProvinces = localData ? JSON.parse(localData) : (climbingDataJson as Province[]);
      } else {
        // Query live Firestore
        const provSnap = await getDocs(collection(db, 'provincias'));
        const loaded: Province[] = [];

        for (const pDoc of provSnap.docs) {
          const pData = pDoc.data();
          const areaSnap = await getDocs(collection(db, `provincias/${pDoc.id}/areas`));
          const areasList = [];

          for (const aDoc of areaSnap.docs) {
            const aData = aDoc.data();
            const secSnap = await getDocs(collection(db, `provincias/${pDoc.id}/areas/${aDoc.id}/sectores`));
            const secList = [];

            for (const sDoc of secSnap.docs) {
              secList.push({
                id: sDoc.id,
                ...sDoc.data()
              });
            }

            areasList.push({
              id: aDoc.id,
              ...aData,
              sectores: secList
            });
          }

          loaded.push({
            id: pDoc.id,
            nombre: pData.nombre || pDoc.id,
            imageUrl: pData.imageUrl || '',
            pdfUrl: pData.pdfUrl || '',
            areas: areasList as any
          });
        }
        currentProvinces = loaded.length > 0 ? loaded : (climbingDataJson as Province[]);
      }

      const now = new Date();
      const stats = calculateStats(currentProvinces);
      const filename = generateFilename(now);

      const newBackup: BackupItem = {
        id: `backup-${Date.now()}`,
        filename,
        dateStr: now.toLocaleString('es-AR'),
        timestamp: now.getTime(),
        ...stats,
        data: currentProvinces
      };

      const updatedList = [newBackup, ...backups];
      saveBackupsList(updatedList);
      setActionMessage({ text: `Backup "${filename}" (${stats.sizeFormatted}) creado exitosamente.`, type: 'success' });
    } catch (err: any) {
      setActionMessage({ text: `Error al crear backup: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Download backup JSON file
  const handleDownloadBackup = (item: BackupItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(item.data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", item.filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setActionMessage({ text: `Archivo "${item.filename}" (${item.sizeFormatted}) descargado.`, type: 'success' });
  };

  // Restore/Sync selected backup to Firestore
  const handleRestoreBackup = async (item: BackupItem) => {
    const confirmMessage = 
      `⚠️ ¿Estás seguro de que deseas RESTAURAR la base de datos al backup:\n"${item.filename}" (${item.sizeFormatted})?\n\n` +
      `Esto sobrescribirá Firestore con los datos de esta fecha (${item.dateStr}) conteniendo ${item.viasCount} vías y ${item.sectorsCount} sectores.`;

    if (!window.confirm(confirmMessage)) return;

    setSyncingId(item.id);
    setActionMessage({ text: `Restaurando datos de "${item.filename}" a Firestore...`, type: 'info' });

    try {
      if (isDemoMode) {
        localStorage.setItem('clipapp_provinces', JSON.stringify(item.data));
        setActionMessage({ text: 'Backup restaurado en Modo Demo (Local).', type: 'success' });
      } else {
        // Write to Firestore
        for (const prov of item.data) {
          const provRef = doc(db, 'provincias', prov.id);
          await setDoc(provRef, { 
            nombre: prov.nombre,
            imageUrl: prov.imageUrl || '',
            pdfUrl: prov.pdfUrl || ''
          });

          for (const area of prov.areas || []) {
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

            for (const sector of area.sectores || []) {
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
                vias: sector.vias || []
              });
            }
          }
        }
        setActionMessage({ text: `Base de datos de Firestore sincronizada exitosamente con "${item.filename}".`, type: 'success' });
      }
    } catch (err: any) {
      setActionMessage({ text: `Error al restaurar backup: ${err.message}`, type: 'error' });
    } finally {
      setSyncingId(null);
    }
  };

  // Hard Delete Backup
  const handleDeleteBackup = (id: string, filename: string) => {
    const confirmMsg = 
      `⚠️ HARD DELETE (ELIMINACIÓN DEFINITIVA E IRRECUPERABLE)\n\n` +
      `¿Estás seguro de que deseas eliminar permanentemente el backup "${filename}"?\n\n` +
      `Esta acción realiza un Hard Delete borrando por completo y de forma irrecuperable toda la información de este archivo de todo almacenamiento y registro.`;

    if (!window.confirm(confirmMsg)) return;

    // Hard delete from state and local storage
    const newList = backups.filter(b => b.id !== id);
    setBackups(newList);
    localStorage.setItem('clipapp_backups_list', JSON.stringify(newList));

    try {
      localStorage.removeItem(`clipapp_backup_data_${id}`);
      sessionStorage.removeItem(`clipapp_backup_data_${id}`);
    } catch (e) {}

    setActionMessage({ 
      text: `Hard Delete ejecutado: El backup "${filename}" fue eliminado por completo del almacenamiento.`, 
      type: 'info' 
    });
  };

  // Import JSON via file upload or paste
  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!Array.isArray(parsed)) {
          alert("El archivo JSON debe contener un arreglo de provincias.");
          return;
        }

        const now = new Date();
        const stats = calculateStats(parsed);
        const filename = file.name.endsWith('.json') ? file.name : generateFilename(now);

        const newBackup: BackupItem = {
          id: `backup-${Date.now()}`,
          filename,
          dateStr: now.toLocaleString('es-AR'),
          timestamp: now.getTime(),
          ...stats,
          data: parsed
        };

        const updatedList = [newBackup, ...backups];
        saveBackupsList(updatedList);
        setActionMessage({ text: `Backup "${filename}" (${stats.sizeFormatted}) importado al historial.`, type: 'success' });
      } catch (err) {
        alert("Error al parsear el archivo JSON. Verifica el formato.");
      }
    };
    reader.readAsText(file);
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

      {/* Header Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Centro de Respaldos e Historial</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Gestión de Backups y Restauración</h1>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            Genera copias de seguridad con la convención <code className="text-emerald-400 font-mono">climbingData_DDMMYYYY.json</code>, consulta el tamaño en MB/KB de cada respaldo y restaura cualquier snapshot en Firestore con un clic.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            onClick={handleCreateLiveBackup}
            disabled={loading}
            className="flex-1 md:flex-none px-5 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 text-zinc-950 font-extrabold text-xs rounded-xl transition shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Crear Nuevo Backup</span>
          </button>

          <label className="flex-1 md:flex-none px-4 py-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-xs font-bold rounded-xl border border-zinc-700 transition cursor-pointer flex items-center justify-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Importar JSON</span>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImportJsonFile} 
              className="hidden" 
            />
          </label>
        </div>
      </div>

      {/* Backups List Section */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Historial de Copias Guardadas ({backups.length})</h3>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Formato: climbingData_DDMMYYYY_HHMM.json</span>
        </div>

        {backups.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 space-y-3">
            <FileJson className="w-12 h-12 mx-auto text-zinc-700" />
            <p className="text-sm">No tienes ningún backup guardado en el historial.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backups.map((item) => (
              <div 
                key={item.id} 
                className="bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition group relative"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileJson className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-white font-mono truncate" title={item.filename}>
                        {item.filename}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{item.dateStr}</span>
                  </div>

                  {/* Stats & Size Badges */}
                  <div className="flex items-center gap-1.5 pt-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[10px] font-mono rounded-md font-extrabold" title={`Tamaño exacto: ${item.sizeBytes || 0} bytes`}>
                      💾 {item.sizeFormatted || '0.5 MB'}
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded-md font-semibold">
                      🏛️ {item.provincesCount} Prov.
                    </span>
                    <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] rounded-md font-semibold">
                      🏔️ {item.sectorsCount} Sect.
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-md font-bold">
                      🧗 {item.viasCount} Vías
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadBackup(item)}
                    className="flex-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[11px] font-bold rounded-lg border border-zinc-800 transition flex items-center justify-center gap-1.5"
                    title="Descargar archivo JSON a tu computadora"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar</span>
                  </button>

                  <button
                    onClick={() => handleRestoreBackup(item)}
                    disabled={syncingId === item.id}
                    className="flex-1 px-3 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/60 text-emerald-400 hover:text-emerald-300 text-[11px] font-bold rounded-lg border border-emerald-800/60 transition flex items-center justify-center gap-1.5"
                    title="Sincronizar y restaurar este backup a Firestore"
                  >
                    {syncingId === item.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>Sincronizar</span>
                  </button>

                  <button
                    onClick={() => handleDeleteBackup(item.id, item.filename)}
                    className="p-1.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                    title="Hard Delete (Eliminar definitivamente)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
