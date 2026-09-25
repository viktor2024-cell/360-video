import React, { useState, useRef, useEffect } from 'react';
import { Download, MoreVertical, Trash2, Copy, ExternalLink, Info, Play } from 'lucide-react';
import { VideoItem } from '../types';
import { VideoThumbnail } from './Thumbnails';
import { Language, translations } from '../i18n';

interface QueueItemProps {
  item: VideoItem;
  isSelected?: boolean;
  onSelect: (item: VideoItem) => void;
  onStartDownload: (item: VideoItem) => void;
  onRemove: (id: string) => void;
  onOpenInspector: (item: VideoItem) => void;
  lang: Language;
}

export const QueueItemRow: React.FC<QueueItemProps> = ({
  item,
  isSelected,
  onSelect,
  onStartDownload,
  onRemove,
  onOpenInspector,
  lang,
}) => {
  const t = translations[lang];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(item.url);
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group relative rounded-xl p-2.5 flex items-center gap-3.5 transition-all cursor-pointer border ${
        isSelected
          ? 'bg-[#182335] border-blue-500/60 shadow-xs'
          : 'bg-[#141d2b] hover:bg-[#162132] border-[#202c40]'
      }`}
    >
      {/* Thumbnail */}
      <VideoThumbnail
        type={item.thumbnailType}
        duration={item.duration}
        className="w-24 h-14 rounded-lg"
        isVR={item.isVR}
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <h4 className="text-[13px] font-medium text-slate-100 truncate group-hover:text-blue-200 transition-colors">
          {item.title}
        </h4>
        <div className="text-[11.5px] text-slate-400 mt-0.5 truncate">
          {item.channel}
        </div>
        <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
          <span>{item.quality}</span>
          <span>·</span>
          <span>{item.format}</span>
          <span>·</span>
          <span>{item.size}</span>
          {item.isVR && (
            <>
              <span>·</span>
              <span className="text-blue-400 font-sans font-semibold text-[10px]">360° VR</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onStartDownload(item)}
          className="w-8 h-8 rounded-lg bg-[#1f2b3e] hover:bg-blue-600 hover:text-white text-slate-300 flex items-center justify-center transition-colors shadow-xs"
          title={t.downloadThisVideo}
        >
          <Download className="w-3.5 h-3.5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-8 h-8 rounded-lg bg-[#1f2b3e] hover:bg-[#27374f] text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors"
            title={t.options}
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-9 w-48 bg-[#172131] border border-[#26374f] rounded-xl shadow-2xl py-1 z-30 text-xs text-slate-200">
              <button
                onClick={() => {
                  onStartDownload(item);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-700/50 text-left transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-blue-400" />
                <span>{t.downloadNow}</span>
              </button>
              <button
                onClick={() => {
                  onOpenInspector(item);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-700/50 text-left transition-colors"
              >
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.propertiesAndVR}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-700/50 text-left transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.copyUrl}</span>
              </button>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-slate-700/50 text-left transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>{t.openOnYouTube}</span>
              </a>
              <div className="my-1 border-t border-[#24334a]" />
              <button
                onClick={() => {
                  onRemove(item.id);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-rose-400 hover:bg-rose-950/40 text-left transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.removeFromQueue}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
