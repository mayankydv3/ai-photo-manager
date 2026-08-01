import React, { useState } from 'react';
import { X, Trash2, Download, Copy, Shield, FileText, Tag, Users, Hash, Calendar, HardDrive, Maximize2 } from 'lucide-react';
import { api } from '../services/api';

export default function LightboxModal({ photo, onClose, onDelete, onInspectDuplicate }) {
  const [activeTab, setActiveTab] = useState('metadata');
  if (!photo) return null;

  const imageUrl = api.getPhotoFileUrl(photo.id);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;
    try {
      await api.deletePhoto(photo.id);
      onDelete(photo.id);
      onClose();
    } catch (err) {
      alert('Failed to delete photo: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col lg:flex-row shadow-2xl">
        
        {/* Main Image Preview Area */}
        <div className="flex-1 bg-slate-950 relative flex items-center justify-center p-6 overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <img 
            src={imageUrl} 
            alt={photo.original_filename}
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
          />

          {/* Bounding box face overlays */}
          {photo.faces && photo.faces.map((face, idx) => (
            <div 
              key={idx}
              style={{
                left: `${(face.bounding_box?.x || 0) * 100}%`,
                top: `${(face.bounding_box?.y || 0) * 100}%`,
                width: `${(face.bounding_box?.width || 0) * 100}%`,
                height: `${(face.bounding_box?.height || 0) * 100}%`,
              }}
              className="absolute border-2 border-blue-500 bg-blue-500/10 rounded-lg pointer-events-none flex items-start justify-start p-1"
            >
              <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                Face #{idx + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Sidebar Info Panel */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-800 bg-slate-900 flex flex-col justify-between overflow-y-auto">
          {/* Header tabs */}
          <div>
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-sm text-slate-100 truncate max-w-[200px]" title={photo.original_filename}>
                  {photo.original_filename}
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: #{photo.id}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center transition-all"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex border-b border-slate-800 text-xs font-semibold">
              <button 
                onClick={() => setActiveTab('metadata')}
                className={`flex-1 py-3 border-b-2 text-center transition-all ${activeTab === 'metadata' ? 'border-blue-500 text-blue-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
              >
                AI Metadata
              </button>
              {photo.extracted_text && (
                <button 
                  onClick={() => setActiveTab('ocr')}
                  className={`flex-1 py-3 border-b-2 text-center transition-all ${activeTab === 'ocr' ? 'border-blue-500 text-blue-400 bg-slate-800/40' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
                >
                  OCR Text
                </button>
              )}
            </div>

            {/* Tab Contents */}
            <div className="p-6 space-y-6 text-xs">
              {activeTab === 'metadata' ? (
                <>
                  {/* Category & Confidence */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Category</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold uppercase text-[10px]">
                        {photo.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Confidence Score</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {((photo.category_confidence || 1.0) * 100).toFixed(0)}%
                      </span>
                    </div>
                    {photo.is_duplicate && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-amber-400 font-medium">Duplicate Status</span>
                        <button
                          onClick={() => onInspectDuplicate(photo)}
                          className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold hover:bg-amber-500/30 flex items-center gap-1 text-[10px]"
                        >
                          <Copy className="w-3 h-3" />
                          Compare
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Hashes & File Details */}
                  <div className="space-y-3">
                    <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Technical Signatures</p>
                    <div className="space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                        <span className="text-slate-500">MD5:</span>
                        <span className="text-slate-300 truncate max-w-[180px]">{photo.md5_hash || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                        <span className="text-slate-500">pHash:</span>
                        <span className="text-slate-300 font-bold text-blue-400">{photo.phash || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800/50">
                        <span className="text-slate-500">Dimensions:</span>
                        <span className="text-slate-300">{photo.width} × {photo.height}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Tags */}
                  {photo.tags && photo.tags.length > 0 && (
                    <div>
                      <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        Extracted AI Tags
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {photo.tags.map((t, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700/50">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <p className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <FileText className="w-3 h-3 text-blue-400" />
                    OCR Scanned Text Content
                  </p>
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-slate-300 text-xs leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {photo.extracted_text}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/50">
            <a 
              href={imageUrl} 
              download={photo.original_filename}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Original Image
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
