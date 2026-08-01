import React from 'react';
import { X, Check, Copy, ArrowRight, HardDrive, ShieldCheck, Scale } from 'lucide-react';
import { api } from '../services/api';

export default function DuplicateInspectorModal({ group, onClose, onResolved }) {
  if (!group || !group.primary_photo || !group.duplicates?.length) return null;

  const primary = group.primary_photo;
  const duplicate = group.duplicates[0]; // Compare with first duplicate in group

  const primaryUrl = api.getPhotoFileUrl(primary.id);
  const dupUrl = api.getPhotoFileUrl(duplicate.id);

  const handleKeep = async (keepId) => {
    try {
      await api.resolveDuplicateGroup(group.id, keepId);
      onResolved();
      onClose();
    } catch (err) {
      alert('Error resolving group: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                Duplicate Inspector & Visual Comparison
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold">
                  {group.duplicate_type === 'exact' ? 'Exact Match (100% MD5)' : `Near Match (${(group.similarity_score * 100).toFixed(0)}% Similarity)`}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Select which image to keep to free storage space</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Side-by-Side Photo Comparison */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/20">
          
          {/* Option A: Primary Photo */}
          <div className="bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-4 relative group hover:border-emerald-500 transition-all">
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
                Primary (Recommended)
              </span>
            </div>

            <div className="aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center">
              <img src={primaryUrl} alt={primary.original_filename} className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-semibold text-slate-200 truncate">{primary.original_filename}</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">File Size</span>
                  <span className="font-mono text-slate-200 font-medium">{(primary.file_size / 1024).toFixed(0)} KB</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Dimensions</span>
                  <span className="font-mono text-slate-200 font-medium">{primary.width} × {primary.height}</span>
                </div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 truncate">
                pHash: <span className="text-blue-400">{primary.phash}</span>
              </div>
            </div>

            <button
              onClick={() => handleKeep(primary.id)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Check className="w-4 h-4" />
              Keep Primary & Trash Duplicate
            </button>
          </div>

          {/* Option B: Duplicate Photo */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all">
            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 font-bold text-xs border border-amber-500/30">
                Duplicate File
              </span>
            </div>

            <div className="aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center">
              <img src={dupUrl} alt={duplicate.original_filename} className="w-full h-full object-contain" />
            </div>

            <div className="space-y-2 text-xs">
              <h3 className="font-semibold text-slate-200 truncate">{duplicate.original_filename}</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">File Size</span>
                  <span className="font-mono text-slate-200 font-medium">{(duplicate.file_size / 1024).toFixed(0)} KB</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Dimensions</span>
                  <span className="font-mono text-slate-200 font-medium">{duplicate.width} × {duplicate.height}</span>
                </div>
              </div>
              <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-400 truncate">
                pHash: <span className="text-amber-400">{duplicate.phash}</span>
              </div>
            </div>

            <button
              onClick={() => handleKeep(duplicate.id)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <Check className="w-4 h-4" />
              Keep Duplicate & Trash Primary
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
