"""
YouTube & VR Downloader — Desktop App (pywebview + yt-dlp + embedded ffmpeg)
Упаковывается в ЕДИНЫЙ автономный .EXE файл с помощью PyInstaller.

Сборка:
    pyinstaller --onefile --noconsole --name "YouTube_VR_Downloader" ^
        --add-data "dist;dist" ^
        --add-binary "ffmpeg.exe;." ^
        desktop_app.py
"""

import os
import sys
import json
import threading
import webview
import yt_dlp
import tkinter as tk
from tkinter import filedialog


def get_base_path():
    """Получает путь к распакованным ресурсам PyInstaller (--onefile)."""
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def get_ffmpeg_path():
    """Ищет ffmpeg.exe внутри собранного exe или рядом со скриптом."""
    base = get_base_path()
    local_ffmpeg = os.path.join(base, 'ffmpeg.exe')
    if os.path.exists(local_ffmpeg):
        return local_ffmpeg
    parent_ffmpeg = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ffmpeg.exe')
    if os.path.exists(parent_ffmpeg):
        return parent_ffmpeg
    return 'ffmpeg'


class Api:
    def __init__(self, window=None):
        self.window = window
        self.is_downloading = False
        self.should_cancel = False

    def select_folder(self):
        """Открывает диалог выбора папки в Windows."""
        root = tk.Tk()
        root.withdraw()
        root.attributes('-topmost', True)
        folder = filedialog.askdirectory(title="Выберите папку для сохранения видео")
        root.destroy()
        return folder if folder else None

    def start_download(self, options_json):
        """Запускает скачивание через yt-dlp в отдельном потоке."""
        opts = json.loads(options_json)
        url = opts.get('url', '').strip()
        folder = opts.get('outputFolder') or os.path.join(os.path.expanduser('~'), 'Downloads')
        format_type = opts.get('format', 'MP4')
        quality = opts.get('quality', '1080p')
        enable_vr = opts.get('enableVRMetadata', True)

        os.makedirs(folder, exist_ok=True)
        self.should_cancel = False
        self.is_downloading = True

        threading.Thread(target=self._run_ytdl, args=(url, folder, format_type, quality, enable_vr), daemon=True).start()
        return {"status": "started"}

    def cancel_download(self):
        self.should_cancel = True
        return {"status": "cancelled"}

    def _run_ytdl(self, url, folder, format_type, quality, enable_vr):
        ffmpeg_bin = get_ffmpeg_path()

        # Настройка формата yt-dlp
        if format_type == 'MP3':
            ytdl_format = 'bestaudio/best'
            postprocessors = [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '320',
            }]
        else:
            if quality.startswith('4320p'):
                ytdl_format = 'bestvideo[height<=4320]+bestaudio/best'
            elif quality.startswith('2160p') or quality == '4K':
                ytdl_format = 'bestvideo[height<=2160]+bestaudio/best'
            elif quality.startswith('1440p'):
                ytdl_format = 'bestvideo[height<=1440]+bestaudio/best'
            elif quality.startswith('1080p'):
                ytdl_format = 'bestvideo[height<=1080]+bestaudio/best'
            elif quality.startswith('720p'):
                ytdl_format = 'bestvideo[height<=720]+bestaudio/best'
            else:
                ytdl_format = 'bestvideo+bestaudio/best'

            merge_fmt = format_type.lower() if format_type.lower() in ['mp4', 'mkv', 'webm'] else 'mp4'
            postprocessors = []

        def progress_hook(d):
            if self.should_cancel:
                raise Exception("Загрузка отменена пользователем")

            if d['status'] == 'downloading':
                percent_str = d.get('_percent_str', '0%').replace('%', '').strip()
                try:
                    percent = float(percent_str)
                except ValueError:
                    percent = 0.0

                speed = d.get('_speed_str', '')
                eta = d.get('_eta_str', '')
                downloaded = d.get('downloaded_bytes', 0)
                total = d.get('total_bytes') or d.get('total_bytes_estimate', 0)

                payload = {
                    'status': 'downloading',
                    'percent': percent,
                    'speed': speed,
                    'eta': eta,
                    'downloaded': downloaded,
                    'total': total,
                }
                if self.window:
                    self.window.evaluate_js(f"window.onNativeProgress && window.onNativeProgress({json.dumps(payload)})")

            elif d['status'] == 'finished':
                if self.window:
                    self.window.evaluate_js("window.onNativeProgress && window.onNativeProgress({'status': 'processing'})")

        ydl_opts = {
            'format': ytdl_format,
            'outtmpl': os.path.join(folder, '%(title)s.%(ext)s'),
            'progress_hooks': [progress_hook],
            'ffmpeg_location': ffmpeg_bin,
            'quiet': True,
            'no_warnings': True,
        }

        if format_type != 'MP3':
            ydl_opts['merge_output_format'] = merge_fmt
        if postprocessors:
            ydl_opts['postprocessors'] = postprocessors

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                title = info.get('title', 'video')
                file_path = ydl.prepare_filename(info)
                
                # Уведомляем интерфейс об успехе
                if self.window:
                    success_payload = {
                        'status': 'completed',
                        'title': title,
                        'path': file_path
                    }
                    self.window.evaluate_js(f"window.onNativeProgress && window.onNativeProgress({json.dumps(success_payload)})")
        except Exception as e:
            if self.window:
                err_payload = {'status': 'error', 'message': str(e)}
                self.window.evaluate_js(f"window.onNativeProgress && window.onNativeProgress({json.dumps(err_payload)})")
        finally:
            self.is_downloading = False


def main():
    base_dir = get_base_path()
    html_path = os.path.join(base_dir, 'dist', 'index.html')

    # Если dist/index.html не найден (при локальной отладке)
    if not os.path.exists(html_path):
        html_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist', 'index.html')

    api = Api()
    window = webview.create_window(
        title="YouTube Downloader — 360° VR & 4K",
        url=html_path if os.path.exists(html_path) else 'https://www.youtube.com',
        js_api=api,
        width=1160,
        height=780,
        min_size=(900, 600),
        background_color='#0b0f17',
    )
    api.window = window
    webview.start(debug=False)


if __name__ == '__main__':
    main()
