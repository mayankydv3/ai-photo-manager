import React, { useState } from 'react';
import { Filter, Sparkles, X, Grid, List } from 'lucide-react';
import PhotoCard from '../components/PhotoCard';

export default function Gallery({ photos, searchQuery, onResetSearch, onPhotoClick, onInspectDuplicate }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showDuplicatesOnly, setShowDuplicatesOnly] = useState(false);

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'documents', label: 'Documents' },
    { id: 'prescriptions', label: 'Prescriptions' },
    { id: 'receipts', label: 'Receipts' },
    { id: 'people', label: 'People' },
    { id: 'travel', label: 'Travel' },
    { id: 'pets', label: 'Pets' },
    { id: 'other', label: 'Other' },
  ];

  const filteredPhotos = photos.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (showDuplicatesOnly && !p.is_duplicate) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-10 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Active Natural Language Search Banner */}
      {searchQuery && (
        <div className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>AI Search query active: <strong className="text-white font-mono">"{searchQuery}"</strong> ({filteredPhotos.length} matches)</span>
          </div>
          <button
            onClick={onResetSearch}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
          >
            <X className="w-3.5 h-3.5" />
            Clear Search
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Duplicates Filter Switch */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
            <input 
              type="checkbox"
              checked={showDuplicatesOnly}
              onChange={(e) => setShowDuplicatesOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-amber-500 focus:ring-amber-500"
            />
            <span className="font-medium text-amber-400">Duplicates Only</span>
          </label>
        </div>

      </div>

      {/* Photos Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center space-y-3">
          <p className="text-slate-400 text-sm font-medium">No matching photos found in gallery.</p>
          <p className="text-xs text-slate-500">Try adjusting your AI search terms or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredPhotos.map((p) => (
            <PhotoCard
              key={p.id}
              photo={p}
              onClick={onPhotoClick}
              onInspectDuplicate={onInspectDuplicate}
            />
          ))}
        </div>
      )}

    </div>
  );
}
