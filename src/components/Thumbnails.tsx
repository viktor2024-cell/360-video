import React from 'react';

interface ThumbnailProps {
  type: 'nature' | 'guitar' | 'italy' | 'planet' | 'space' | 'chill' | 'vr_rollercoaster' | 'custom';
  duration?: string;
  className?: string;
  isVR?: boolean;
}

export const VideoThumbnail: React.FC<ThumbnailProps> = ({
  type,
  duration,
  className = 'w-28 h-16',
  isVR = false,
}) => {
  return (
    <div className={`relative shrink-0 rounded-lg overflow-hidden bg-slate-900 shadow-inner group ${className}`}>
      {/* Visual content based on type */}
      {type === 'nature' && (
        <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="45%" stopColor="#60a5fa" />
              <stop offset="60%" stopColor="#93c5fd" />
            </linearGradient>
            <linearGradient id="lakeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#0e7490" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
            <linearGradient id="mountGrad1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="snowGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
          </defs>
          {/* Sky */}
          <rect width="200" height="70" fill="url(#skyGrad)" />
          {/* Distant Mountains */}
          <polygon points="10,65 55,20 95,65" fill="#475569" />
          <polygon points="45,30 55,20 65,30" fill="url(#snowGrad)" />
          <polygon points="70,65 125,12 180,65" fill="url(#mountGrad1)" />
          {/* Snow peak */}
          <polygon points="112,25 125,12 138,25 130,22 125,32 120,24" fill="url(#snowGrad)" />
          <polygon points="150,65 185,32 210,65" fill="#334155" />
          {/* Pine Trees Shoreline */}
          <path d="M0,65 Q50,62 100,64 T200,65 L200,72 L0,72 Z" fill="#064e3b" />
          <polygon points="15,65 20,52 25,65" fill="#065f46" />
          <polygon points="35,65 42,50 49,65" fill="#047857" />
          <polygon points="75,65 82,48 89,65" fill="#065f46" />
          <polygon points="140,65 147,51 154,65" fill="#047857" />
          <polygon points="165,65 172,49 179,65" fill="#065f46" />
          {/* Turquoise Alpine Lake */}
          <rect y="70" width="200" height="50" fill="url(#lakeGrad)" />
          {/* Reflection ripples */}
          <ellipse cx="125" cy="85" rx="35" ry="4" fill="#0284c7" opacity="0.4" />
          <ellipse cx="60" cy="95" rx="45" ry="3" fill="#0f766e" opacity="0.6" />
          <line x1="20" y1="80" x2="180" y2="80" stroke="#bae6fd" strokeWidth="0.5" opacity="0.4" />
          <line x1="40" y1="92" x2="160" y2="92" stroke="#bae6fd" strokeWidth="0.5" opacity="0.3" />
        </svg>
      )}

      {type === 'guitar' && (
        <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="warmRoom" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="50%" stopColor="#78350f" />
              <stop offset="100%" stopColor="#292524" />
            </linearGradient>
            <linearGradient id="guitarWood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          {/* Room backdrop */}
          <rect width="200" height="120" fill="url(#warmRoom)" />
          {/* Window light */}
          <polygon points="0,0 80,0 30,120 0,120" fill="#fef3c7" opacity="0.15" />
          {/* Musician silhouette */}
          <circle cx="115" cy="38" r="18" fill="#1c1917" />
          <path d="M100,50 Q115,48 130,50 Q145,65 140,110 L85,110 Z" fill="#1c1917" />
          {/* Acoustic Guitar Body */}
          <ellipse cx="80" cy="85" rx="32" ry="24" fill="url(#guitarWood)" transform="rotate(-15, 80, 85)" />
          <ellipse cx="62" cy="72" rx="20" ry="16" fill="url(#guitarWood)" transform="rotate(-15, 62, 72)" />
          {/* Sound hole */}
          <circle cx="75" cy="80" r="8" fill="#18181b" />
          {/* Fretboard */}
          <rect x="15" y="42" width="60" height="7" fill="#78350f" transform="rotate(-25, 45, 45)" />
          <line x1="10" y1="65" x2="80" y2="82" stroke="#fef08a" strokeWidth="1" opacity="0.7" />
        </svg>
      )}

      {type === 'italy' && (
        <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="italySky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#fed7aa" />
            </linearGradient>
            <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#082f49" />
            </linearGradient>
          </defs>
          <rect width="200" height="60" fill="url(#italySky)" />
          {/* Sun */}
          <circle cx="160" cy="35" r="12" fill="#fff" opacity="0.6" />
          {/* Mediterranean Sea */}
          <rect y="55" width="200" height="65" fill="url(#seaGrad)" />
          {/* Rocky promontory / peninsula */}
          <path d="M0,60 Q70,55 120,70 L140,120 L0,120 Z" fill="#713f12" />
          {/* Terracotta colorful houses */}
          <rect x="40" y="50" width="18" height="22" fill="#ea580c" />
          <rect x="58" y="42" width="16" height="30" fill="#f59e0b" />
          <rect x="74" y="48" width="20" height="26" fill="#fbbf24" />
          <rect x="94" y="55" width="15" height="20" fill="#f97316" />
          <rect x="25" y="60" width="16" height="18" fill="#e11d48" />
          {/* Church tower */}
          <rect x="68" y="28" width="10" height="28" fill="#d97706" />
          <polygon points="68,28 73,18 78,28" fill="#b45309" />
          {/* Sea foam shoreline */}
          <path d="M120,70 Q130,85 145,120" stroke="#bae6fd" strokeWidth="2.5" fill="none" opacity="0.8" />
        </svg>
      )}

      {type === 'planet' && (
        <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="desertSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="60%" stopColor="#fef08a" />
            </linearGradient>
            <linearGradient id="duneGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="50%" stopColor="#b45309" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>
          <rect width="200" height="65" fill="url(#desertSky)" />
          {/* Mountain ridge */}
          <polygon points="0,65 50,35 110,65" fill="#92400e" />
          <polygon points="90,65 140,40 200,65" fill="#78350f" />
          {/* Dunes landscape */}
          <path d="M0,65 Q80,50 140,80 L200,75 L200,120 L0,120 Z" fill="url(#duneGrad)" />
          <path d="M60,85 Q110,75 200,95 L200,120 L60,120 Z" fill="#9a3412" />
          {/* Explorer with backpack standing on ridge */}
          <circle cx="95" cy="62" r="3" fill="#18181b" />
          <rect x="93" y="65" width="4" height="12" fill="#18181b" />
          <rect x="90" y="65" width="3" height="7" fill="#b91c1c" />
          <line x1="94" y1="77" x2="92" y2="86" stroke="#18181b" strokeWidth="2" />
          <line x1="96" y1="77" x2="98" y2="86" stroke="#18181b" strokeWidth="2" />
        </svg>
      )}

      {type === 'space' && (
        <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
          <defs>
            <radialGradient id="galaxyCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#a855f7" />
              <stop offset="60%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#090d16" />
            </radialGradient>
          </defs>
          <rect width="200" height="120" fill="#05070d" />
          {/* Distant stars */}
          <circle cx="20" cy="20" r="0.8" fill="#fff" opacity="0.8" />
          <circle cx="50" cy="80" r="0.5" fill="#fff" opacity="0.7" />
          <circle cx="170" cy="30" r="1" fill="#fff" opacity="0.9" />
          <circle cx="180" cy="95" r="0.6" fill="#fff" opacity="0.8" />
          <circle cx="130" cy="15" r="0.7" fill="#93c5fd" opacity="0.8" />
          <circle cx="35" cy="105" r="0.9" fill="#c084fc" opacity="0.8" />
          {/* Galaxy Nebula Glow */}
          <ellipse cx="100" cy="60" rx="75" ry="38" fill="url(#galaxyCore)" transform="rotate(-22, 100, 60)" />
          {/* Spiral Arms */}
          <path d="M100,60 Q130,45 160,55 Q180,65 170,85" stroke="#e9d5ff" strokeWidth="3" fill="none" opacity="0.5" filter="blur(1px)" />
          <path d="M100,60 Q70,75 40,65 Q20,55 30,35" stroke="#93c5fd" strokeWidth="3" fill="none" opacity="0.5" filter="blur(1px)" />
          {/* Bright core */}
          <circle cx="100" cy="60" r="5" fill="#ffffff" filter="blur(0.5px)" />
        </svg>
      )}

      {type === 'chill' && (
        <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="lofiSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="45%" stopColor="#f43f5e" />
              <stop offset="70%" stopColor="#881337" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
          </defs>
          <rect width="200" height="85" fill="url(#lofiSky)" />
          {/* Sunset Sun */}
          <circle cx="100" cy="65" r="22" fill="#fde047" opacity="0.9" />
          {/* City skyline silhouettes */}
          <rect x="10" y="55" width="16" height="65" fill="#0f172a" />
          <rect x="26" y="45" width="20" height="75" fill="#1e293b" />
          <rect x="46" y="60" width="18" height="60" fill="#0f172a" />
          <rect x="64" y="38" width="24" height="82" fill="#1e293b" />
          <line x1="76" y1="25" x2="76" y2="38" stroke="#f43f5e" strokeWidth="1.5" />
          <rect x="88" y="50" width="22" height="70" fill="#0f172a" />
          <rect x="110" y="42" width="26" height="78" fill="#1e293b" />
          <rect x="136" y="58" width="20" height="62" fill="#0f172a" />
          <rect x="156" y="48" width="22" height="72" fill="#1e293b" />
          <rect x="178" y="62" width="20" height="58" fill="#0f172a" />
          {/* City glowing windows */}
          <circle cx="34" cy="55" r="1" fill="#fef08a" />
          <circle cx="72" cy="50" r="1" fill="#fef08a" />
          <circle cx="120" cy="55" r="1" fill="#fef08a" />
          <circle cx="165" cy="60" r="1" fill="#fef08a" />
        </svg>
      )}

      {type === 'vr_rollercoaster' && (
        <svg viewBox="0 0 200 120" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="vrSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="70%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <rect width="200" height="120" fill="url(#vrSky)" />
          {/* Roller coaster rails */}
          <path d="M-10,100 Q60,-10 120,60 T210,30" stroke="#ef4444" strokeWidth="6" fill="none" />
          <path d="M-10,104 Q60,-6 120,64 T210,34" stroke="#ffffff" strokeWidth="2" fill="none" />
          {/* 360 degree grid overlay */}
          <circle cx="100" cy="60" r="45" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.6" />
          <line x1="55" y1="60" x2="145" y2="60" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="15" x2="100" y2="105" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
        </svg>
      )}

      {type === 'custom' && (
        <div className="w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center">
          <svg className="w-7 h-7 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}

      {/* 360 / VR Indicator badge top-left if applicable */}
      {isVR && (
        <div className="absolute top-1.5 left-1.5 bg-blue-600/90 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
          <span>360° VR</span>
        </div>
      )}

      {/* Duration Pill bottom-right */}
      {duration && (
        <div className="absolute bottom-1 right-1 bg-black/85 backdrop-blur-xs text-slate-100 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded">
          {duration}
        </div>
      )}
    </div>
  );
};
