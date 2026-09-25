import React, { useState } from 'react';
import { X, Copy, Check, Terminal, ExternalLink, Download } from 'lucide-react';
import { Language } from '../i18n';

interface PythonScriptModalProps {
  onClose: () => void;
  lang?: Language;
}

export const PythonScriptModal: React.FC<PythonScriptModalProps> = ({ onClose, lang = 'ru' }) => {
  const isEn = lang === 'en';
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState(false);

  const pythonCode = `"""
VR_downloader — простое окно для скачивания 360°/VR видео с YouTube.
Всё (yt-dlp как библиотека + ffmpeg) упаковывается в ОДИН .exe файл.

=== Шаг 1. Установить зависимости для сборки ===
    pip install yt-dlp pyinstaller

=== Шаг 2. Положить ffmpeg.exe рядом со скриптом ===
Скачать сборку ffmpeg для Windows (essentials, static build), например:
    https://www.gyan.dev/ffmpeg/builds/  (ffmpeg-release-essentials.zip)
Внутри архива, в папке bin\\, лежит ffmpeg.exe — скопируйте его
в ту же папку, где лежит VR_downloader.py.

=== Шаг 3. Собрать один exe со встроенным ffmpeg ===
    pyinstaller --onefile --noconsole --name VR_downloader ^
        --add-binary "ffmpeg.exe;." ^
        VR_downloader.py

Готовый файл появится в папке dist\\VR_downloader.exe — это ЕДИНСТВЕННЫЙ
файл, который нужно скачивать/запускать, никаких доп. программ не требуется.
"""

import os
import sys
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext

import yt_dlp


def resource_base_path():
    """Папка, где лежат встроенные бинарники (ffmpeg.exe), и в .py, и в собранном .exe."""
    if getattr(sys, "frozen", False):
        return sys._MEIPASS  # временная папка распаковки PyInstaller --onefile
    return os.path.dirname(os.path.abspath(__file__))


def add_context_menu(entry_widget):
    """Добавляет ПКМ-меню Копировать/Вставить/Вырезать — чтобы работало
    даже если Ctrl+V не срабатывает из-за раскладки клавиатуры."""
    menu = tk.Menu(entry_widget, tearoff=0)
    menu.add_command(label="Вырезать", command=lambda: entry_widget.event_generate("<<Cut>>"))
    menu.add_command(label="Копировать", command=lambda: entry_widget.event_generate("<<Copy>>"))
    menu.add_command(label="Вставить", command=lambda: entry_widget.event_generate("<<Paste>>"))

    def show_menu(event):
        menu.tk_popup(event.x_root, event.y_root)

    entry_widget.bind("<Button-3>", show_menu)

    entry_widget.bind("<Control-KeyPress>", lambda e: _handle_ctrl_key(e, entry_widget))


def _handle_ctrl_key(event, widget):
    keycode = event.keycode
    if keycode == 86:
        widget.event_generate("<<Paste>>")
        return "break"
    elif keycode == 67:
        widget.event_generate("<<Copy>>")
        return "break"
    elif keycode == 88:
        widget.event_generate("<<Cut>>")
        return "break"


class VRDownloaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("VR Downloader — 360° видео с YouTube")
        self.root.geometry("640x420")
        self.root.resizable(False, False)

        # Ссылка
        tk.Label(root, text="Ссылка на видео (YouTube):").pack(anchor="w", padx=10, pady=(10, 0))
        self.url_entry = tk.Entry(root, width=80)
        self.url_entry.pack(padx=10, pady=5, fill="x")
        add_context_menu(self.url_entry)

        # Папка для скачивания
        folder_frame = tk.Frame(root)
        folder_frame.pack(fill="x", padx=10, pady=5)
        tk.Label(folder_frame, text="Папка для сохранения:").pack(side="left")
        self.folder_var = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Downloads"))
        folder_entry = tk.Entry(folder_frame, textvariable=self.folder_var, width=50)
        folder_entry.pack(side="left", padx=5)
        add_context_menu(folder_entry)
        tk.Button(folder_frame, text="Обзор...", command=self.choose_folder).pack(side="left")

        # Качество
        quality_frame = tk.Frame(root)
        quality_frame.pack(fill="x", padx=10, pady=5)
        tk.Label(quality_frame, text="Качество:").pack(side="left")
        self.quality_var = tk.StringVar(value="Максимальное (bestvideo+bestaudio)")
        options = [
            "Максимальное (bestvideo+bestaudio)",
            "1080p",
            "2160p (4K)",
            "Только аудио",
        ]
        tk.OptionMenu(quality_frame, self.quality_var, *options).pack(side="left", padx=5)

        # Кнопка скачать
        self.download_btn = tk.Button(
            root, text="Скачать", command=self.start_download,
            bg="#2e7d32", fg="white", height=2
        )
        self.download_btn.pack(fill="x", padx=10, pady=10)

        # Лог
        tk.Label(root, text="Лог:").pack(anchor="w", padx=10)
        self.log = scrolledtext.ScrolledText(root, height=12, state="disabled")
        self.log.pack(padx=10, pady=5, fill="both", expand=True)

    def choose_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.folder_var.set(folder)

    def log_msg(self, text):
        self.log.configure(state="normal")
        self.log.insert("end", text + "\\n")
        self.log.see("end")
        self.log.configure(state="disabled")

    def start_download(self):
        url = self.url_entry.get().strip()
        if not url:
            messagebox.showwarning("Ошибка", "Введите ссылку на видео")
            return

        self.download_btn.config(state="disabled", text="Скачивание...")
        thread = threading.Thread(target=self.run_download, args=(url,), daemon=True)
        thread.start()

    def run_download(self, url):
        folder = self.folder_var.get()
        os.makedirs(folder, exist_ok=True)

        quality = self.quality_var.get()
        if quality.startswith("Максимальное"):
            fmt = "bestvideo+bestaudio"
        elif quality == "1080p":
            fmt = "bestvideo[height<=1080]+bestaudio"
        elif quality == "2160p (4K)":
            fmt = "bestvideo[height<=2160]+bestaudio"
        else:
            fmt = "bestaudio"

        base = resource_base_path()
        ffmpeg_path = os.path.join(base, "ffmpeg.exe")

        def progress_hook(d):
            if d["status"] == "downloading":
                pct = d.get("_percent_str", "").strip()
                speed = d.get("_speed_str", "").strip()
                self.log_msg(f"Скачивание: {pct} ({speed})")
            elif d["status"] == "finished":
                self.log_msg("Загрузка завершена, обработка файла (merge/mux)...")

        ydl_opts = {
            "format": fmt,
            "merge_output_format": "mp4",
            "outtmpl": os.path.join(folder, "%(title)s.%(ext)s"),
            "progress_hooks": [progress_hook],
            "quiet": True,
            "no_warnings": False,
        }
        if os.path.exists(ffmpeg_path):
            ydl_opts["ffmpeg_location"] = ffmpeg_path

        self.log_msg(f"> Начинаю скачивание: {url}")

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            self.log_msg("\\n✅ Готово! Видео сохранено в: " + folder)
        except yt_dlp.utils.DownloadError as e:
            self.log_msg(f"\\n⚠ Ошибка загрузки: {e}")
        except Exception as e:
            self.log_msg(f"\\n⚠ Ошибка: {e}")
        finally:
            self.download_btn.config(state="normal", text="Скачать")


if __name__ == "__main__":
    root = tk.Tk()
    app = VRDownloaderApp(root)
    root.mainloop()
`;

  const pyinstallerCmd = `pyinstaller --onefile --noconsole --name VR_downloader --add-binary "ffmpeg.exe;." VR_downloader.py`;

  const copyScript = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const copyCommand = () => {
    navigator.clipboard.writeText(pyinstallerCmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121926] border border-[#24334a] rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#1f2b3e] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {isEn ? 'Source Code VR_downloader.py & PyInstaller .EXE' : 'Исходный код VR_downloader.py & PyInstaller .EXE'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isEn ? 'Standalone script with embedded FFmpeg for Windows with zero external dependencies' : 'Автономный скрипт со встроенным FFmpeg для Windows без сторонних зависимостей'}
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

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* PyInstaller Command Box */}
          <div className="bg-[#162030] border border-[#273852] rounded-xl p-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-slate-200">
                {isEn ? 'Terminal command to build single .EXE file:' : 'Команда для сборки единого .EXE файла в терминале:'}
              </span>
              <button
                onClick={copyCommand}
                className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
              >
                {copiedCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCommand ? (isEn ? 'Copied!' : 'Скопировано!') : (isEn ? 'Copy' : 'Скопировать')}</span>
              </button>
            </div>
            <pre className="font-mono text-slate-300 bg-[#0e1420] p-2.5 rounded-lg overflow-x-auto text-[11px]">
              {pyinstallerCmd}
            </pre>
          </div>

          {/* Full Code Box */}
          <div className="bg-[#101622] border border-[#1f2b3e] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-200">
                {isEn ? 'VR_downloader.py (Ready-to-compile python script):' : 'VR_downloader.py (Готовый к сборке скрипт):'}
              </span>
              <button
                onClick={copyScript}
                className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium text-xs shadow-xs"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedScript ? (isEn ? 'Code Copied!' : 'Код скопирован!') : (isEn ? 'Copy Full Script' : 'Скопировать весь скрипт')}</span>
              </button>
            </div>
            <pre className="font-mono text-slate-300 bg-[#0b0f17] p-3 rounded-lg overflow-x-auto text-[11px] max-h-72 leading-relaxed">
              {pythonCode}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#1f2b3e] flex items-center justify-between bg-[#121926]">
          <span className="text-slate-400 text-xs">
            {isEn ? 'Supports 360° VR videos, 4K, 8K, and MP3 audio extraction' : 'Поддерживает 360° VR ролики, 4K, 8K и извлечение MP3 аудио'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#202c40] hover:bg-[#283852] text-xs font-medium text-slate-200 transition-colors"
          >
            {isEn ? 'Close' : 'Закрыть'}
          </button>
        </div>
      </div>
    </div>
  );
};
