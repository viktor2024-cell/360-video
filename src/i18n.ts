export type Language = 'ru' | 'en';

export const translations = {
  ru: {
    // Brand & Window
    appName: 'YouTube Downloader',
    statusReady: 'Готов к работе',
    statusDownloading: 'Загрузка...',
    close: 'Закрыть',
    minimize: 'Свернуть',
    maximize: 'Развернуть',
    versionInfo: 'v1.2.0 · yt-dlp + ffmpeg',

    // Top Controls
    downloadExeBtn: '💾 Скачать 1 .EXE файл',
    testVrBtn: 'Тест 360° VR ссылки',
    fullScreen: 'Во весь экран',
    windowMode: 'Окно на столе',

    // Sidebar
    tabDownload: 'Скачать',
    tabHistory: 'История',
    tabPlaylists: 'Плейлисты',
    tabSettings: 'Настройки',
    getExeFile: 'Получить 1 .EXE файл',
    builderCode: 'Код сборщика (.py)',

    // Main Download View
    urlPlaceholder: 'https://www.youtube.com/watch?v=...',
    downloadBtn: 'Скачать',
    downloadingSection: 'Скачивание',
    queueSection: 'Очередь',
    vrVideoBadge: '360° VR Видео',
    noActiveDownloads: 'В данный момент активных загрузок нет.',
    noActiveDownloadsSub: 'Вставьте ссылку выше или нажмите кнопку скачивания в очереди ниже.',
    queueEmpty: 'Очередь загрузки пуста.',
    videosCount: (count: number) => {
      if (count === 1) return '1 видео';
      if (count >= 2 && count <= 4) return `${count} видео`;
      return `${count} видео`;
    },
    downloadPaused: 'Пауза',
    of: 'из',
    pausedStatus: 'Остановлено',
    resumeDownload: 'Возобновить скачивание',
    pauseDownload: 'Приостановить',
    cancelDownload: 'Отменить скачивание',

    // Queue Item Menu
    downloadNow: 'Скачать сейчас',
    propertiesAndVR: 'Свойства & VR данные',
    copyUrl: 'Скопировать URL',
    openOnYouTube: 'Открыть на YouTube',
    removeFromQueue: 'Удалить из очереди',
    downloadThisVideo: 'Скачать это видео',
    options: 'Опции',

    // Right Panel
    outputHeader: 'Вывод',
    formatHeader: 'Формат',
    qualityHeader: 'Качество',
    additionalOptions: 'Дополнительные опции',
    downloadSubtitles: 'Скачать субтитры',
    saveToPlaylist: 'Сохранить в плейлист',
    downloadThumbnail: 'Загрузить обложку',
    vrSpatialInjection: '360° / VR Spatial вшивка',
    vrBadge: 'VR',
    browseFolder: 'Выбрать папку',
    clickToEditPath: 'Нажмите для редактирования пути',
    infoAndVrPreview: 'Информация о видео и VR просмотр',

    // History View
    historyTitle: 'История скачиваний',
    historySubtitle: (count: number) => `Завершённые загрузки и сохранённые файлы (${count})`,
    clearHistory: 'Очистить историю',
    historyEmptyTitle: 'История пуста',
    historyEmptySubtitle: 'Здесь будут отображаться загруженные видео и аудиофайлы после завершения скачивания.',
    downloadedBadge: '✓ Скачано',
    viewPreview: 'Просмотр',
    copyFilePath: 'Скопировать путь к файлу',
    redownloadToQueue: 'Скачать повторно в очередь',

    // Playlists View
    playlistsTitle: 'Загрузка плейлистов',
    playlistsSubtitle: 'Скачивание нескольких видео или полных списков воспроизведения с YouTube в один клик',
    playlistInputLabel: 'Ссылка на плейлист или канал:',
    loadListBtn: 'Загрузить список',
    samplePlaylistTitle: 'Коллекция лучших 360° VR и 4K Релакс видео',
    samplePlaylistAuthor: 'Автор: VR World · 3 видео · Общий вес ~ 4.15 ГБ',
    downloadSelected: (count: number) => `Скачать выбранные (${count})`,
    addedToQueue: 'Добавлено в очередь!',

    // Settings View
    settingsTitle: 'Настройки приложения',
    settingsSubtitle: 'Параметры движка yt-dlp, FFmpeg кодеков и VR 360° метаданных',
    vrSectionTitle: 'Обработка 360° и VR видео (Spatial)',
    vrAutoInjectTitle: 'Авто-внедрение сферических метаданных',
    vrAutoInjectDesc: 'Сохраняет метаданные Google Spatial Media V2 для корректного 360° воспроизведения в очках VR и VLC/Meta Quest',
    vrProjectionTitle: 'Тип проекции 360° по умолчанию',
    vrProjectionDesc: 'Формат развёртки сферического кадра при склеивании потоков ffmpeg',
    engineSectionTitle: 'Движок загрузки и FFmpeg',
    ffmpegPathTitle: 'Путь к бинарнику ffmpeg',
    ffmpegStatusEmbedded: 'Подключен (Static build)',
    maxConcurrentTitle: 'Максимум параллельных скачиваний',
    maxConcurrentDesc: 'Количество одновременных потоков',
    streamCount: (n: number) => `${n} поток${n === 1 ? '' : n <= 4 ? 'а' : 'ов'}${n === 3 ? ' (рекомендуется)' : ''}`,
    speedLimitTitle: 'Ограничение скорости',
    speedLimitDesc: '0 = максимальная скорость канала',
    mbs: 'МБ/с',
    compilerSectionTitle: 'Python & PyInstaller Standalone Сборщик',
    compilerSectionDesc: 'Посмотреть и скопировать готовый Python-скрипт с yt-dlp + ffmpeg для сборки единого .exe файла под Windows без сторонних зависимостей.',
    openExeGenerator: 'Открыть генератор .EXE',

    // Notifications
    toastUrlEmpty: '⚠️ Введите ссылку на видео',
    toastDownloadStarted: (title: string) => `🚀 Начинаем скачивание: ${title}`,
    toastAddedToQueue: (title: string) => `📥 Видео добавлено в очередь: ${title}`,
    toastDownloadPaused: '⏸ Скачивание приостановлено',
    toastDownloadResumed: '▶ Скачивание возобновлено',
    toastDownloadCancelled: (title: string) => `✕ Скачивание отменено: ${title}`,
    toastDownloadCompleted: (title: string) => `✅ Загрузка завершена: ${title}`,
    toastRemovedFromQueue: 'Удалено из очереди',
    toastHistoryCleared: 'История очищена',
    toastPlaylistAdded: (count: number) => `✅ Добавлено ${count} видео из плейлиста в очередь!`,
  },
  en: {
    // Brand & Window
    appName: 'YouTube Downloader',
    statusReady: 'Ready',
    statusDownloading: 'Downloading...',
    close: 'Close',
    minimize: 'Minimize',
    maximize: 'Maximize',
    versionInfo: 'v1.2.0 · yt-dlp + ffmpeg',

    // Top Controls
    downloadExeBtn: '💾 Download 1 .EXE File',
    testVrBtn: 'Test 360° VR Link',
    fullScreen: 'Full Screen',
    windowMode: 'Window on Desktop',

    // Sidebar
    tabDownload: 'Download',
    tabHistory: 'History',
    tabPlaylists: 'Playlists',
    tabSettings: 'Settings',
    getExeFile: 'Get 1 .EXE File',
    builderCode: 'Builder Code (.py)',

    // Main Download View
    urlPlaceholder: 'https://www.youtube.com/watch?v=...',
    downloadBtn: 'Download',
    downloadingSection: 'Downloading',
    queueSection: 'Queue',
    vrVideoBadge: '360° VR Video',
    noActiveDownloads: 'No active downloads at the moment.',
    noActiveDownloadsSub: 'Paste a link above or click download on any queue item below.',
    queueEmpty: 'Download queue is empty.',
    videosCount: (count: number) => `${count} video${count === 1 ? '' : 's'}`,
    downloadPaused: 'Paused',
    of: 'of',
    pausedStatus: 'Stopped',
    resumeDownload: 'Resume download',
    pauseDownload: 'Pause download',
    cancelDownload: 'Cancel download',

    // Queue Item Menu
    downloadNow: 'Download now',
    propertiesAndVR: 'Properties & VR Data',
    copyUrl: 'Copy URL',
    openOnYouTube: 'Open on YouTube',
    removeFromQueue: 'Remove from queue',
    downloadThisVideo: 'Download this video',
    options: 'Options',

    // Right Panel
    outputHeader: 'Output',
    formatHeader: 'Format',
    qualityHeader: 'Quality',
    additionalOptions: 'Additional Options',
    downloadSubtitles: 'Download subtitles',
    saveToPlaylist: 'Save to playlist',
    downloadThumbnail: 'Download thumbnail',
    vrSpatialInjection: '360° / VR Spatial injection',
    vrBadge: 'VR',
    browseFolder: 'Browse folder',
    clickToEditPath: 'Click to edit output folder',
    infoAndVrPreview: 'Video info & VR preview',

    // History View
    historyTitle: 'Download History',
    historySubtitle: (count: number) => `Completed downloads & saved files (${count})`,
    clearHistory: 'Clear history',
    historyEmptyTitle: 'History is empty',
    historyEmptySubtitle: 'Downloaded videos and audio files will appear here once download finishes.',
    downloadedBadge: '✓ Downloaded',
    viewPreview: 'Preview',
    copyFilePath: 'Copy file path',
    redownloadToQueue: 'Redownload to queue',

    // Playlists View
    playlistsTitle: 'Playlist Downloader',
    playlistsSubtitle: 'Download multiple videos or entire YouTube playlists with a single click',
    playlistInputLabel: 'Playlist or channel URL:',
    loadListBtn: 'Load playlist',
    samplePlaylistTitle: 'Best 360° VR & 4K Relaxation Video Collection',
    samplePlaylistAuthor: 'By: VR World · 3 videos · Total ~ 4.15 GB',
    downloadSelected: (count: number) => `Download selected (${count})`,
    addedToQueue: 'Added to queue!',

    // Settings View
    settingsTitle: 'Application Settings',
    settingsSubtitle: 'yt-dlp engine options, FFmpeg codecs, and VR 360° metadata',
    vrSectionTitle: '360° & VR Video Processing (Spatial)',
    vrAutoInjectTitle: 'Auto-inject spherical metadata',
    vrAutoInjectDesc: 'Injects Google Spatial Media V2 metadata for seamless 360° playback in VR headsets, VLC, and Meta Quest',
    vrProjectionTitle: 'Default 360° projection type',
    vrProjectionDesc: 'Equirectangular spherical frame unwrapping during ffmpeg muxing',
    engineSectionTitle: 'Download Engine & FFmpeg',
    ffmpegPathTitle: 'FFmpeg binary path',
    ffmpegStatusEmbedded: 'Connected (Static build)',
    maxConcurrentTitle: 'Max concurrent downloads',
    maxConcurrentDesc: 'Number of parallel download threads',
    streamCount: (n: number) => `${n} thread${n === 1 ? '' : 's'}${n === 3 ? ' (recommended)' : ''}`,
    speedLimitTitle: 'Speed limit',
    speedLimitDesc: '0 = unlimited line speed',
    mbs: 'MB/s',
    compilerSectionTitle: 'Python & PyInstaller Standalone Builder',
    compilerSectionDesc: 'Inspect and copy ready-to-build Python script with yt-dlp + ffmpeg to compile a single .exe for Windows with zero extra dependencies.',
    openExeGenerator: 'Open .EXE Generator',

    // Notifications
    toastUrlEmpty: '⚠️ Please enter a video URL',
    toastDownloadStarted: (title: string) => `🚀 Started downloading: ${title}`,
    toastAddedToQueue: (title: string) => `📥 Added to queue: ${title}`,
    toastDownloadPaused: '⏸ Download paused',
    toastDownloadResumed: '▶ Download resumed',
    toastDownloadCancelled: (title: string) => `✕ Download cancelled: ${title}`,
    toastDownloadCompleted: (title: string) => `✅ Download completed: ${title}`,
    toastRemovedFromQueue: 'Removed from queue',
    toastHistoryCleared: 'History cleared',
    toastPlaylistAdded: (count: number) => `✅ Added ${count} playlist videos to queue!`,
  }
};
