'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../layout';
import {
  Compass,
  Search,
  Trash2,
  MapPin,
  Calendar,
  Phone,
  Users,
  AlertTriangle,
  Check,
  RefreshCw,
  AtSign,
  Star,
  ShieldCheck
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, orderBy, query } from 'firebase/firestore';

// Real Firestore schema from mobile app (cordadas collection)
interface Cordada {
  id: string;
  name: string;
  phone: string;
  instagram: string;
  avatar: string;
  avatarColor: string;
  province: string;
  userProvince: string;
  destination: string;
  date: string;
  grade: string;
  role: string;
  gear: string;
  spots: number;
  verified: boolean;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

function formatTimestamp(ts: { toDate?: () => Date } | string | null | undefined): string {
  if (!ts) return '—';
  if (typeof ts === 'object' && ts.toDate) {
    return ts.toDate().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return String(ts);
}

export default function SalidasModeracion() {
  const { isDemoMode } = useAdmin();

  const [outings, setOutings] = useState<Cordada[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState('all');

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const loadOutings = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cordadas'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const loaded: Cordada[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || '',
          phone: data.phone || '',
          instagram: data.instagram || '',
          avatar: data.avatar || '🧗',
          avatarColor: data.avatarColor || 'default',
          province: data.province || '',
          userProvince: data.userProvince || '',
          destination: data.destination || '',
          date: data.date || '',
          grade: data.grade || '',
          role: data.role || '',
          gear: data.gear || '',
          spots: typeof data.spots === 'number' ? data.spots : 1,
          verified: data.verified === true,
          userId: data.userId || '',
          createdAt: formatTimestamp(data.createdAt),
          expiresAt: formatTimestamp(data.expiresAt),
        };
      });
      setOutings(loaded);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error al cargar cordadas: ${errorMsg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isDemoMode) loadOutings();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar la propuesta de ${name}? Esta acción es permanente.`)) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'cordadas', id));
      setOutings(prev => prev.filter(o => o.id !== id));
      setActionMessage({ text: 'Cordada eliminada de Firestore.', type: 'success' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const uniqueProvinces = Array.from(new Set(outings.map(o => o.province).filter(Boolean))).sort();

  const filtered = outings.filter(o => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      o.name.toLowerCase().includes(q) ||
      o.destination.toLowerCase().includes(q) ||
      o.role.toLowerCase().includes(q) ||
      o.phone.includes(q) ||
      o.instagram.toLowerCase().includes(q);
    const matchesProv = provinceFilter === 'all' || o.province === provinceFilter;
    return matchesSearch && matchesProv;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Cargando propuestas de cordadas...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Toast */}
      {actionMessage && (
        <div className={`fixed bottom-5 right-5 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50 border text-sm font-medium bg-zinc-900 ${
          actionMessage.type === 'success' ? 'border-emerald-500/30 text-emerald-400' : 'border-red-800 text-red-200'
        }`}>
          {actionMessage.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            Propuestas de Cordadas
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Publicaciones activas en <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400">cordadas</code> — ordenadas por más recientes.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-xs bg-zinc-950 px-4 py-2 border border-zinc-800 rounded-xl text-zinc-400 font-semibold">
            {filtered.length} de {outings.length} publicaciones
          </div>
          <button
            onClick={loadOutings}
            disabled={saving}
            className="p-2 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition text-zinc-400 hover:text-white"
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 text-zinc-550 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, destino, rol, teléfono, instagram..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 outline-none placeholder-zinc-600 transition"
          />
        </div>
        <div>
          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none cursor-pointer appearance-none"
          >
            <option value="all">Todas las provincias</option>
            {uniqueProvinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-zinc-900/50 border border-zinc-800 p-12 rounded-3xl text-center">
            <Compass className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-500">No hay publicaciones disponibles</p>
          </div>
        ) : (
          filtered.map((outing) => (
            <div
              key={outing.id}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4 hover:border-zinc-700 transition"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {outing.avatar.includes('.png') ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/avatars/${outing.avatar.split('/').pop()}`}
                      alt={outing.name}
                      className="w-12 h-12 rounded-full object-cover bg-zinc-800 border border-zinc-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-2xl flex-shrink-0">
                      {outing.avatar || '🧗'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{outing.name}</span>
                      {outing.verified && (
                        <span title="Verificado"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /></span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">{outing.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(outing.id, outing.name)}
                  disabled={saving}
                  className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 border border-transparent hover:border-red-900/30 rounded-lg transition flex-shrink-0"
                  title="Eliminar publicación"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Role / Description */}
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-800/50 rounded-xl px-3 py-2 border border-zinc-700/40">
                {outing.role}
              </p>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span className="truncate">{outing.destination}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span>{outing.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span>{outing.grade || '—'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span>{outing.spots} lugar{outing.spots !== 1 ? 'es' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <a href={`tel:${outing.phone}`} className="hover:text-emerald-400 transition truncate">
                    {outing.phone || '—'}
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <AtSign className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                  <span className="truncate">{outing.instagram || '—'}</span>
                </div>
              </div>

              {/* Gear */}
              {outing.gear && (
                <p className="text-[10px] text-zinc-500 italic border-t border-zinc-800 pt-2">
                  🧰 {outing.gear}
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-zinc-800 pt-2 text-[10px] font-mono text-zinc-600">
                <span>📍 {outing.province}</span>
                <span>Creado: {outing.createdAt}</span>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
