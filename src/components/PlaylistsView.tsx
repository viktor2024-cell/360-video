import React, { useState } from 'react';
import { ListMusic, Download, Check, Plus, FolderDown } from 'lucide-react';
import { VideoItem } from '../types';
import { VideoThumbnail } from './Thumbnails';
import { Language, translations } from '../i18n';

interface PlaylistsViewProps {
  onAddAllToQueue: (items: VideoItem[]) => void;
  lang: Language;
}

export const PlaylistsView: React.FC<PlaylistsViewProps> = ({ onAddAllToQueue, lang }) => {
  const t = translations[lang];
  const [playlistUrl, setPlaylistUrl] = useState('https://www.youtube.com/playlist?list=PL4o29bINVT4EG_y-k5jGoOu3-Am8Nvi10');
  
  const samplePlaylistItems: VideoItem[] = [
    {
      id: 'pl-1',
      url: 'https://www.youtube.com/watch?v=1',
      title: 'Top 10 Virtual Reality 360° Experiences 2026',
      channel: 'VR Master',
      duration: '14:20',
      durationSeconds: 860,
      quality: '4K',
      format: 'MP4',
      size: lang === 'ru' ? '1.9 ГБ' : '1.9 GB',
      sizeBytes: 1.9 * 1024 * 1024 * 1024,
      status: 'queued',
      thumbnailType: 'vr_rollercoaster',
      isVR: true,
    },
    {
      id: 'pl-2',
      url: 'https://www.youtube.com/watch?v=2',
      title: 'Deep Ocean 360 Diving - Great Barrier Reef VR',
      channel: 'Ocean Discovery',
      duration: '09:45',
      durationSeconds: 585,
      quality: '4K',
      format: 'MP4',
      size: lang === 'ru' ? '1.4 ГБ' : '1.4 GB',
      sizeBytes: 1.4 * 1024 * 1024 * 1024,
      status: 'queued',
      thumbnailType: 'nature',
      isVR: true,
    },
    {
      id: 'pl-3',
      url: 'https://www.youtube.com/watch?v=3',
      title: 'Cinematic Drone Flights Over Dolomites Italy',
      channel: 'Alpine Films',
      duration: '11:15',
      durationSeconds: 675,
      quality: '1080p',
      format: 'MP4',
      size: lang === 'ru' ? '850 МБ' : '850 MB',
      sizeBytes: 850 * 1024 * 1024,
      status: 'queued',
      thumbnailType: 'italy',
      isVR: false,
    },
  ];

  const [selectedIds, setSelectedIds] = useState<string[]>(samplePlaylistItems.map(i => i.id));
  const [isAdded, setIsAdded] = useState(false);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDownloadSelected = () => {
    const toAdd = samplePlaylistItems.filter(i => selectedIds.includes(i.id));
    onAddAllToQueue(toAdd);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2500);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-white tracking-tight">{t.playlistsTitle}</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {t.playlistsSubtitle}
        </p>
      </div>

      {/* Playlist URL Input Bar */}
      <div className="bg-[#151e2d] border border-[#233147] rounded-xl p-3 mb-6">
        <label className="text-xs font-medium text-slate-300 mb-1.5 block">
          {t.playlistInputLabel}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
            className="flex-1 bg-[#101724] border border-[#212f45] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 font-mono"
            placeholder="https://www.youtube.com/playlist?list=..."
          />
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-[#202c40] hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg transition-colors"
          >
            {t.loadListBtn}
          </button>
        </div>
      </div>

      {/* Playlist Preview Card */}
      <div className="bg-[#141d2b] border border-[#202c40] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between border-b border-[#202c40] pb-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <ListMusic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {t.samplePlaylistTitle}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {t.samplePlaylistAuthor}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadSelected}
            disabled={selectedIds.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-medium text-white rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>{t.addedToQueue}</span>
              </>
            ) : (
              <>
                <FolderDown className="w-3.5 h-3.5" />
                <span>{t.downloadSelected(selectedIds.length)}</span>
              </>
            )}
          </button>
        </div>

        {/* Video list in playlist */}
        <div className="space-y-2">
          {samplePlaylistItems.map((item, index) => {
            const checked = selectedIds.includes(item.id);
            return (
              <div
                key={`${item.id}-${index}`}
                onClick={() => toggleSelect(item.id)}
                className={`p-2.5 rounded-lg flex items-center gap-3 transition-colors cursor-pointer border ${
                  checked ? 'bg-[#182335] border-blue-500/40' : 'bg-[#101724] border-transparent hover:bg-slate-800/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSelect(item.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-slate-700 bg-slate-900 text-blue-600"
                />

                <VideoThumbnail
                  type={item.thumbnailType}
                  duration={item.duration}
                  className="w-20 h-12 rounded-md"
                  isVR={item.isVR}
                />

                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-200 truncate">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {item.channel} · {item.quality} · {item.size}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
