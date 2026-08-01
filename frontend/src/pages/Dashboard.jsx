import React from 'react';
import { 
  Images, 
  CopyCheck, 
  HardDrive, 
  Users, 
  Trash2, 
  Sparkles, 
  Cloud, 
  Cpu,
  FileText,
  Pill,
  Receipt,
  Plane,
  Dog,
  ArrowRight
} from 'lucide-react';
import PhotoCard from '../components/PhotoCard';
import { api } from '../services/api';

export default function Dashboard({ stats, photos, onPhotoClick, onNavigate, refreshData }) {
  const categoriesList = [
    { id: 'documents', name: 'Documents & Contracts', icon: FileText, color: 'bg-blue-500' },
    { id: 'prescriptions', name: 'Prescriptions & Medical', icon: Pill, color: 'bg-emerald-500' },
    { id: 'receipts', name: 'Receipts & Financial', icon: Receipt, color: 'bg-amber-500' },
    { id: 'travel', name: 'Travel & Vacation', icon: Plane, color: 'bg-cyan-500' },
    { id: 'pets', name: 'Pets & Animals', icon: Dog, color: 'bg-rose-500' },
    { id: 'people', name: 'People & Portraits', icon: Users, color: 'bg-purple-500' },
  ];

  const handleBulkDelete = async () => {
    if (!window.confirm('Delete all detected exact duplicate photos to free up storage space?')) return;
    try {
      const res = await api.bulkDeleteDuplicates();
      alert(`Cleaned ${res.deleted_count} duplicate photos! Freed ${res.freed_mb} MB of storage.`);
      refreshData();
    } catch (err) {
      alert('Error cleaning duplicates: ' + err.message);
    }
  };

  const totalBytes = stats?.total_storage_bytes || 0;
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(1);
  const dupBytes = stats?.duplicate_bytes_savable || 0;
  const dupMB = (dupBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-300">
      {/* Top Welcome Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border border-blue-500/20 p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Smart Media Management Engine
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Intelligent Photo Organization & Near-Duplicate Cleaner
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Connected to local file systems & Google Photos. Automatically indexes up to 100,000+ photos, identifies exact & near-duplicates, categorizes document/medical records, and groups individuals with facial recognition.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => onNavigate('duplicates')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <CopyCheck className="w-4 h-4" />
              Review Duplicates ({stats?.duplicate_photos_count || 0})
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clean All Duplicates (Free {dupMB} MB)
            </button>
          </div>
        </div>
      </div>

      {/* High-Level Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Total Photos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Indexed Photos</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Images className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {(stats?.total_photos || 0).toLocaleString()}
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <Cpu className="w-3.5 h-3.5" />
              <span>Scalable up to 100,000+ entries</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Duplicate Storage Savings */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Duplicate Photos</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <CopyCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
              {stats?.duplicate_photos_count || 0}
            </span>
            <div className="mt-2 text-[11px] text-slate-400 font-mono">
              Potential Savings: <span className="text-amber-300 font-bold">{dupMB} MB</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Recognized People */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">People & Faces</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {stats?.total_people || 0}
            </span>
            <div className="mt-2 text-[11px] text-slate-400 font-mono">
              Total Faces Detected: <span className="text-purple-300 font-bold">{stats?.total_faces || 0}</span>
            </div>
          </div>
        </div>

        {/* Metric 4: Total Storage Used */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Storage Managed</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
              {totalMB} MB
            </span>
            <div className="mt-2 text-[11px] text-slate-400">
              Local Scanner & Cloud Sync Active
            </div>
          </div>
        </div>

      </div>

      {/* Category Breakdown Progress Bar Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-100">AI Classification Distribution</h2>
            <p className="text-xs text-slate-400">Automatic multi-modal categorization of indexed media</p>
          </div>
          <button 
            onClick={() => onNavigate('categories')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
          >
            Explore Categories
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoriesList.map((cat) => {
            const Icon = cat.icon;
            const count = stats?.categories_breakdown?.[cat.id] || 0;
            const total = stats?.total_photos || 1;
            const pct = Math.min(100, Math.round((count / total) * 100));

            return (
              <div 
                key={cat.id} 
                onClick={() => onNavigate(`category-${cat.id}`)}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg ${cat.color}/20 text-slate-200 flex items-center justify-center`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-200">{cat.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{count}</span>
                </div>

                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Indexed Media */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-slate-100">Recently Indexed Media</h2>
          <button 
            onClick={() => onNavigate('gallery')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-all"
          >
            View All Photos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {photos.slice(0, 6).map((p) => (
            <PhotoCard key={p.id} photo={p} onClick={onPhotoClick} />
          ))}
        </div>
      </div>

    </div>
  );
}
