import React from 'react';
import { 
  LayoutDashboard, 
  Images, 
  CopyCheck, 
  FolderSearch, 
  Users, 
  CloudSync, 
  Sparkles,
  FileText,
  Pill,
  Receipt,
  Plane,
  Dog
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, stats }) {
  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gallery', label: 'All Photos', icon: Images, count: stats?.total_photos },
    { id: 'duplicates', label: 'Duplicate Cleaner', icon: CopyCheck, count: stats?.duplicate_photos_count, badgeColor: 'bg-amber-500/20 text-amber-400' },
    { id: 'categories', label: 'Smart Categories', icon: FolderSearch },
    { id: 'people', label: 'People & Faces', icon: Users, count: stats?.total_people },
    { id: 'connectors', label: 'Storage & Sync', icon: CloudSync },
  ];

  const quickCategories = [
    { id: 'documents', label: 'Documents', icon: FileText, color: 'text-blue-400' },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill, color: 'text-emerald-400' },
    { id: 'receipts', label: 'Receipts', icon: Receipt, color: 'text-amber-400' },
    { id: 'travel', label: 'Travel', icon: Plane, color: 'text-cyan-400' },
    { id: 'pets', label: 'Pets', icon: Dog, color: 'text-rose-400' },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 z-20">
      <div className="p-4 space-y-6">
        {/* Brand logo header */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-100 tracking-tight">SmartPhoto AI</h1>
            <p className="text-[11px] text-slate-400 font-medium">Enterprise Engine</p>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-800 text-slate-400'}`}>
                    {item.count.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Categories shortcut */}
        <div className="space-y-1 pt-2">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick AI Categories</p>
          {quickCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActivePage(`category-${cat.id}`)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span>{cat.label}</span>
                </div>
                {stats?.categories_breakdown?.[cat.id] !== undefined && (
                  <span className="text-[10px] text-slate-400">
                    {stats.categories_breakdown[cat.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer system status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>AI Engine Active (WAL Mode)</span>
        </div>
      </div>
    </aside>
  );
}
