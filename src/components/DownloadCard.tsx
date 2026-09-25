import React from 'react';
import { Pause, Play, X, CheckCircle2, RotateCw } from 'lucide-react';
import { VideoItem } from '../types';
import { VideoThumbnail } from './Thumbnails';
import { Language, translations } from '../i18n';

interface DownloadCardProps {
  item: VideoItem | null;
  onPauseResume: () => void;
  onCancel: () => void;
  onSelectForDetails: (item: VideoItem) => void;
  lang: Language;
}

export const DownloadCard: React.FC<DownloadCardProps> = ({
  item,
  onPauseResume,
  onCancel,
  onSelectForDetails,
  lang,
}) => {
  const t = translations[lang];

  if (!item) {
    return (
      <div className="mb-6">
        <h2 className="text-[15px] font-semibold text-slate-100 mb-3 tracking-tight">
          {t.downloadingSection}
        </h2>
        <div className="bg-[#151d2b] border border-[#222e42] border-dashed rounded-xl p-6 text-center text-slate-400">
          <p className="text-xs">{t.noActiveDownloads}</p>
          <p className="text-[11px] text-slate-500 mt-1">
            {t.noActiveDownloadsSub}
          </p>
        </div>
      </div>
    );
  }

  const isPaused = item.status === 'paused';
  const progressVal = item.progress ?? 58;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[15px] font-semibold text-slate-100 tracking-tight">
          {t.downloadingSection}
        </h2>
        {item.isVR && (
          <span className="text-[11px] text-blue-400 bg-blue-950/60 border border-blue-800/40 rounded px-2 py-0.5 font-medium">
            {t.vrVideoBadge}
          </span>
        )}
      </div>

      <div 
        onClick={() => onSelectForDetails(item)}
        className="bg-[#161f2f] hover:bg-[#182335] border border-[#233147] rounded-xl p-3 flex items-center gap-3.5 transition-all cursor-pointer group shadow-sm"
      >
        {/* Left Thumbnail */}
        <VideoThumbnail
          type={item.thumbnailType}
          duration={item.duration}
          className="w-28 h-16 rounded-lg"
          isVR={item.isVR}
        />

        {/* Center Details & Progress */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[13.5px] font-medium text-slate-100 truncate group-hover:text-blue-300 transition-colors">
              {item.title}
            </h3>
          </div>
          <div className="text-xs text-slate-400 mt-0.5 truncate">
            {item.channel}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#202c40] rounded-full h-1.5 overflow-hidden mt-2.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isPaused ? 'bg-amber-500' : 'bg-blue-500 shadow-xs shadow-blue-500/50'
              }`}
              style={{ width: `${progressVal}%` }}
            />
          </div>

          {/* Progress Meta */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono tabular-nums mt-1.5">
            <span className={isPaused ? 'text-amber-400 font-medium' : 'text-slate-300'}>
              {isPaused ? t.downloadPaused : `${progressVal}%`}
            </span>
            <span>·</span>
            <span>
              {Math.round((item.sizeBytes * progressVal) / (100 * 1024 * 1024))} {lang === 'ru' ? 'МБ' : 'MB'} {t.of} {item.size}
            </span>
            <span>·</span>
            <span>{isPaused ? t.pausedStatus : item.eta || (lang === 'ru' ? '~ 2 мин' : '~ 2 min')}</span>
            {!isPaused && (
              <>
                <span>·</span>
                <span className="text-slate-500 text-[11px]">{item.downloadSpeed || (lang === 'ru' ? '8.4 МБ/с' : '8.4 MB/s')}</span>
              </>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 pl-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onPauseResume}
            className="w-8 h-8 rounded-lg bg-[#202c40] hover:bg-[#283852] text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
            title={isPaused ? t.resumeDownload : t.pauseDownload}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current ml-0.5" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          </button>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-[#202c40] hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 flex items-center justify-center transition-colors shadow-xs"
            title={t.cancelDownload}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
