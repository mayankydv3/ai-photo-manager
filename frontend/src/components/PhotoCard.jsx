import React from 'react';
import { Eye, Copy, Tag, Users, FileText, Pill, Receipt, Plane, Dog, Image as ImageIcon } from 'lucide-react';
import { api } from '../services/api';

const categoryIcons = {
  documents: FileText,
  prescriptions: Pill,
  receipts: Receipt,
  travel: Plane,
  pets: Dog,
  people: Users,
  other: ImageIcon
};

const categoryColors = {
  documents: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  prescriptions: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  receipts: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  travel: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  pets: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  people: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  other: 'bg-slate-800 text-slate-400 border-slate-700'
};

export default function PhotoCard({ photo, onClick, onInspectDuplicate }) {
  const Icon = categoryIcons[photo.category] || ImageIcon;
  const colorClass = categoryColors[photo.category] || categoryColors.other;
  const imageUrl = api.getPhotoFileUrl(photo.id);

  return (
    <div 
      onClick={() => onClick(photo)}
      className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Aspect Ratio Container */}
      <div className="relative aspect-[4/3] bg-slate-950 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={photo.original_filename}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Duplicate Badge */}
        {photo.is_duplicate && (
          <div className="absolute top-2 left-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onInspectDuplicate) onInspectDuplicate(photo);
              }}
              className="px-2.5 py-1 bg-amber-500/90 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-md transition-all"
            >
              <Copy className="w-3 h-3" />
              {photo.duplicate_type === 'exact' ? 'Exact Duplicate' : 'Near Duplicate'}
            </button>
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-2 right-2 z-10">
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider border flex items-center gap-1 shadow-sm backdrop-blur-md ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {photo.category}
          </span>
        </div>

        {/* Hover overlay with zoom icon */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Eye className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-3 bg-slate-900 border-t border-slate-800/80">
        <h3 className="text-xs font-semibold text-slate-200 truncate" title={photo.original_filename}>
          {photo.original_filename}
        </h3>

        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
          <span>{photo.file_size ? `${(photo.file_size / 1024).toFixed(0)} KB` : 'Unknown size'}</span>
          
          <div className="flex items-center gap-2">
            {photo.faces_count > 0 && (
              <span className="flex items-center gap-1 text-purple-400 font-medium">
                <Users className="w-3 h-3" />
                {photo.faces_count}
              </span>
            )}
            <span className="text-slate-400 uppercase text-[10px] px-1.5 py-0.5 bg-slate-800 rounded">
              {photo.source || 'local'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
