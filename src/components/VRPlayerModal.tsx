import React, { useRef, useEffect, useState } from 'react';
import { X, Play, Pause, RotateCcw, Glasses, Volume2, ShieldCheck, Film } from 'lucide-react';
import { VideoItem } from '../types';
import { Language } from '../i18n';

interface VRPlayerModalProps {
  item: VideoItem;
  onClose: () => void;
  onDownload: (item: VideoItem) => void;
  lang?: Language;
}

export const VRPlayerModal: React.FC<VRPlayerModalProps> = ({
  item,
  onClose,
  onDownload,
  lang = 'ru',
}) => {
  const isEn = lang === 'en';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [rotation, setRotation] = useState({ yaw: 0, pitch: 0 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 360 Panorama renderer on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;

      // Clear
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, w, h);

      // Draw spherical sky grid
      const yaw = rotation.yaw;
      const pitch = rotation.pitch;

      // Horizon line
      const horizonY = h / 2 + pitch * 1.5;

      // Gradient sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
      skyGrad.addColorStop(0, '#1e3a8a');
      skyGrad.addColorStop(0.7, '#0284c7');
      skyGrad.addColorStop(1, '#bae6fd');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, horizonY);

      // Ground
      const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
      groundGrad.addColorStop(0, '#064e3b');
      groundGrad.addColorStop(0.5, '#047857');
      groundGrad.addColorStop(1, '#065f46');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // Grid meridians (360 longitude lines)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;

      for (let deg = -180; deg <= 180; deg += 30) {
        const xOffset = ((deg + yaw) % 360) / 360 * w * 2 + w / 2;
        ctx.beginPath();
        ctx.moveTo(xOffset, 0);
        ctx.lineTo(xOffset, h);
        ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '10px monospace';
        ctx.fillText(`${deg}°`, xOffset + 4, horizonY - 6);
      }

      // Parallels (latitude lines)
      for (let lat = -60; lat <= 60; lat += 30) {
        const yPos = horizonY - (lat / 90) * (h / 2.5);
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(w, yPos);
        ctx.stroke();
      }

      // Compass Reticle center
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w / 2 - 28, h / 2);
      ctx.lineTo(w / 2 - 20, h / 2);
      ctx.moveTo(w / 2 + 20, h / 2);
      ctx.lineTo(w / 2 + 28, h / 2);
      ctx.moveTo(w / 2, h / 2 - 28);
      ctx.lineTo(w / 2, h / 2 - 20);
      ctx.moveTo(w / 2, h / 2 + 20);
      ctx.lineTo(w / 2, h / 2 + 28);
      ctx.stroke();

      // Text status overlay
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(
        item.isVR ? '360° Сферический режим (Потяните мышью для вращения)' : 'Интерактивный предпросмотр медиа',
        14,
        24
      );

      ctx.font = '11px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`Yaw: ${Math.round(yaw)}°  Pitch: ${Math.round(pitch)}°  FOV: 90°`, 14, h - 14);

      if (isPlaying) {
        setRotation((prev) => ({
          ...prev,
          yaw: (prev.yaw + 0.15) % 360,
        }));
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [isPlaying, rotation.pitch, item.isVR]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    setRotation((prev) => ({
      yaw: prev.yaw - dx * 0.4,
      pitch: Math.max(-50, Math.min(50, prev.pitch + dy * 0.4)),
    }));
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121926] border border-[#24334a] rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1f2b3e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Glasses className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {item.title}
              </h3>
              <p className="text-[11px] text-slate-400">
                {item.channel} · {item.quality} · {item.format} · {item.size}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 360 Canvas Viewer */}
        <div className="relative bg-slate-950 aspect-video select-none cursor-grab active:cursor-grabbing">
          <canvas
            ref={canvasRef}
            width={720}
            height={405}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full block"
          />

          {/* Controls Overlay */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/60 backdrop-blur-xs p-1.5 rounded-lg border border-white/10">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
              title={isPlaying ? 'Пауза автовращения' : 'Автопанорама'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => setRotation({ yaw: 0, pitch: 0 })}
              className="p-1.5 rounded hover:bg-white/10 text-white transition-colors"
              title="Сбросить угол обзора"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Technical Specs & VR Metadata */}
        <div className="p-5 grid grid-cols-2 gap-4 text-xs bg-[#101622]">
          <div className="space-y-2 border-r border-[#1f2b3e] pr-4">
            <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              {isEn ? 'Video Stream Parameters' : 'Параметры видеопотока'}
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{isEn ? 'Resolution:' : 'Разрешение:'}</span>
              <span className="font-mono text-slate-200">
                {item.quality === '4K' ? '3840x2160 (UHD)' : '1920x1080 (FHD)'}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{isEn ? 'Codec:' : 'Кодек:'}</span>
              <span className="font-mono text-slate-200">VP9 (profile 0) / AV01</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{isEn ? 'Framerate:' : 'Частота кадров:'}</span>
              <span className="font-mono text-slate-200">60.00 fps</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{isEn ? 'Audio track:' : 'Аудиодорожка:'}</span>
              <span className="font-mono text-slate-200">Opus 160 kbps (48 kHz)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              {isEn ? 'VR & Spatial Media' : 'VR & Spatial Media'}
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{isEn ? 'Projection:' : 'Проекция:'}</span>
              <span className="font-mono text-blue-400 font-medium">
                {item.isVR ? 'Equirectangular 360°' : (isEn ? 'Flat (2D)' : 'Плоское (Flat 2D)')}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Google Spatial Media V2:</span>
              <span className="font-mono text-emerald-400">{isEn ? 'Injected' : 'Внедрено (Injected)'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Spatial Audio:</span>
              <span className="font-mono text-slate-200">Ambisonics B-format (4 ch)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">{isEn ? 'Compatibility:' : 'Совместимость:'}</span>
              <span className="text-slate-200">Meta Quest, Apple Vision, VLC</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1f2b3e] flex items-center justify-between bg-[#121926]">
          <span className="text-xs text-slate-400">
            {isEn ? 'Ready to download in original high quality' : 'Готово для скачивания в лучшем оригинальном качестве'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isEn ? 'Close' : 'Закрыть'}
            </button>
            <button
              onClick={() => {
                onDownload(item);
                onClose();
              }}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors shadow-sm"
            >
              {isEn ? `Download File (${item.size})` : `Скачать файл (${item.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
