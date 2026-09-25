export type VideoFormat = 'MP4' | 'MKV' | 'WebM' | 'MP3';

export type VideoQuality = 
  | '4320p'
  | '2160p'
  | '1440p'
  | '1080p'
  | '720p'
  | '480p'
  | '360p'
  | 'audio_best';

export interface VideoItem {
  id: string;
  url: string;
  title: string;
  channel: string;
  duration: string;
  durationSeconds: number;
  quality: string;
  format: VideoFormat;
  size: string;
  sizeBytes: number;
  downloadedBytes?: number;
  isVR?: boolean;
  vrType?: '360° Equirectangular' | '180° SBS 3D' | 'Fisheye VR';
  thumbnailType: 'nature' | 'guitar' | 'italy' | 'planet' | 'space' | 'chill' | 'vr_rollercoaster' | 'custom';
  customThumbnailUrl?: string;
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error';
  progress?: number; // 0 - 100
  downloadSpeed?: string; // e.g. "8.4 МБ/с"
  eta?: string; // e.g. "~ 2 мин"
  completedAt?: string;
  filePath?: string;
}

export interface AppSettings {
  outputFolder: string;
  format: VideoFormat;
  quality: string;
  downloadSubtitles: boolean;
  saveToPlaylist: boolean;
  downloadThumbnail: boolean;
  enableVRMetadata: boolean;
  vrProjection: 'Equirectangular 360' | 'VR180 3D' | 'Fisheye';
  maxConcurrentDownloads: number;
  speedLimitMBs: number;
  ffmpegPath: string;
  useProxy: boolean;
  proxyUrl: string;
}
