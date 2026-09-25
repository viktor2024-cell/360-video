import React from 'react';
import { 
  Download, 
  Clock, 
  ListMusic, 
  Settings, 
  Terminal,
  Layers
} from 'lucide-react';
import { Language, translations } from '../i18n';

interface SidebarProps {
  activeTab: 'download' | 'history' | 'playlists' | 'settings';
  setActiveTab: (tab: 'download' | 'history' | 'playlists' | 'settings') => void;
  onOpenPythonModal: () => void;
  onOpenExeModal: () => void;
  isDownloading: boolean;
  lang: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenPythonModal,
  onOpenExeModal,
  isDownloading,
  lang,
}) => {
  const t = translations[lang];

  return (
    <aside className="w-56 shrink-0 bg-[#0f141f] border-r border-[#1e2738] flex flex-col justify-between select-none py-4 px-3.5">
      {/* Top Section */}
      <div>
        {/* macOS Traffic Lights */}
        <div className="flex items-center gap-2 mb-6 px-1.5 pt-1">
          <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]/40 shadow-xs cursor-pointer hover:brightness-110" title={t.close} />
          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40 shadow-xs cursor-pointer hover:brightness-110" title={t.minimize} />
          <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40 shadow-xs cursor-pointer hover:brightness-110" title={t.maximize} />
        </div>

        {/* Brand Lockup */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-6 h-4.5 bg-[#ef233c] rounded-[5px] flex items-center justify-center shadow-xs">
            <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-current ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <span className="font-semibold text-[13.5px] tracking-tight text-white">
            {t.appName}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('download')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === 'download'
                ? 'bg-[#1b2b48] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Download className={`w-4 h-4 ${activeTab === 'download' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>{t.tabDownload}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-[#1b2b48] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Clock className={`w-4 h-4 ${activeTab === 'history' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>{t.tabHistory}</span>
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === 'playlists'
                ? 'bg-[#1b2b48] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ListMusic className={`w-4 h-4 ${activeTab === 'playlists' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>{t.tabPlaylists}</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-[#1b2b48] text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Settings className={`w-4 h-4 ${activeTab === 'settings' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>{t.tabSettings}</span>
          </button>
        </nav>
      </div>

      {/* Bottom Status */}
      <div className="pt-3 border-t border-[#1a2333]/80 px-2 space-y-2">
        {/* Standalone 1 .EXE modal opener */}
        <button
          onClick={onOpenExeModal}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 text-[11.5px] font-semibold transition-all shadow-xs"
          title="Получить единый .EXE файл (Portable без установки)"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{t.getExeFile}</span>
        </button>

        {/* Python script modal opener */}
        <button
          onClick={onOpenPythonModal}
          className="w-full flex items-center gap-2 px-2 py-1 rounded text-[11px] text-slate-400 hover:text-blue-300 hover:bg-blue-950/30 transition-colors"
          title="Скрипт Python и PyInstaller для сборки standalone .exe"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.builderCode}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isDownloading ? 'bg-blue-400' : 'bg-emerald-400'} opacity-75`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isDownloading ? 'bg-blue-500' : 'bg-emerald-500'}`} />
          </span>
          <span className="text-[12px] font-medium text-slate-300">
            {isDownloading ? t.statusDownloading : t.statusReady}
          </span>
        </div>
        <div className="text-[11px] text-slate-500 font-mono mt-1">
          {t.versionInfo}
        </div>
      </div>
    </aside>
  );
};
