# YouTube & 360° VR Downloader v1.2

**English** | [Русский](README.ru.md)

The other day I needed a short clip from a YouTube video. I tried a number of free and paid downloaders, but none of them could download just part of a video: every one made me grab the whole thing and cut it afterwards. So I decided to write my own.

Building your own tools with AI has become quite a trend lately — someone even recreated the Adobe suite, with Photoshop and the other apps mimicking the original look and keyboard shortcuts.

So here is my contribution to the hype: a video downloader that lets you pick an exact time range.

## Features

- downloads YouTube videos as MP4, MKV, WebM, or audio-only MP3;
- quality up to 8K, 360° / VR videos supported;
- **download only a fragment**: set the start and the duration (`1:30`, `90`, `0:01:30`) — only that segment is fetched from YouTube, not the whole video;
- playlists: load a list, tick the videos you want, and they download one after another;
- the download card shows the real title, channel, thumbnail, size, speed and progress;
- MP4 audio is saved as AAC so the file plays in the standard Windows player;
- a single EXE with no installation, yt-dlp and ffmpeg built in.

## Getting started

| File | What it does |
|---|---|
| `2_BUILD_SINGLE_EXE_v1.2.bat` | Builds one file: `release\YouTube_VR_Downloader_v1.2.exe`. Requires Python ([python.org](https://www.python.org/), tick *Add to PATH*). If there is no `ffmpeg.exe` next to it, the script tries to download it. |
| `3_RUN_WITH_PYTHON_v1.2.bat` | Runs without building, via Python (pywebview + yt-dlp). Merging and fragments need `ffmpeg.exe` next to the script or in `PATH`. |
| `1_RUN_INTERFACE_v1.2.bat` | Opens the interface without Python (demo mode: no real downloading). |
| `4_QUICK_DOWNLOAD_NO_PYTHON.bat` | Console download via `yt-dlp.exe`, no interface. |

The `.cmd` files are identical copies of the `.bat` files.

`ffmpeg.exe` is not included in the repository (it exceeds GitHub's 100 MB file limit).

The interface is in Russian by default; switch to English with the **RU / EN** toggle in the top-left corner.

## Contents

- `desktop_app.py` — the app: pywebview window, downloading via yt-dlp, fragment cutting via ffmpeg, playlist loading;
- `dist/` — the built web interface (React + Tailwind);
- `server.ps1` — local server for opening the interface without Python;
- `requirements.txt` — Python dependencies.

## Support

If the app is useful to you, you can support it on [Boosty](https://boosty.to/youtube_vr_downloader/posts/30ce76d3-3900-44d9-8233-456b448dd572).
