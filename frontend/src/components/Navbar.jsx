import React, { useState } from 'react';
import { Search, Sparkles, Upload, CloudSync, Cpu, HardDrive } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ onSearch, activePage, stats, refreshData }) {
  const [query, setQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.uploadPhoto(formData);
      alert('Photo uploaded & processed successfully!');
      refreshData();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSeed100k = async () => {
    if (!window.confirm('Scale database to 100,000 photos for scalability benchmarking?')) return;
    setIsSeeding(true);
    try {
      await api.seedDataset(true);
      alert('Database successfully scaled to 100,000 photos!');
      refreshData();
    } catch (err) {
      alert('Seeding error: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search with natural language (e.g. 'doctor prescriptions from last month', 'beach sunset with pets')..."
            className="w-full pl-10 pr-24 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-medium text-white rounded-lg hover:from-blue-500 hover:to-indigo-500 flex items-center gap-1 shadow-sm transition-all"
          >
            <Sparkles className="w-3 h-3" />
            AI Search
          </button>
        </div>
      </form>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSeed100k}
          disabled={isSeeding}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
          title="Simulate 100,000 Indexed Items"
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          {isSeeding ? 'Scaling 100k...' : 'Scale 100k Photos'}
        </button>

        <label className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20 transition-all">
          <Upload className="w-3.5 h-3.5" />
          {isUploading ? 'Uploading...' : 'Upload Photo'}
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        {stats && (
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            <span>{(stats.total_photos || 0).toLocaleString()} Photos</span>
          </div>
        )}
      </div>
    </header>
  );
}
