'use client';

import React from 'react';
import { Activity, Terminal, Search, Send, RefreshCw } from 'lucide-react';

interface NavbarProps {
  activeTab: 'monitor' | 'tracker' | 'api' | 'simulate';
  setActiveTab: (tab: 'monitor' | 'tracker' | 'api' | 'simulate') => void;
  isLivePolling: boolean;
  setIsLivePolling: (val: boolean) => void;
  onRefresh: () => void;
  onOpenSimulate?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  isLivePolling,
  setIsLivePolling,
  onRefresh,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Navigation tabs */}
      <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`relative py-1 transition-colors hover:text-white ${
            activeTab === 'monitor' ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4" />
            Pemantauan Transaksi
          </span>
          {activeTab === 'monitor' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('tracker')}
          className={`relative py-1 transition-colors hover:text-white ${
            activeTab === 'tracker' ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Search className="w-4 h-4" />
            Pengecekan Dana UETR
          </span>
          {activeTab === 'tracker' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`relative py-1 transition-colors hover:text-white ${
            activeTab === 'api' ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4" />
            Integrasi API Aman
          </span>
          {activeTab === 'api' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('simulate')}
          className={`relative py-1 transition-colors hover:text-white ${
            activeTab === 'simulate' ? 'text-blue-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Send className="w-4 h-4" />
            Inisiasi pacs.008
          </span>
          {activeTab === 'simulate' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
          )}
        </button>
      </nav>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {/* Real-time toggle */}
        <button
          onClick={() => setIsLivePolling(!isLivePolling)}
          className={`hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium border transition-colors ${
            isLivePolling
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400'
              : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Sinkronisasi status real-time jaringan SWIFT"
        >
          <span className={`w-2 h-2 rounded-full ${isLivePolling ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          {isLivePolling ? 'Real-time Aktif' : 'Real-time Jeda'}
        </button>

        {/* Manual refresh button */}
        <button
          onClick={onRefresh}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Perbarui Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
