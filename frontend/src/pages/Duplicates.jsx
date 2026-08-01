import React, { useEffect, useState } from 'react';
import { Copy, Trash2, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';
import PhotoCard from '../components/PhotoCard';

export default function Duplicates({ onInspectGroup, refreshData }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const data = await api.getDuplicateGroups();
      setGroups(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleBulkDelete = async () => {
    if (!window.confirm('Delete all detected exact duplicate photos to free up storage space?')) return;
    try {
      const res = await api.bulkDeleteDuplicates();
      alert(`Cleaned ${res.deleted_count} duplicate photos! Freed ${res.freed_mb} MB of storage.`);
      fetchGroups();
      refreshData();
    } catch (err) {
      alert('Error cleaning duplicates: ' + err.message);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Copy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Near & Exact Duplicate Cleaner</h1>
            <p className="text-xs text-slate-400">Identifies exact hash matches and visual perceptual near-duplicates (pHash / CLIP vectors)</p>
          </div>
        </div>

        <button
          onClick={handleBulkDelete}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Bulk Clean All Duplicates
        </button>
      </div>

      {/* Duplicate Groups List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Analyzing duplicate clusters...</div>
      ) : groups.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-200">No Duplicates Found!</h3>
          <p className="text-xs text-slate-400">Your media storage is completely clean and deduplicated.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase">
                    {group.duplicate_type === 'exact' ? 'Exact Duplicate (100% Hash Match)' : `Near Duplicate (${(group.similarity_score * 100).toFixed(0)}% Similarity)`}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Group #{group.id}</span>
                </div>

                <button
                  onClick={() => onInspectGroup(group)}
                  className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-500/30 transition-all"
                >
                  Side-by-Side Compare
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Pair comparison row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {group.primary_photo && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-400 mb-1 block">Primary</span>
                    <PhotoCard photo={group.primary_photo} onClick={() => onInspectGroup(group)} />
                  </div>
                )}
                {group.duplicates.map((dup) => (
                  <div key={dup.id}>
                    <span className="text-[10px] uppercase font-bold text-amber-400 mb-1 block">Duplicate</span>
                    <PhotoCard photo={dup} onClick={() => onInspectGroup(group)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
