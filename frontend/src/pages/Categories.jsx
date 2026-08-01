import React, { useState } from 'react';
import { FileText, Pill, Receipt, Plane, Dog, Users, Image as ImageIcon } from 'lucide-react';
import PhotoCard from '../components/PhotoCard';

export default function Categories({ photos, onPhotoClick, initialCategory }) {
  const [selectedCat, setSelectedCat] = useState(initialCategory || 'documents');

  const categories = [
    { id: 'documents', name: 'Documents & Contracts', icon: FileText, desc: 'Scanned contracts, certificates, identity cards, official documents', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
    { id: 'prescriptions', name: 'Prescriptions & Medical', icon: Pill, desc: 'Doctor prescriptions, pharmacy scripts, medication details', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
    { id: 'receipts', name: 'Receipts & Financial', icon: Receipt, desc: 'Retail store receipts, invoices, payment bills, transaction slips', color: 'border-amber-500/30 text-amber-400 bg-amber-500/10' },
    { id: 'travel', name: 'Travel & Vacation', icon: Plane, desc: 'Beaches, mountains, vacation trips, landmarks, landscape photos', color: 'border-cyan-500/30 text-cyan-400 bg-cyan-500/10' },
    { id: 'pets', name: 'Pets & Animals', icon: Dog, desc: 'Dogs, cats, puppies, kittens, family pets', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
    { id: 'people', name: 'People & Portraits', icon: Users, desc: 'Portraits, group photos, family moments, selfies', color: 'border-purple-500/30 text-purple-400 bg-purple-500/10' },
  ];

  const catPhotos = photos.filter((p) => p.category === selectedCat);
  const activeSpec = categories.find((c) => c.id === selectedCat) || categories[0];

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Category selector grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCat === cat.id;
          const count = photos.filter((p) => p.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/20'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20 text-white' : cat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[11px] font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                  {count}
                </span>
              </div>
              <span className="text-xs font-semibold truncate">{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Category Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${activeSpec.color}`}>
          <activeSpec.icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">{activeSpec.name}</h2>
          <p className="text-xs text-slate-400">{activeSpec.desc}</p>
        </div>
      </div>

      {/* Photos Grid */}
      {catPhotos.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 text-center text-slate-400 text-sm">
          No photos categorized under {activeSpec.name} yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {catPhotos.map((p) => (
            <PhotoCard key={p.id} photo={p} onClick={onPhotoClick} />
          ))}
        </div>
      )}

    </div>
  );
}
