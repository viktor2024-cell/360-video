import React from 'react';
import { FolderCheck, Trash2, ExternalLink, Play, Copy, Check, Clock } from 'lucide-react';
import { VideoItem } from '../types';
import { VideoThumbnail } from './Thumbnails';
import { Language, translations } from '../i18n';

interface HistoryViewProps {
  history: VideoItem[];
  onClearHistory: () => void;
  onRedownload: (item: VideoItem) => void;
  onOpenInspector: (item: VideoItem) => void;
  lang: Language;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
  onRedownload,
  onOpenInspector,
  lang,
}) => {
  const t = translations[lang];
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyPath = (item: VideoItem) => {
    if (item.filePath) {
      navigator.clipboard.writeText(item.filePath);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">{t.historyTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {t.historySubtitle(history.length)}
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearHistory}</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-[#141d2b] border border-[#202c40] rounded-xl p-12 text-center text-slate-400 my-8">
          <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-60" />
          <h3 className="text-sm font-medium text-slate-300">{t.historyEmptyTitle}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {t.historyEmptySubtitle}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {history.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="bg-[#141d2b] hover:bg-[#162132] border border-[#202c40] rounded-xl p-3 flex items-center gap-3.5 transition-all group"
            >
              <VideoThumbnail
                type={item.thumbnailType}
                duration={item.duration}
                className="w-24 h-14 rounded-lg"
                isVR={item.isVR}
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-medium text-slate-100 truncate group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h4>
                </div>
                <div className="text-[11.5px] text-slate-400 mt-0.5 truncate">
                  {item.channel}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1.5">
                  <span className="text-emerald-400 font-sans font-medium">{t.downloadedBadge}</span>
                  <span>·</span>
                  <span>{item.quality}</span>
                  <span>·</span>
                  <span>{item.format}</span>
                  <span>·</span>
                  <span>{item.size}</span>
                  {item.completedAt && (
                    <>
                      <span>·</span>
                      <span className="text-slate-500 font-sans">{item.completedAt}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onOpenInspector(item)}
                  className="px-2.5 py-1.5 rounded-lg bg-[#1f2b3e] hover:bg-[#27374f] text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                  title="Воспроизвести и посмотреть параметры"
                >
                  <Play className="w-3 h-3 fill-current text-blue-400" />
                  <span>{t.viewPreview}</span>
                </button>

                <button
                  onClick={() => handleCopyPath(item)}
                  className="p-1.5 rounded-lg bg-[#1f2b3e] hover:bg-[#27374f] text-slate-400 hover:text-slate-200 transition-colors"
                  title={t.copyFilePath}
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => onRedownload(item)}
                  className="p-1.5 rounded-lg bg-[#1f2b3e] hover:bg-[#27374f] text-slate-400 hover:text-blue-300 transition-colors"
                  title={t.redownloadToQueue}
                >
                  <FolderCheck className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
