'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../layout';
import { 
  Users, 
  Search, 
  UserX, 
  UserCheck, 
  Trash2,
  AlertTriangle,
  MapPin,
  Calendar,
  Check,
  Phone,
  AtSign,
  RefreshCw,
  Copy
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

// Real Firestore profile schema from the mobile app
interface ClimberProfile {
  uid: string;
  name: string;
  phone: string;
  instagram: string;
  province: string;
  avatar: string;        // emoji OR Flutter path e.g. "lib/assets/icons/avatars/rock-climbing-3.png"
  avatarColor: string;   // e.g. "default"
  updatedAt: string;
  active: boolean;
}

// Resolve avatar field: may be a Flutter asset path or an emoji
function AvatarCell({ avatar, name }: { avatar: string; name: string }) {
  // If the avatar looks like a file path (contains .png), extract filename and serve from /avatars/
  if (avatar && avatar.includes('.png')) {
    const filename = avatar.split('/').pop() || avatar;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/avatars/${filename}`}
        alt={name}
        className="w-10 h-10 rounded-full object-cover border border-zinc-700 bg-zinc-800"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
      />
    );
  }
  // Otherwise treat as emoji
  return (
    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl border border-zinc-700 bg-zinc-800">
      {avatar || '🧗'}
    </div>
  );
}

export default function UsuariosModeracion() {
  const { isDemoMode } = useAdmin();

  const [users, setUsers] = useState<ClimberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // Demo: empty set
        setUsers([]);
      } else {
        const snap = await getDocs(collection(db, 'profiles'));
        const loaded: ClimberProfile[] = snap.docs.map(d => {
          const data = d.data();
          return {
            uid: d.id,
            name: data.name || data.displayName || '(sin nombre)',
            phone: data.phone || '',
            instagram: data.instagram || data.email || '',
            province: data.province || data.provincia || '',
            avatar: data.avatar || '🧗',
            avatarColor: data.avatarColor || 'default',
            updatedAt: data.updatedAt
              ? (data.updatedAt.toDate ? data.updatedAt.toDate().toLocaleDateString('es-AR') : String(data.updatedAt))
              : (data.fechaRegistro || ''),
            active: data.active !== false
          };
        });
        // Sort by name
        loaded.sort((a, b) => a.name.localeCompare(b.name));
        setUsers(loaded);
      }
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error al cargar perfiles: ${errorMsg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  const toggleUserActiveStatus = async (user: ClimberProfile) => {
    const nextStatus = !user.active;
    const msg = nextStatus ? 'desbloquear' : 'bloquear';
    if (!window.confirm(`¿Estás seguro de que quieres ${msg} a ${user.name}?`)) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'profiles', user.uid), { active: nextStatus });
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, active: nextStatus } : u));
      setActionMessage({ text: `Usuario ${nextStatus ? 'activado' : 'bloqueado'} en Firebase.`, type: 'success' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`¿Seguro que quieres ELIMINAR el perfil de ${userName}? Esta acción no eliminará su cuenta de Auth.`)) return;

    setSaving(true);
    try {
      await deleteDoc(doc(db, 'profiles', userId));
      setUsers(prev => prev.filter(u => u.uid !== userId));
      setActionMessage({ text: `Perfil eliminado de Firestore.`, type: 'success' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Unique provinces for filter dropdown
  const uniqueProvinces = Array.from(new Set(users.map(u => u.province).filter(Boolean))).sort();

  const filteredUsers = users.filter(user => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      user.name.toLowerCase().includes(q) ||
      user.phone.includes(q) ||
      user.instagram.toLowerCase().includes(q) ||
      user.uid.toLowerCase().includes(q);

    const matchesProvince = provinceFilter === 'all' || user.province === provinceFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && user.active) ||
      (statusFilter === 'blocked' && !user.active);

    return matchesSearch && matchesProvince && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Cargando perfiles de escaladores...</p>
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
            <Users className="w-5 h-5 text-blue-400" />
            Escaladores Registrados
          </h3>
          <p className="text-sm text-zinc-400 mt-1">Perfiles de la comunidad ClipApp — leídos desde la colección <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400">profiles</code>.</p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-xs bg-zinc-950 px-4 py-2 border border-zinc-800 rounded-xl text-zinc-400 font-semibold">
            {filteredUsers.length} de {users.length} usuarios
          </div>
          <button
            onClick={loadUsers}
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
        <div className="sm:col-span-1 relative">
          <Search className="w-4 h-4 text-zinc-550 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, tel, instagram, UID..."
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

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none cursor-pointer appearance-none"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="blocked">Bloqueados</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950/60 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <th className="py-3 px-4">Avatar</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">UID</th>
                <th className="py-3 px-4">Teléfono</th>
                <th className="py-3 px-4">Instagram / Email</th>
                <th className="py-3 px-4">Provincia</th>
                <th className="py-3 px-4">Actualizado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50 text-xs">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-zinc-500 font-medium">
                    {users.length === 0
                      ? 'No hay usuarios registrados en la base de datos.'
                      : 'No se encontraron usuarios para los filtros seleccionados.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className={`hover:bg-zinc-800/20 transition ${!user.active ? 'opacity-60 bg-red-950/5' : ''}`}
                  >

                    {/* Avatar */}
                    <td className="py-3 px-4">
                      <AvatarCell avatar={user.avatar} name={user.name} />
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-white text-sm">{user.name}</span>
                    </td>

                    {/* UID */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => copyToClipboard(user.uid, user.uid)}
                        className="flex items-center gap-1.5 font-mono text-[10px] text-zinc-500 hover:text-zinc-300 transition group"
                        title="Copiar UID"
                      >
                        <span className="truncate max-w-[120px]">{user.uid}</span>
                        {copiedId === user.uid
                          ? <Check className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                          : <Copy className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition" />
                        }
                      </button>
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-zinc-300 font-mono">
                      {user.phone ? (
                        <a
                          href={`tel:${user.phone}`}
                          className="flex items-center gap-1.5 hover:text-emerald-400 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                          {user.phone}
                        </a>
                      ) : (
                        <span className="text-zinc-600 italic">—</span>
                      )}
                    </td>

                    {/* Instagram / email */}
                    <td className="py-3 px-4 text-zinc-400">
                      {user.instagram ? (
                        <span className="flex items-center gap-1.5">
                          <AtSign className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                          <span className="truncate max-w-[160px]">{user.instagram}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">—</span>
                      )}
                    </td>

                    {/* Province */}
                    <td className="py-3 px-4 text-zinc-400">
                      {user.province ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" />
                          {user.province}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">—</span>
                      )}
                    </td>

                    {/* Updated At */}
                    <td className="py-3 px-4 text-zinc-500 font-mono">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        {user.updatedAt || '—'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-400' : 'bg-red-400 animate-pulse'}`}></span>
                        {user.active ? 'Activo' : 'Bloqueado'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => toggleUserActiveStatus(user)}
                          disabled={saving}
                          className={`p-1.5 border rounded-lg transition ${
                            user.active
                              ? 'text-zinc-500 border-transparent hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/30'
                              : 'text-red-400 border-red-900/30 bg-red-950/10 hover:bg-red-900 hover:text-zinc-950'
                          }`}
                          title={user.active ? 'Bloquear' : 'Desbloquear'}
                        >
                          {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.uid, user.name)}
                          disabled={saving}
                          className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 border border-transparent rounded-lg transition"
                          title="Eliminar perfil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filteredUsers.length > 0 && (
          <div className="px-5 py-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-600">
            <span>Mostrando {filteredUsers.length} perfil{filteredUsers.length !== 1 ? 'es' : ''}</span>
            <span className="font-mono">{users.length} total en DB</span>
          </div>
        )}
      </div>

    </div>
  );
}
