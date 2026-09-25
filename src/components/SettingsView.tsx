import React from 'react';
import { 
  Settings, 
  HardDrive, 
  Cpu, 
  Layers, 
  Glasses, 
  SlidersHorizontal, 
  Terminal,
  Check,
  FolderOpen,
  Globe
} from 'lucide-react';
import { AppSettings } from '../types';
import { Language, translations } from '../i18n';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenPythonModal: () => void;
  lang: Language;
  onToggleLang: (lang: Language) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenPythonModal,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];

  return (
    <div className="flex-1 p-6 overflow-y-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">{t.settingsTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.settingsSubtitle}
          </p>
        </div>

        {/* Language selector toggle in settings */}
        <div className="flex items-center gap-2 bg-[#162030] border border-[#233147] rounded-xl p-1">
          <Globe className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <button
            onClick={() => onToggleLang('ru')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              lang === 'ru' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Русский
          </button>
          <button
            onClick={() => onToggleLang('en')}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              lang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Group 1: 360° VR & Spatial Video Parameters */}
      <div className="bg-[#141d2b] border border-[#202c40] rounded-xl p-4">
        <div className="flex items-center gap-2.5 mb-3 text-slate-100 font-medium text-sm">
          <Glasses className="w-4 h-4 text-blue-400" />
          <span>{t.vrSectionTitle}</span>
        </div>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
            <div>
              <div className="font-medium text-slate-200">{t.vrAutoInjectTitle}</div>
              <div className="text-[11px] text-slate-400">
                {t.vrAutoInjectDesc}
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.enableVRMetadata}
              onChange={(e) => onUpdateSettings({ enableVRMetadata: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600"
            />
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div>
              <div className="font-medium text-slate-200">{t.vrProjectionTitle}</div>
              <div className="text-[11px] text-slate-400">
                {t.vrProjectionDesc}
              </div>
            </div>
            <select
              value={settings.vrProjection}
              onChange={(e) => onUpdateSettings({ vrProjection: e.target.value as any })}
              className="bg-[#162030] border border-[#233147] rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value="Equirectangular 360">Equirectangular 360°</option>
              <option value="VR180 3D">VR180 3D (SBS)</option>
              <option value="Fisheye">Fisheye Dome</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group 2: Download Engine & FFmpeg */}
      <div className="bg-[#141d2b] border border-[#202c40] rounded-xl p-4">
        <div className="flex items-center gap-2.5 mb-3 text-slate-100 font-medium text-sm">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>{t.engineSectionTitle}</span>
        </div>
        <div className="space-y-3 text-xs text-slate-300">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
            <div>
              <div className="font-medium text-slate-200">{t.ffmpegPathTitle}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {settings.ffmpegPath || 'ffmpeg встроен в сборку'}
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 border border-emerald-800/40 rounded px-2 py-0.5">
              {t.ffmpegStatusEmbedded}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60">
            <div>
              <div className="font-medium text-slate-200">{t.maxConcurrentTitle}</div>
              <div className="text-[11px] text-slate-400">{t.maxConcurrentDesc}</div>
            </div>
            <select
              value={settings.maxConcurrentDownloads}
              onChange={(e) => onUpdateSettings({ maxConcurrentDownloads: Number(e.target.value) })}
              className="bg-[#162030] border border-[#233147] rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
            >
              <option value={1}>{t.streamCount(1)}</option>
              <option value={2}>{t.streamCount(2)}</option>
              <option value={3}>{t.streamCount(3)}</option>
              <option value={5}>{t.streamCount(5)}</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-1.5">
            <div>
              <div className="font-medium text-slate-200">{t.speedLimitTitle}</div>
              <div className="text-[11px] text-slate-400">{t.speedLimitDesc}</div>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="0"
                max="1000"
                value={settings.speedLimitMBs}
                onChange={(e) => onUpdateSettings({ speedLimitMBs: Number(e.target.value) })}
                className="w-16 bg-[#162030] border border-[#233147] rounded-lg px-2 py-1 text-xs text-slate-200 outline-none text-right font-mono"
              />
              <span className="text-slate-400">{t.mbs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Group 3: Standalone EXE Compiler Tool */}
      <div className="bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-900/40 rounded-xl p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-white font-medium text-sm">
            <Terminal className="w-4 h-4 text-blue-400" />
            <span>{t.compilerSectionTitle}</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-lg">
            {t.compilerSectionDesc}
          </p>
        </div>
        <button
          onClick={onOpenPythonModal}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white rounded-lg transition-colors whitespace-nowrap shadow-sm"
        >
          {t.openExeGenerator}
        </button>
      </div>
    </div>
  );
};
