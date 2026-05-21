'use client';

import React, { useState, useEffect } from 'react';
import { useAdmin } from '../layout';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  ShieldCheck,
  Check,
  Phone,
  AtSign,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, orderBy, query } from 'firebase/firestore';

// Real Firestore schema from mobile app (cordada_reports collection)
interface CordadaReport {
  id: string;
  postId: string;
  destination: string;
  postedByName: string;
  postedByPhone: string;
  reason: string;
  reporterName: string;
  reporterPhone: string;
  timestamp: string;
  estado: 'Pendiente' | 'Resuelto' | 'Desestimado';
}

function formatTimestamp(ts: { toDate?: () => Date } | string | null | undefined): string {
  if (!ts) return '—';
  if (typeof ts === 'object' && ts.toDate) {
    return ts.toDate().toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
  return String(ts);
}

export default function ReportesModeracion() {
  const { isDemoMode } = useAdmin();

  const [reports, setReports] = useState<CordadaReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'Pendiente' | 'Resuelto' | 'Desestimado'>('all');

  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionMessage]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'cordada_reports'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const loaded: CordadaReport[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          postId: data.postId || '',
          destination: data.destination || '',
          postedByName: data.postedByName || '',
          postedByPhone: data.postedByPhone || '',
          reason: data.reason || '',
          reporterName: data.reporterName || '',
          reporterPhone: data.reporterPhone || '',
          timestamp: formatTimestamp(data.timestamp),
          estado: data.estado || 'Pendiente',
        };
      });
      setReports(loaded);
    } catch (err: unknown) {
      console.error(err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error al cargar reportes: ${errorMsg}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isDemoMode) loadReports();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  const updateStatus = async (reportId: string, newStatus: 'Resuelto' | 'Desestimado') => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'cordada_reports', reportId), { estado: newStatus });
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, estado: newStatus } : r));
      setActionMessage({ text: `Reporte marcado como ${newStatus}.`, type: 'success' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const deletePost = async (report: CordadaReport) => {
    if (!window.confirm(`¿Eliminar la cordada de ${report.postedByName} hacia ${report.destination}?`)) return;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'cordadas', report.postId));
      await updateDoc(doc(db, 'cordada_reports', report.id), { estado: 'Resuelto' });
      setReports(prev => prev.map(r => r.id === report.id ? { ...r, estado: 'Resuelto' } : r));
      setActionMessage({ text: 'Publicación eliminada y reporte resuelto.', type: 'success' });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setActionMessage({ text: `Error: ${errorMsg}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const filteredReports = reports.filter(r =>
    statusFilter === 'all' || r.estado === statusFilter
  );

  const counts = {
    all: reports.length,
    Pendiente: reports.filter(r => r.estado === 'Pendiente').length,
    Resuelto: reports.filter(r => r.estado === 'Resuelto').length,
    Desestimado: reports.filter(r => r.estado === 'Desestimado').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium">Cargando reportes de moderación...</p>
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
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Reportes de Moderación
          </h3>
          <p className="text-sm text-zinc-400 mt-1">
            Denuncias recibidas en <code className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-emerald-400">cordada_reports</code> — ordenadas por más recientes.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Status tabs */}
          <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs font-semibold">
            {(['all', 'Pendiente', 'Resuelto', 'Desestimado'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  statusFilter === f ? 'bg-zinc-800 text-white border border-zinc-700/40' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {f === 'all' ? 'Todos' : f} ({counts[f]})
              </button>
            ))}
          </div>
          <button
            onClick={loadReports}
            disabled={saving}
            className="p-2 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition text-zinc-400 hover:text-white"
            title="Recargar"
          >
            <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-zinc-900/40 border border-zinc-800 p-12 rounded-3xl text-center">
            <ShieldCheck className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" />
            <p className="text-sm font-bold text-zinc-500">Sin reportes en esta categoría.</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className={`bg-zinc-900 border rounded-2xl p-6 shadow-xl space-y-4 transition ${
                report.estado === 'Pendiente'
                  ? 'border-red-900/50 bg-red-950/5 hover:border-red-800/60'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {/* Report header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Status badge */}
                  <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${
                    report.estado === 'Pendiente' ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' :
                    report.estado === 'Resuelto' ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' :
                    'bg-zinc-800 border-zinc-700 text-zinc-400'
                  }`}>
                    {report.estado === 'Pendiente' && <Clock className="w-3 h-3 animate-pulse" />}
                    {report.estado === 'Resuelto' && <CheckCircle className="w-3 h-3" />}
                    {report.estado === 'Desestimado' && <XCircle className="w-3 h-3" />}
                    {report.estado}
                  </span>

                  <div>
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {report.destination}
                    </h4>
                    <span className="text-[10px] text-zinc-600 font-mono">Post ID: {report.postId}</span>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap">{report.timestamp}</span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">

                {/* Reason */}
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1">Motivo</p>
                  <p className="text-red-400 font-bold text-sm">{report.reason}</p>
                </div>

                {/* Reported post author */}
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Publicado por</p>
                  <p className="font-bold text-white">{report.postedByName}</p>
                  <a
                    href={`tel:${report.postedByPhone}`}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition"
                  >
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    {report.postedByPhone || '—'}
                  </a>
                </div>

                {/* Reporter */}
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Denunciado por</p>
                  <p className="font-bold text-white">{report.reporterName}</p>
                  <a
                    href={`tel:${report.reporterPhone}`}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 transition"
                  >
                    <AtSign className="w-3.5 h-3.5 flex-shrink-0" />
                    {report.reporterPhone || '—'}
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800">
                {report.estado === 'Pendiente' && (
                  <>
                    <button
                      onClick={() => deletePost(report)}
                      disabled={saving}
                      className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 border border-red-900/30"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Eliminar Publicación
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'Resuelto')}
                      disabled={saving}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Marcar Resuelto
                    </button>
                    <button
                      onClick={() => updateStatus(report.id, 'Desestimado')}
                      disabled={saving}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-xs font-bold rounded-xl border border-zinc-700 transition"
                    >
                      Desestimar
                    </button>
                  </>
                )}
                {report.estado === 'Resuelto' && (
                  <span className="text-zinc-500 flex items-center gap-1.5 text-xs font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Reporte resuelto
                  </span>
                )}
                {report.estado === 'Desestimado' && (
                  <span className="text-zinc-600 flex items-center gap-1.5 text-xs font-medium">
                    <XCircle className="w-4 h-4" /> Reporte desestimado
                  </span>
                )}
                <span className="ml-auto text-[10px] font-mono text-zinc-700">ID: {report.id}</span>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
