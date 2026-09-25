import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  Download, 
  Maximize2, 
  Minimize2, 
  Sparkles,
  Glasses,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { VideoItem, AppSettings, VideoFormat } from './types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_DOWNLOADING, 
  INITIAL_QUEUE, 
  INITIAL_HISTORY 
} from './mockData';
import { Sidebar } from './components/Sidebar';
import { RightPanel } from './components/RightPanel';
import { DownloadCard } from './components/DownloadCard';
import { QueueItemRow } from './components/QueueItem';
import { HistoryView } from './components/HistoryView';
import { PlaylistsView } from './components/PlaylistsView';
import { SettingsView } from './components/SettingsView';
import { VRPlayerModal } from './components/VRPlayerModal';
import { PythonScriptModal } from './components/PythonScriptModal';
import { ExeDownloadModal } from './components/ExeDownloadModal';
import { Language, translations } from './i18n';

export default function App() {
  const [lang, setLang] = useState<Language>('ru');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'download' | 'history' | 'playlists' | 'settings'>('download');
  const [settings, setSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  
  // URL Input
  const [urlInput, setUrlInput] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  
  // Active download and queue
  const [activeDownload, setActiveDownload] = useState<VideoItem | null>(INITIAL_DOWNLOADING);
  const [queue, setQueue] = useState<VideoItem[]>(INITIAL_QUEUE);
  const [history, setHistory] = useState<VideoItem[]>(INITIAL_HISTORY);
  
  // Selected item for bottom card
  const [selectedItem, setSelectedItem] = useState<VideoItem | null>(INITIAL_DOWNLOADING);
  
  // Modals
  const [inspectedItem, setInspectedItem] = useState<VideoItem | null>(null);
  const [isPythonModalOpen, setIsPythonModalOpen] = useState(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);
  
  // View mode: 'desktop' (floating on misty mountain wallpaper like in screenshot) vs 'full'
  const [isDesktopMode, setIsDesktopMode] = useState(true);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Simulated live download progression
  useEffect(() => {
    if (!activeDownload || activeDownload.status !== 'downloading') return;

    if ((activeDownload.progress ?? 0) >= 100) {
      // Finished downloading! Move to history with unique ID
      const completedItem: VideoItem = {
        ...activeDownload,
        id: `hist-${Date.now()}-${activeDownload.id}`,
        status: 'completed',
        progress: 100,
        completedAt: lang === 'ru' ? 'Только что' : 'Just now',
        filePath: `${settings.outputFolder}/${activeDownload.title.replace(/[\\/:*?"<>|]/g, '')}.${activeDownload.format.toLowerCase()}`,
      };
      setHistory((h) => [completedItem, ...h.filter((x) => x.id !== completedItem.id)]);
      showToast(t.toastDownloadCompleted(activeDownload.title));

      // Pick next item from queue if available
      if (queue.length > 0) {
        const next = queue[0];
        setQueue((q) => q.filter((x) => x.id !== next.id));
        setActiveDownload({
          ...next,
          status: 'downloading',
          progress: 0,
          downloadSpeed: lang === 'ru' ? '7.8 МБ/с' : '7.8 MB/s',
          eta: lang === 'ru' ? '~ 1 мин' : '~ 1 min',
        });
      } else {
        setActiveDownload(null);
      }
      return;
    }

    const interval = setInterval(() => {
      setActiveDownload((prev) => {
        if (!prev || prev.status !== 'downloading') return prev;

        const currentProg = prev.progress ?? 58;
        const nextProgress = Math.min(100, currentProg + 1);
        const remainingSeconds = Math.max(5, Math.round(((100 - nextProgress) / 100) * (prev.durationSeconds || 300)));
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const etaText = minutes > 0 
          ? (lang === 'ru' ? `~ ${minutes} мин` : `~ ${minutes} min`) 
          : (lang === 'ru' ? `~ ${seconds} сек` : `~ ${seconds} sec`);
        const speeds = ['8.2 МБ/с', '8.4 МБ/с', '8.6 МБ/с', '7.9 МБ/с', '9.1 МБ/с'];
        const randomSpeed = speeds[Math.floor(Math.random() * speeds.length)];

        return {
          ...prev,
          progress: nextProgress,
          eta: etaText,
          downloadSpeed: randomSpeed,
        };
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [activeDownload?.status, activeDownload?.progress, queue, settings.outputFolder, lang, t]);

  // Handle URL Download action
  const handleStartDownloadFromInput = () => {
    if (!urlInput.trim()) {
      showToast(t.toastUrlEmpty);
      return;
    }

    // Detect if VR
    const isVRDetected = urlInput.toLowerCase().includes('vr') || urlInput.toLowerCase().includes('360') || settings.enableVRMetadata;

    const newItem: VideoItem = {
      id: `custom-${Date.now()}`,
      url: urlInput.trim(),
      title: isVRDetected 
        ? (lang === 'ru' ? '360° VR Видео (YouTube 4K Spatial)' : '360° VR Spatial Experience (YouTube 4K)') 
        : (lang === 'ru' ? 'YouTube Видео высокого качества' : 'YouTube High Quality Video Stream'),
      channel: 'YouTube Creator',
      duration: '11:45',
      durationSeconds: 705,
      quality: settings.quality.replace('audio_best', '320 kbps'),
      format: settings.format,
      size: settings.quality.includes('4K') ? (lang === 'ru' ? '1.8 ГБ' : '1.8 GB') : (lang === 'ru' ? '450 МБ' : '450 MB'),
      sizeBytes: settings.quality.includes('4K') ? 1.8 * 1024 * 1024 * 1024 : 450 * 1024 * 1024,
      status: activeDownload ? 'queued' : 'downloading',
      progress: 0,
      downloadSpeed: lang === 'ru' ? '8.5 МБ/с' : '8.5 MB/s',
      eta: lang === 'ru' ? '~ 2 мин' : '~ 2 min',
      thumbnailType: isVRDetected ? 'vr_rollercoaster' : 'nature',
      isVR: isVRDetected,
    };

    if (!activeDownload) {
      setActiveDownload(newItem);
      setSelectedItem(newItem);
      showToast(t.toastDownloadStarted(newItem.title));
    } else {
      setQueue((prev) => [newItem, ...prev]);
      setSelectedItem(newItem);
      showToast(t.toastAddedToQueue(newItem.title));
    }

    setUrlInput('');
  };

  const handlePauseResume = () => {
    if (!activeDownload) return;
    if (activeDownload.status === 'downloading') {
      setActiveDownload({ ...activeDownload, status: 'paused' });
      showToast(t.toastDownloadPaused);
    } else {
      setActiveDownload({ ...activeDownload, status: 'downloading' });
      showToast(t.toastDownloadResumed);
    }
  };

  const handleCancelDownload = () => {
    if (!activeDownload) return;
    showToast(t.toastDownloadCancelled(activeDownload.title));
    setActiveDownload(null);
  };

  const handleStartQueueItem = (item: VideoItem) => {
    // If there's an active download, move current active back to queue (safely without duplicates)
    if (activeDownload) {
      setQueue((prev) => [
        { ...activeDownload, status: 'queued' },
        ...prev.filter((q) => q.id !== item.id && q.id !== activeDownload.id),
      ]);
    } else {
      setQueue((prev) => prev.filter((q) => q.id !== item.id));
    }

    const newActive: VideoItem = {
      ...item,
      status: 'downloading',
      progress: item.progress ?? 0,
      downloadSpeed: lang === 'ru' ? '8.4 МБ/с' : '8.4 MB/s',
      eta: lang === 'ru' ? '~ 2 мин' : '~ 2 min',
    };

    setActiveDownload(newActive);
    setSelectedItem(newActive);
    showToast(t.toastDownloadStarted(item.title));
  };

  const handleRemoveQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((i) => i.id !== id));
    showToast(t.toastRemovedFromQueue);
  };

  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  };

  const handleAddAllPlaylists = (items: VideoItem[]) => {
    const newItems = items.map((i) => ({
      ...i,
      id: `pl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}-${i.id}`,
    }));
    setQueue((prev) => [...newItems, ...prev]);
    showToast(t.toastPlaylistAdded(items.length));
    setActiveTab('download');
  };

  const handleSampleClick = (sampleUrl: string) => {
    setUrlInput(sampleUrl);
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-x-hidden font-sans">
      {/* Background Wallpaper Container (matches screenshot's misty mountains or full mode) */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
          isDesktopMode ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Scenic mountain lake backdrop illustration */}
        <div className="absolute inset-0 bg-[#070b12]" />
        <svg 
          viewBox="0 0 1920 1080" 
          preserveAspectRatio="xMidYMid slice" 
          className="w-full h-full object-cover filter blur-[2px] scale-105"
        >
          <defs>
            <linearGradient id="bgSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="40%" stopColor="#334155" />
              <stop offset="70%" stopColor="#475569" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>
            <linearGradient id="bgWater" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>
          <rect width="1920" height="700" fill="url(#bgSky)" />
          {/* Layered mountain silhouettes with mist */}
          <polygon points="0,680 400,280 850,700" fill="#1e293b" opacity="0.6" />
          <polygon points="600,680 1100,210 1600,680" fill="#0f172a" opacity="0.8" />
          <polygon points="1200,680 1650,310 1920,550 1920,680" fill="#1e293b" opacity="0.7" />
          {/* Forest pines along shore */}
          <polygon points="0,680 100,580 200,680" fill="#064e3b" opacity="0.7" />
          <polygon points="180,680 260,570 340,680" fill="#065f46" opacity="0.6" />
          <polygon points="1500,680 1600,590 1700,680" fill="#064e3b" opacity="0.7" />
          {/* Water reflection */}
          <rect y="680" width="1920" height="400" fill="url(#bgWater)" />
          <ellipse cx="960" cy="850" rx="600" ry="120" fill="#0ea5e9" opacity="0.08" />
        </svg>
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[3px]" />
      </div>

      {/* Floating Top Controls for Desktop preview / Quick helper */}
      <div className="fixed top-3 right-4 z-40 flex items-center gap-2">
        {/* Language Switcher RU / EN */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-lg p-0.5 backdrop-blur-md flex items-center shadow-lg">
          <button
            onClick={() => setLang('ru')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === 'ru' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RU
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
              lang === 'en' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            EN
          </button>
        </div>

        <button
          onClick={() => setIsExeModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3.5 py-1.5 rounded-lg border border-blue-400/50 backdrop-blur-md flex items-center gap-1.5 transition-all shadow-lg font-medium"
          title={t.downloadExeBtn}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>{t.downloadExeBtn}</span>
        </button>

        <button
          onClick={() => handleSampleClick('https://www.youtube.com/watch?v=8lsB-P8nGSM')}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 backdrop-blur-md flex items-center gap-1.5 transition-colors shadow-lg"
          title={t.testVrBtn}
        >
          <Glasses className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">{t.testVrBtn}</span>
        </button>

        <button
          onClick={() => setIsDesktopMode(!isDesktopMode)}
          className="bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 backdrop-blur-md flex items-center gap-1.5 transition-colors shadow-lg"
          title={isDesktopMode ? t.fullScreen : t.windowMode}
        >
          {isDesktopMode ? (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.fullScreen}</span>
            </>
          ) : (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.windowMode}</span>
            </>
          )}
        </button>
      </div>

      {/* Main Application Window Frame (Exact match of uploaded design) */}
      <main 
        className={`relative z-10 bg-[#111723] text-slate-100 flex overflow-hidden shadow-2xl transition-all duration-300 ${
          isDesktopMode
            ? 'w-[96%] max-w-[1240px] h-[820px] rounded-2xl border border-[#232f44] ring-1 ring-black/60 shadow-black/80'
            : 'w-full h-screen rounded-none border-none'
        }`}
      >
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenPythonModal={() => setIsPythonModalOpen(true)}
          onOpenExeModal={() => setIsExeModalOpen(true)}
          isDownloading={activeDownload?.status === 'downloading'}
          lang={lang}
        />

        {/* Central Content Canvas */}
        <section className="flex-1 bg-[#131a27] flex flex-col overflow-hidden">
          {activeTab === 'download' && (
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Top Search / URL Input Bar */}
              <div className="mb-6">
                <div className="bg-[#172132] border border-[#24334b] hover:border-[#2e405d] focus-within:border-blue-500 rounded-xl p-1.5 flex items-center gap-2.5 transition-colors shadow-xs">
                  <div className="pl-3 text-slate-400">
                    <Link2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleStartDownloadFromInput();
                    }}
                    placeholder={t.urlPlaceholder}
                    className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 font-mono outline-none py-1.5"
                  />
                  <button
                    onClick={handleStartDownloadFromInput}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-xs font-medium text-white rounded-lg flex items-center gap-1.5 transition-all shadow-sm shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadBtn}</span>
                  </button>
                </div>
              </div>

              {/* Section 1: Скачивание (Active download) */}
              <DownloadCard
                item={activeDownload}
                onPauseResume={handlePauseResume}
                onCancel={handleCancelDownload}
                onSelectForDetails={(item) => setSelectedItem(item)}
                lang={lang}
              />

              {/* Section 2: Очередь (Queue list) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-[15px] font-semibold text-slate-100 tracking-tight">
                    {t.queueSection}
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">
                    {t.videosCount(queue.length)}
                  </span>
                </div>

                {queue.length === 0 ? (
                  <div className="bg-[#151d2b] border border-[#202c40] rounded-xl p-8 text-center text-slate-400">
                    <p className="text-xs">{t.queueEmpty}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queue.map((item, index) => (
                      <QueueItemRow
                        key={`${item.id}-${index}`}
                        item={item}
                        isSelected={selectedItem?.id === item.id}
                        onSelect={(item) => setSelectedItem(item)}
                        onStartDownload={handleStartQueueItem}
                        onRemove={handleRemoveQueueItem}
                        onOpenInspector={(item) => setInspectedItem(item)}
                        lang={lang}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <HistoryView
              history={history}
              onClearHistory={() => {
                setHistory([]);
                showToast(t.toastHistoryCleared);
              }}
              onRedownload={(item) => {
                const reItem: VideoItem = {
                  ...item,
                  id: `redl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                  status: 'queued',
                  progress: 0,
                };
                setQueue((q) => [reItem, ...q]);
                showToast(t.toastAddedToQueue(item.title));
                setActiveTab('download');
              }}
              onOpenInspector={(item) => setInspectedItem(item)}
              lang={lang}
            />
          )}

          {activeTab === 'playlists' && (
            <PlaylistsView onAddAllToQueue={handleAddAllPlaylists} lang={lang} />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onOpenPythonModal={() => setIsPythonModalOpen(true)}
              lang={lang}
              onToggleLang={setLang}
            />
          )}
        </section>

        {/* Right Inspector & Settings Panel */}
        <RightPanel
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          selectedItem={selectedItem}
          onOpenInspector={(item) => setInspectedItem(item)}
          lang={lang}
        />
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#162132] border border-[#283852] text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 360° VR & Video Details Inspector Modal */}
      {inspectedItem && (
        <VRPlayerModal
          item={inspectedItem}
          onClose={() => setInspectedItem(null)}
          onDownload={(item) => {
            handleStartQueueItem(item);
            setInspectedItem(null);
          }}
          lang={lang}
        />
      )}

      {/* Standalone Python & PyInstaller Script Modal */}
      {isPythonModalOpen && (
        <PythonScriptModal onClose={() => setIsPythonModalOpen(false)} lang={lang} />
      )}

      {/* Standalone 1 .EXE Package Downloader Modal */}
      {isExeModalOpen && (
        <ExeDownloadModal onClose={() => setIsExeModalOpen(false)} lang={lang} />
      )}
    </div>
  );
}
