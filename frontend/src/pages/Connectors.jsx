import React, { useState } from 'react';
import { CloudSync, HardDrive, CheckCircle, RefreshCw, ExternalLink, Folder, Lock } from 'lucide-react';
import { api } from '../services/api';

export default function Connectors({ refreshData }) {
  const [localPath, setLocalPath] = useState('./storage/sample_photos');
  const [isScanning, setIsScanning] = useState(false);
  const [isSyncingGoogle, setIsSyncingGoogle] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleScanLocal = async (e) => {
    e.preventDefault();
    if (!localPath.trim()) return;
    setIsScanning(true);
    try {
      const res = await api.scanLocalDirectory(localPath);
      setScanResult(res);
      refreshData();
    } catch (err) {
      alert('Local scan error: ' + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGoogleSync = async () => {
    setIsSyncingGoogle(true);
    try {
      const res = await api.syncGooglePhotos('user@gmail.com');
      alert(`Google Photos synced successfully! Ingested ${res.synced_photos} photos.`);
      refreshData();
    } catch (err) {
      alert('Google Photos sync error: ' + err.message);
    } finally {
      setIsSyncingGoogle(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
          <CloudSync className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-100">Storage Connectors & Sync Engine</h1>
          <p className="text-xs text-slate-400">Connect Google Photos API cloud storage & local file system directories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Connector 1: Local File System Directory Scanner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-blue-400" />
                <h2 className="font-bold text-sm text-slate-200">Local Directory Watcher</h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Recursively scans local computer folders, extracts EXIF headers, generates pHash signatures & CLIP vectors.
            </p>

            <form onSubmit={handleScanLocal} className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Directory Path</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={localPath}
                    onChange={(e) => setLocalPath(e.target.value)}
                    placeholder="/path/to/photos"
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning ? 'Scanning Directory...' : 'Trigger Local Directory Indexing'}
              </button>
            </form>

            {scanResult && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1 font-mono text-emerald-400">
                <p>Status: {scanResult.status}</p>
                <p>Found: {scanResult.total_found} photos</p>
                <p>Newly Indexed: {scanResult.newly_processed}</p>
              </div>
            )}
          </div>
        </div>

        {/* Connector 2: Google Photos API Connector */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudSync className="w-5 h-5 text-cyan-400" />
                <h2 className="font-bold text-sm text-slate-200">Google Photos REST API</h2>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px] uppercase">
                OAuth2 Ready
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Connects to Google Photos REST API `/v1/mediaItems` with OAuth2 authentication to synchronize cloud albums.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Sync Account:</span>
                <span className="text-slate-200 font-mono">user@gmail.com</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Scope:</span>
                <span className="text-cyan-400 font-mono">photoslibrary.readonly</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSync}
              disabled={isSyncingGoogle}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingGoogle ? 'animate-spin' : ''}`} />
              {isSyncingGoogle ? 'Syncing Google Photos...' : 'Trigger Google Photos API Sync'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
