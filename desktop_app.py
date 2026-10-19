"""
YouTube & VR Downloader v1.2 — Desktop App (pywebview + yt-dlp + embedded ffmpeg)
Упаковывается в ЕДИНЫЙ автономный .EXE файл с помощью PyInstaller.

Сборка (один exe, ffmpeg.exe вшит внутрь):
    pyinstaller --onefile --noconsole --noupx --distpath release ^
        --name "YouTube_VR_Downloader_v1.2" ^
        --add-data "dist/index.html;dist" --add-data "dist/assets;dist/assets" ^
        --add-binary "ffmpeg.exe;." --exclude-module tkinter desktop_app.py
"""

import os
import sys
import json
import threading
import socket
import http.server
import socketserver
import webview
# yt_dlp импортируется лениво (внутри методов), чтобы окно появлялось быстрее


def get_base_path():
    """Получает путь к распакованным ресурсам PyInstaller (--onefile)."""
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))


def start_local_server(dist_dir):
    """Запускает встроенный легковесный HTTP-сервер Python на 127.0.0.1 для dist/."""
    try:
        class QuietHandler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=dist_dir, **kwargs)

            def log_message(self, format, *args):
                pass  # Без лишнего вывода в консоль

        # Находим свободный порт в операционной системе
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.bind(('127.0.0.1', 0))
            port = s.getsockname()[1]

        # Запускаем в фоновом daemon-потоке
        server = socketserver.TCPServer(('127.0.0.1', port), QuietHandler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        return port
    except Exception as e:
        print(f"Внимание: локальный сервер не запущен ({e}), используется файл")
        return None


def get_ffmpeg_path():
    """Ищет ffmpeg.exe рядом с exe, внутри сборки или рядом со скриптом."""
    if getattr(sys, 'frozen', False):
        exe_ffmpeg = os.path.join(os.path.dirname(sys.executable), 'ffmpeg.exe')
        if os.path.exists(exe_ffmpeg):
            return exe_ffmpeg
    base = get_base_path()
    local_ffmpeg = os.path.join(base, 'ffmpeg.exe')
    if os.path.exists(local_ffmpeg):
        return local_ffmpeg
    parent_ffmpeg = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ffmpeg.exe')
    if os.path.exists(parent_ffmpeg):
        return parent_ffmpeg
    return 'ffmpeg'


def fmt_duration(sec):
    sec = int(sec or 0)
    if sec >= 3600:
        return str(sec // 3600) + ':' + str(sec % 3600 // 60).zfill(2) + ':' + str(sec % 60).zfill(2)
    return str(sec // 60).zfill(2) + ':' + str(sec % 60).zfill(2)


def build_info_payload(info, clip_start=0.0, clip_duration=0.0):
    """Метаданные ролика для карточки загрузки: название, канал, длительность, обложка, примерный размер."""
    duration = float(info.get('duration') or 0)
    formats = info.get('requested_formats') or [info]
    size = sum(int(f.get('filesize') or f.get('filesize_approx') or 0) for f in formats)
    shown = duration
    if (clip_start or clip_duration) and duration:
        end = min(duration, clip_start + clip_duration) if clip_duration else duration
        shown = max(0.0, end - clip_start)
        size = int(size * shown / duration)
    height = max([int(f.get('height') or 0) for f in formats] or [0])
    width = max([int(f.get('width') or 0) for f in formats] or [0])
    # широкие кадры (1920x866 и т.п.) называем по ширине, как YouTube: 1080p, 4K...
    for w_min, label in ((7680, 4320), (3840, 2160), (2560, 1440), (1920, 1080), (1280, 720)):
        if width >= w_min:
            height = max(height, label)
            break
    title = info.get('title') or ''
    return {
        'status': 'info',
        'title': title,
        'channel': info.get('uploader') or info.get('channel') or '',
        'duration': fmt_duration(shown) if shown else '',
        'durationSeconds': int(shown),
        'thumbnail': info.get('thumbnail') or '',
        'total': size,
        'quality': (str(height) + 'p') if height else '',
        'isVR': ('360' in title) or ('VR' in title.upper().split()),
    }


def parse_time(value):
    """'90', '1:30' или '1:02:03' -> секунды (0 если пусто/некорректно)."""
    try:
        parts = [float(p) for p in str(value or '').strip().replace(',', '.').split(':') if p != '']
    except ValueError:
        return 0.0
    sec = 0.0
    for p in parts[-3:]:
        sec = sec * 60 + p
    return max(sec, 0.0)


class Api:
    def __init__(self):
        self.is_downloading = False
        self.should_cancel = False

    def select_folder(self):
        """Открывает диалог выбора папки в Windows."""
        dialog = getattr(getattr(webview, 'FileDialog', None), 'FOLDER', None) or webview.FOLDER_DIALOG
        result = main_window.create_file_dialog(dialog) if main_window else None
        return result[0] if result else None

    def get_playlist(self, url):
        """Список видео плейлиста без скачивания (для вкладки «Плейлисты»)."""
        try:
            import yt_dlp
            opts = {'quiet': True, 'no_warnings': True, 'extract_flat': 'in_playlist', 'skip_download': True}
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url.strip(), download=False)
            entries = []
            for e in (info.get('entries') or []):
                if not e:
                    continue
                vid = e.get('id') or ''
                dur = int(e.get('duration') or 0)
                entries.append({
                    'id': vid,
                    'url': e.get('url') if str(e.get('url') or '').startswith('http') else 'https://www.youtube.com/watch?v=' + vid,
                    'title': e.get('title') or vid,
                    'channel': e.get('channel') or e.get('uploader') or info.get('uploader') or '',
                    'durationSeconds': dur,
                    'duration': (str(dur // 3600) + ':' + str(dur % 3600 // 60).zfill(2) + ':' + str(dur % 60).zfill(2)) if dur >= 3600 else (str(dur // 60).zfill(2) + ':' + str(dur % 60).zfill(2)),
                })
            return {'title': info.get('title') or '', 'channel': info.get('uploader') or info.get('channel') or '', 'entries': entries}
        except Exception as e:
            return {'error': str(e)}

    def start_download(self, options_json):
        """Запускает скачивание через yt-dlp в отдельном потоке."""
        opts = json.loads(options_json)
        url = opts.get('url', '').strip()
        folder = opts.get('outputFolder') or os.path.join(os.path.expanduser('~'), 'Downloads')
        format_type = opts.get('format', 'MP4')
        quality = opts.get('quality', '1080p')
        enable_vr = opts.get('enableVRMetadata', True)
        clip_start = opts.get('clipStart', '')
        clip_duration = opts.get('clipDuration', '')

        os.makedirs(folder, exist_ok=True)
        self.should_cancel = False
        self.is_downloading = True

        threading.Thread(target=self._run_ytdl, args=(url, folder, format_type, quality, enable_vr, clip_start, clip_duration), daemon=True).start()
        return {"status": "started"}

    def cancel_download(self):
        self.should_cancel = True
        return {"status": "cancelled"}

    def _run_ytdl(self, url, folder, format_type, quality, enable_vr, clip_start='', clip_duration=''):
        global main_window
        import yt_dlp
        from yt_dlp.utils import download_range_func
        ffmpeg_bin = get_ffmpeg_path()

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
            if merge_fmt == 'mp4':
                # Opus внутри MP4 не играет стандартный плеер Windows -> берём AAC (m4a), если он есть
                ytdl_format = ytdl_format.split('+')[0] + '+bestaudio[ext=m4a]/' + ytdl_format
            postprocessors = []

        streams = 1 if format_type == 'MP3' else 2
        state = {'files': [], 'totals': {}, 'best': 0.0, 'finished': 0}
        clip_mode = bool(parse_time(clip_start) or parse_time(clip_duration))

        def push(payload):
            if main_window:
                main_window.evaluate_js("window.onNativeProgress && window.onNativeProgress(" + json.dumps(payload) + ")")

        def fmt_eta(sec):
            if sec is None:
                return ''
            sec = int(sec)
            return str(sec // 60) + ':' + str(sec % 60).zfill(2)

        def progress_hook(d):
            if self.should_cancel:
                raise Exception("Загрузка отменена пользователем")

            info = d.get('info_dict') or {}
            if d['status'] == 'downloading':
                name = d.get('filename') or ''
                if name not in state['files']:
                    state['files'].append(name)
                idx = min(state['files'].index(name), streams - 1)
                downloaded = d.get('downloaded_bytes') or 0
                total = d.get('total_bytes') or d.get('total_bytes_estimate') or 0
                if total:
                    state['totals'][name] = total
                percent = (downloaded / total * 100.0) if total else 0.0
                overall = (idx * 100.0 + percent) / streams
                state['best'] = max(state['best'], min(overall, 99.0))

                seen = list(state['totals'].values())
                est_total = sum(seen) if len(seen) >= streams else int(sum(seen) * 1.15)
                speed = d.get('speed')
                push({
                    'status': 'downloading',
                    'percent': round(state['best'], 1),
                    'speed': (str(round(speed / 1048576, 1)) + ' МБ/с') if speed else '',
                    'eta': fmt_eta(d.get('eta')),
                    'total': est_total,
                    'title': info.get('title'),
                    'channel': info.get('uploader') or info.get('channel'),
                })

            elif d['status'] == 'finished':
                state['finished'] += 1
                if state['finished'] >= (1 if clip_mode else streams):
                    push({'status': 'processing', 'title': info.get('title')})

        ydl_opts = {
            'format': ytdl_format,
            'outtmpl': os.path.join(folder, '%(title)s.%(ext)s'),
            'progress_hooks': [progress_hook],
            'ffmpeg_location': ffmpeg_bin,
            'quiet': True,
            'no_warnings': True,
        }

        # Скачивание фрагмента: начало + длительность (пусто = весь ролик / до конца)
        start_sec = parse_time(clip_start)
        dur_sec = parse_time(clip_duration)
        if start_sec or dur_sec:
            end_sec = start_sec + dur_sec if dur_sec else float('inf')
            ydl_opts['download_ranges'] = download_range_func(None, [(start_sec, end_sec)])
            ydl_opts['outtmpl'] = os.path.join(folder, '%(title)s [clip].%(ext)s')

        if format_type != 'MP3':
            ydl_opts['merge_output_format'] = merge_fmt
        if postprocessors:
            ydl_opts['postprocessors'] = postprocessors

        if clip_mode:
            push({'status': 'downloading', 'percent': 0, 'indeterminate': True})

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                # 1) сначала только метаданные -> карточка в интерфейсе показывает реальные данные
                info = ydl.extract_info(url, download=False)
                push(build_info_payload(info, parse_time(clip_start), parse_time(clip_duration)))
                # 2) затем само скачивание по уже полученным данным
                info = ydl.process_ie_result(info, download=True)
                title = info.get('title', 'video')
                file_path = ydl.prepare_filename(info)
                
                if main_window:
                    success_payload = {
                        'status': 'completed',
                        'title': title,
                        'path': file_path
                    }
                    main_window.evaluate_js(f"window.onNativeProgress && window.onNativeProgress({json.dumps(success_payload)})")
        except Exception as e:
            if main_window:
                err_payload = {'status': 'error', 'message': str(e)}
                main_window.evaluate_js(f"window.onNativeProgress && window.onNativeProgress({json.dumps(err_payload)})")
        finally:
            self.is_downloading = False


def main():
    global main_window
    base_dir = get_base_path()
    dist_dir = os.path.join(base_dir, 'dist')

    if not os.path.exists(dist_dir):
        dist_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

    html_path = os.path.join(dist_dir, 'index.html')

    # 1. Запуск встроенного легковесного HTTP-сервера для 100% совместимости с WebView2
    port = start_local_server(dist_dir) if os.path.exists(dist_dir) else None

    if port:
        url = f'http://127.0.0.1:{port}/index.html?desktop=1'
    elif os.path.exists(html_path):
        url = f'file://{os.path.abspath(html_path)}?desktop=1'
    else:
        # Информационное сообщение при отсутствии распакованной папки dist
        error_html_path = os.path.join(base_dir, 'error.html')
        with open(error_html_path, 'w', encoding='utf-8') as f:
            f.write('''<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"><title>Ошибка</title><style>body{background:#0b0f17;color:#f1f5f9;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}.card{background:#162132;padding:32px;border-radius:16px;border:1px solid #23354d;max-width:500px}h2{color:#f43f5e}p{color:#94a3b8}code{background:#0f172a;padding:4px 8px;border-radius:6px;color:#38bdf8}</style></head><body><div class="card"><h2>Папка dist/ не найдена!</h2><p>Пожалуйста, <b>распакуйте ZIP-архив полностью</b> (правый клик &rarr; <i>«Извлечь всё...»</i>), чтобы папка <code>dist</code> находилась рядом с программой.</p></div></body></html>''')
        url = f'file://{os.path.abspath(error_html_path)}'

    api = Api()
    main_window = webview.create_window(
        title="YouTube Downloader v1.2 — 360° VR & 4K",
        url=url,
        js_api=api,
        width=1180,
        height=800,
        min_size=(960, 640),
        background_color='#0b0f17',
    )
    webview.start(debug=False)


if __name__ == '__main__':
    main()
