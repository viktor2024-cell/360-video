import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  Sliders, 
  Tv, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Info,
  Layers
} from 'lucide-react';
import { VideoFormat, VideoItem, AppSettings } from '../types';
import { QUALITY_OPTIONS } from '../mockData';
import { VideoThumbnail } from './Thumbnails';
import { Language, translations } from '../i18n';

interface RightPanelProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  selectedItem: VideoItem | null;
  onOpenInspector: (item: VideoItem) => void;
  lang: Language;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  settings,
  onUpdateSettings,
  selectedItem,
  onOpenInspector,
  lang,
}) => {
  const t = translations[lang];
  const [isOptionsOpen, setIsOptionsOpen] = useState(true);
  const [isQualityDropdownOpen, setIsQualityDropdownOpen] = useState(false);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [pathInput, setPathInput] = useState(settings.outputFolder);

  const formats: VideoFormat[] = ['MP4', 'MKV', 'WebM', 'MP3'];

  const currentQualityLabel = QUALITY_OPTIONS.find(q => q.value === settings.quality)?.label || '1080p (Full HD)';

  const handleSelectFolder = () => {
    const sampleFolders = [
      '/Users/Downloads/YouTube',
      '/Users/Videos/VR_360_Clips',
      '/Users/Movies/YouTube_4K',
      'D:\\Downloads\\VR_Videos',
      'C:\\Users\\Downloads\\YouTube'
    ];
    const currentIndex = sampleFolders.indexOf(settings.outputFolder);
    const nextIndex = (currentIndex + 1) % sampleFolders.length;
    onUpdateSettings({ outputFolder: sampleFolders[nextIndex] });
    setPathInput(sampleFolders[nextIndex]);
  };

  return (
    <aside className="w-72 shrink-0 bg-[#0f141f] border-l border-[#1e2738] p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-4">
        {/* 1. Вывод (Output directory) */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Folder className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.outputHeader}</span>
          </div>

          <div className="bg-[#161f2e] border border-[#233045] rounded-xl px-3 py-2 flex items-center justify-between group hover:border-[#2e405d] transition-colors">
            {isEditingPath ? (
              <input
                type="text"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onBlur={() => {
                  setIsEditingPath(false);
                  onUpdateSettings({ outputFolder: pathInput });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setIsEditingPath(false);
                    onUpdateSettings({ outputFolder: pathInput });
                  }
                }}
                autoFocus
                className="bg-transparent text-xs text-slate-200 font-mono outline-none w-full"
              />
            ) : (
              <span
                onClick={() => setIsEditingPath(true)}
                title={t.clickToEditPath}
                className="text-xs text-slate-300 font-mono truncate cursor-pointer hover:text-white"
              >
                {settings.outputFolder}
              </span>
            )}
            <button
              onClick={handleSelectFolder}
              className="text-slate-400 hover:text-blue-400 p-1 rounded transition-colors ml-1.5"
              title={t.browseFolder}
            >
              <FolderOpen className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Формат (Format) */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.formatHeader}</span>
          </div>

          <div className="bg-[#161f2e] border border-[#233045] rounded-xl p-1 grid grid-cols-4 gap-1">
            {formats.map((fmt) => {
              const isSelected = settings.format === fmt;
              return (
                <button
                  key={fmt}
                  onClick={() => onUpdateSettings({ format: fmt })}
                  className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Качество (Quality) */}
        <div className="relative">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 mb-2">
            <Tv className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.qualityHeader}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsQualityDropdownOpen(!isQualityDropdownOpen)}
            className="w-full bg-[#161f2e] border border-[#233045] hover:border-[#2e405d] rounded-xl px-3 py-2 text-xs text-slate-200 flex items-center justify-between transition-colors"
          >
            <span className="truncate">{currentQualityLabel}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isQualityDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isQualityDropdownOpen && (
            <div className="absolute z-20 left-0 right-0 mt-1.5 bg-[#161f2e] border border-[#233045] rounded-xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto">
              {QUALITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onUpdateSettings({ quality: opt.value });
                    setIsQualityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                    settings.quality === opt.value
                      ? 'bg-blue-600/20 text-blue-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{opt.label}</span>
                  {settings.quality === opt.value && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 4. Дополнительные опции (Accordion) */}
        <div>
          <button
            onClick={() => setIsOptionsOpen(!isOptionsOpen)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 mb-2 hover:text-white"
          >
            <span>{t.additionalOptions}</span>
            {isOptionsOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {isOptionsOpen && (
            <div className="space-y-2.5 pt-1">
              {/* Checkbox: Скачать субтитры */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.downloadSubtitles}
                  onChange={(e) => onUpdateSettings({ downloadSubtitles: e.target.checked })}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  settings.downloadSubtitles ? 'bg-blue-600 border-blue-600' : 'bg-[#161f2e] border-[#2c3d59]'
                }`}>
                  {settings.downloadSubtitles && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span>{t.downloadSubtitles}</span>
              </label>

              {/* Checkbox: Сохранить в плейлист */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.saveToPlaylist}
                  onChange={(e) => onUpdateSettings({ saveToPlaylist: e.target.checked })}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  settings.saveToPlaylist ? 'bg-blue-600 border-blue-600' : 'bg-[#161f2e] border-[#2c3d59]'
                }`}>
                  {settings.saveToPlaylist && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span>{t.saveToPlaylist}</span>
              </label>

              {/* Checkbox: Загрузить обложку */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.downloadThumbnail}
                  onChange={(e) => onUpdateSettings({ downloadThumbnail: e.target.checked })}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  settings.downloadThumbnail ? 'bg-blue-600 border-blue-600' : 'bg-[#161f2e] border-[#2c3d59]'
                }`}>
                  {settings.downloadThumbnail && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <span>{t.downloadThumbnail}</span>
              </label>

              {/* Checkbox: 360 VR метаданные */}
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={settings.enableVRMetadata}
                  onChange={(e) => onUpdateSettings({ enableVRMetadata: e.target.checked })}
                  className="hidden"
                />
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  settings.enableVRMetadata ? 'bg-blue-600 border-blue-600' : 'bg-[#161f2e] border-[#2c3d59]'
                }`}>
                  {settings.enableVRMetadata && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
                <div className="flex items-center gap-1.5">
                  <span>{t.vrSpatialInjection}</span>
                  <span className="text-[10px] text-blue-400 bg-blue-950/60 border border-blue-800/40 rounded px-1">{t.vrBadge}</span>
                </div>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* 5. Selected Item Preview Card (bottom) */}
      {selectedItem && (
        <div className="mt-4 pt-3 border-t border-[#1a2333]/80">
          <div className="bg-[#161f2e] border border-[#233045] rounded-xl p-2.5 flex items-center gap-2.5 group hover:border-[#2e405d] transition-colors">
            <VideoThumbnail
              type={selectedItem.thumbnailType}
              duration={selectedItem.duration}
              className="w-14 h-9.5 rounded-md"
              isVR={selectedItem.isVR}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[12px] font-medium text-slate-200 truncate" title={selectedItem.title}>
                {selectedItem.title}
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                {selectedItem.quality} · {selectedItem.format} · {selectedItem.size}
              </div>
            </div>
            <button
              onClick={() => onOpenInspector(selectedItem)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={t.infoAndVrPreview}
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
