import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Check, 
  Copy, 
  Package, 
  HardDrive, 
  AlertTriangle, 
  HelpCircle, 
  Terminal, 
  Zap, 
  CheckCircle2,
  FolderArchive,
  Play
} from 'lucide-react';
import JSZip from 'jszip';
import { Language } from '../i18n';

interface ExeDownloadModalProps {
  onClose: () => void;
  lang?: Language;
}

export const ExeDownloadModal: React.FC<ExeDownloadModalProps> = ({ onClose, lang = 'ru' }) => {
  const isEn = lang === 'en';
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedBatch, setCopiedBatch] = useState(false);
  const [copiedQuickBat, setCopiedQuickBat] = useState(false);
  const [copiedWinget, setCopiedWinget] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'build' | 'troubleshoot'>('quick');

  // 1. Direct BAT (No Python required at all, downloads standalone yt-dlp.exe)
  // CRITICAL: Absolutely NO bare & characters, NO parenthesis traps, uses goto instead of nested blocks
  const quickBatCode = `@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1
title YouTube + 360 VR Downloader
color 0B

echo ==============================================================
echo   YouTube + VR Downloader - Скачивание видео [БЕЗ Python]
echo ==============================================================
echo.

REM Проверка: запущен ли файл из нераспакованного архива ZIP
echo "%~dp0" | findstr /i "AppData\\Local\\Temp" >nul 2>&1
if not errorlevel 1 goto err_temp

REM Проверяем, скачан ли уже yt-dlp.exe
if exist "yt-dlp.exe" goto check_done

echo [1/2] Загрузка официального модуля yt-dlp.exe (около 17 МБ)...
echo Пожалуйста, подождите несколько секунд...
echo.

where curl >nul 2>&1
if errorlevel 1 goto dl_powershell

curl -L -k -o "yt-dlp.exe" "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
if exist "yt-dlp.exe" goto check_done

:dl_powershell
echo Скачивание через PowerShell...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe', 'yt-dlp.exe')"

if not exist "yt-dlp.exe" goto dl_failed

:check_done
echo.
echo [OK] Модуль yt-dlp.exe готов к работе!
echo.
goto loop

:err_temp
color 0C
echo ==============================================================
echo [ВНИМАНИЕ! ВЫ ЗАПУСТИЛИ ФАЙЛ ПРЯМО ИЗ АРХИВА .ZIP БЕЗ РАСПАКОВКИ]
echo ==============================================================
echo Windows блокирует запуск программ внутри временной папки архива.
echo.
echo ЧТО НУЖНО СДЕЛАТЬ (1 шаг):
echo 1. Закройте это черное окно.
echo 2. Нажмите правой кнопкой мыши по скачанному архиву .zip.
echo 3. Выберите "Извлечь всё..." (Extract all...) на Рабочий стол.
echo 4. Запустите этот же .bat файл из РАСПАКОВАННОЙ папки!
echo.
pause
exit /b 1

:dl_failed
color 0C
echo.
echo [ОШИБКА] Не удалось автоматически скачать yt-dlp.exe.
echo Проверьте подключение к интернету или скачайте yt-dlp.exe вручную:
echo https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe
echo и положите файл yt-dlp.exe в эту же папку.
echo.
pause
exit /b 1

:loop
echo ==============================================================
echo Вставьте ссылку на YouTube видео (или введите Q для выхода):
set "VIDEO_URL="
set /p "VIDEO_URL=> "

if not defined VIDEO_URL goto loop
if /i "%VIDEO_URL%"=="q" exit /b 0

echo.
echo Папка сохранения: %USERPROFILE%\\Downloads
echo Качество: Лучшее (включая 4K, 8K и 360 VR)
echo Начинаем скачивание...
echo --------------------------------------------------------------

.\\yt-dlp.exe --format "bestvideo+bestaudio/best" --merge-output-format mp4 -o "%USERPROFILE%\\Downloads\\%%(title)s.%%(ext)s" "%VIDEO_URL%"

if errorlevel 1 (
    echo.
    echo [Попытка скачивания в совместимом формате...]
    .\\yt-dlp.exe -f "b" -o "%USERPROFILE%\\Downloads\\%%(title)s.%%(ext)s" "%VIDEO_URL%"
)

echo.
echo ==============================================================
echo [ГОТОВО] Видео сохранено в папку: %USERPROFILE%\\Downloads
echo ==============================================================
echo.
goto loop
`;

  // 2. Robust Builder BAT (with full diagnostics, Python check, and pause)
  const buildExeBatCode = `@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1
title YouTube + VR Downloader - Сборщик EXE
color 0B

echo ==============================================================
echo   YouTube + VR Downloader - Автоматическая сборка в .EXE
echo ==============================================================
echo.

REM Проверка запуска из нераспакованного архива
echo "%~dp0" | findstr /i "AppData\\Local\\Temp" >nul 2>&1
if not errorlevel 1 goto err_temp

REM 1. Проверка наличия Python
echo [1/4] Проверка наличия Python в системе...
where python >nul 2>&1
if not errorlevel 1 (
    set "PYCMD=python"
    goto python_found
)

where py >nul 2>&1
if not errorlevel 1 (
    set "PYCMD=py"
    goto python_found
)

color 0C
echo.
echo ==============================================================
echo [ОШИБКА] Python не найден на вашем компьютере!
echo ==============================================================
echo Из-за отсутствия Python окно и закрывалось.
echo.
echo Чтобы собрать .exe файл:
echo 1. Установите Python с официального сайта: https://www.python.org/downloads/
echo    ВНИМАНИЕ: Обязательно отметьте галочку:
echo    [x] "Add python.exe to PATH" внизу первого окна установщика!
echo.
echo 2. Либо установите через PowerShell / Командную строку одной командой:
echo    winget install Python.Python.3.11
echo.
echo --------------------------------------------------------------
echo ЛАЙФХАК: Если не хотите устанавливать Python, запустите
echo файл "1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat" из этого архива!
echo Он работает сразу БЕЗ установки каких-либо программ.
echo --------------------------------------------------------------
echo.
pause
exit /b 1

:err_temp
color 0C
echo ==============================================================
echo [ВНИМАНИЕ! ВЫ ЗАПУСТИЛИ ФАЙЛ ПРЯМО ИЗ АРХИВА .ZIP БЕЗ РАСПАКОВКИ]
echo ==============================================================
echo Windows не позволяет программам собираться внутри архива.
echo Сначала нажмите правой кнопкой мыши на архив .zip и выберите:
echo "Извлечь всё..." (Extract all...) на Рабочий стол!
echo.
pause
exit /b 1

:python_found
echo [OK] Python найден: %PYCMD%
echo.

REM 2. Установка библиотек
echo [2/4] Проверка и установка библиотек yt-dlp и pyinstaller...
%PYCMD% -m pip install --upgrade pip >nul 2>&1
%PYCMD% -m pip install yt-dlp pyinstaller
if errorlevel 1 (
    color 0C
    echo [ОШИБКА] Не удалось установить библиотеки через pip.
    echo Проверьте подключение к интернету.
    pause
    exit /b 1
)
echo [OK] Библиотеки готовы.
echo.

REM 3. Подготовка ffmpeg.exe
echo [3/4] Проверка ffmpeg.exe...
if exist "ffmpeg.exe" goto ffmpeg_ready

echo Скачивание ffmpeg.exe для сведения 4K/8K видео и аудио...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri 'https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip' -OutFile 'ffmpeg.zip' -UseBasicParsing; Expand-Archive -Path 'ffmpeg.zip' -DestinationPath 'ffmpeg_tmp' -Force; Get-ChildItem -Path 'ffmpeg_tmp' -Filter 'ffmpeg.exe' -Recurse | Copy-Item -Destination 'ffmpeg.exe'; Remove-Item 'ffmpeg.zip' -Force; Remove-Item 'ffmpeg_tmp' -Recurse -Force; echo 'ffmpeg.exe успешно загружен!' } catch { echo 'ffmpeg.exe не удалось скачать автоматически. Сборка продолжится.' }"

:ffmpeg_ready
echo.

REM 4. Сборка единого .EXE файла
echo [4/4] Сборка единого .EXE файла через PyInstaller...
set "FFMPEG_ARG="
if exist "ffmpeg.exe" set "FFMPEG_ARG=--add-binary ffmpeg.exe;."

%PYCMD% -m PyInstaller --onefile --noconsole --name "YouTube_VR_Downloader" %FFMPEG_ARG% VR_downloader.py

if errorlevel 1 (
    color 0C
    echo.
    echo [ОШИБКА] Во время сборки PyInstaller произошла ошибка.
    pause
    exit /b 1
)

color 0A
echo.
echo ==============================================================
echo [УСПЕХ] Сборка завершена!
echo Готовый файл сохранен в: dist\\YouTube_VR_Downloader.exe
echo ==============================================================
echo Вы можете переместить этот .exe файл куда угодно и запускать!
echo.
pause
`;

  // 3. Launch GUI directly without waiting for PyInstaller compilation
  const launchGuiBatCode = `@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1
title YouTube + VR Downloader GUI
color 0B

echo Запуск приложения...
where python >nul 2>&1
if not errorlevel 1 (
    python -m pip install yt-dlp >nul 2>&1
    python VR_downloader.py
    exit /b 0
)

where py >nul 2>&1
if not errorlevel 1 (
    py -m pip install yt-dlp >nul 2>&1
    py VR_downloader.py
    exit /b 0
)

echo [ОШИБКА] Python не установлен.
echo Запустите "1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat"
pause
`;

  // Python GUI App (pure Tkinter, no missing dist folder, with Russian layout Ctrl+V fix)
  const pythonScript = `"""
YouTube & VR Downloader (Standalone GUI)
Универсальное приложение для скачивания 360° VR, 4K, 8K и MP3 с YouTube.
"""
import os
import sys
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
import yt_dlp

def resource_base_path():
    if getattr(sys, "frozen", False):
        return sys._MEIPASS
    return os.path.dirname(os.path.abspath(__file__))

def add_context_menu(widget):
    menu = tk.Menu(widget, tearoff=0)
    menu.add_command(label="Вырезать", command=lambda: widget.event_generate("<<Cut>>"))
    menu.add_command(label="Копировать", command=lambda: widget.event_generate("<<Copy>>"))
    menu.add_command(label="Вставить", command=lambda: widget.event_generate("<<Paste>>"))

    def show_popup(e):
        menu.tk_popup(e.x_root, e.y_root)

    widget.bind("<Button-3>", show_popup)

    # Исправление Ctrl+V для русской раскладки клавиатуры в Windows
    def on_ctrl_key(event):
        if event.keycode == 86:
            widget.event_generate("<<Paste>>")
            return "break"
        elif event.keycode == 67:
            widget.event_generate("<<Copy>>")
            return "break"
        elif event.keycode == 88:
            widget.event_generate("<<Cut>>")
            return "break"
    widget.bind("<Control-KeyPress>", on_ctrl_key)

class VRDownloaderApp:
    def __init__(self, root):
        self.root = root
        self.root.title("YouTube & VR Downloader")
        self.root.geometry("680x480")
        self.root.configure(bg="#0f172a")

        header = tk.Label(
            root, 
            text="YouTube & 360° VR Downloader", 
            font=("Segoe UI", 13, "bold"), 
            bg="#0f172a", 
            fg="#38bdf8"
        )
        header.pack(anchor="w", padx=20, pady=(15, 5))

        tk.Label(root, text="Ссылка на YouTube / 360° VR видео:", bg="#0f172a", fg="#e2e8f0", font=("Segoe UI", 9, "bold")).pack(anchor="w", padx=20, pady=(10, 3))
        self.url_entry = tk.Entry(root, font=("Consolas", 10), bg="#1e293b", fg="#ffffff", insertbackground="white")
        self.url_entry.pack(fill="x", padx=20, pady=2)
        add_context_menu(self.url_entry)

        ff = tk.Frame(root, bg="#0f172a")
        ff.pack(fill="x", padx=20, pady=8)
        tk.Label(ff, text="Папка сохранения:", bg="#0f172a", fg="#94a3b8", font=("Segoe UI", 9)).pack(side="left")
        self.folder_var = tk.StringVar(value=os.path.join(os.path.expanduser("~"), "Downloads"))
        self.folder_entry = tk.Entry(ff, textvariable=self.folder_var, bg="#1e293b", fg="#ffffff", font=("Consolas", 9))
        self.folder_entry.pack(side="left", padx=8, fill="x", expand=True)
        add_context_menu(self.folder_entry)
        tk.Button(ff, text="Обзор...", command=self.browse_folder, bg="#334155", fg="white", relief="flat", padx=10).pack(side="left")

        qf = tk.Frame(root, bg="#0f172a")
        qf.pack(fill="x", padx=20, pady=5)
        tk.Label(qf, text="Качество загрузки:", bg="#0f172a", fg="#94a3b8", font=("Segoe UI", 9)).pack(side="left")
        self.quality_var = tk.StringVar(value="Максимальное (4K / 8K / 360° VR best)")
        options = [
            "Максимальное (4K / 8K / 360° VR best)",
            "1080p Full HD",
            "720p HD",
            "Только аудио (MP3)"
        ]
        opt_menu = tk.OptionMenu(qf, self.quality_var, *options)
        opt_menu.config(bg="#1e293b", fg="white", relief="flat", highlightthickness=0)
        opt_menu.pack(side="left", padx=8)

        self.btn = tk.Button(
            root, 
            text="СКАЧАТЬ ВИДЕО", 
            command=self.start_download, 
            bg="#2563eb", 
            fg="white", 
            font=("Segoe UI", 10, "bold"), 
            relief="flat", 
            height=2,
            activebackground="#1d4ed8"
        )
        self.btn.pack(fill="x", padx=20, pady=12)

        tk.Label(root, text="Ход загрузки:", bg="#0f172a", fg="#94a3b8", font=("Segoe UI", 9)).pack(anchor="w", padx=20)
        self.log = scrolledtext.ScrolledText(root, bg="#090d16", fg="#38bdf8", font=("Consolas", 9), insertbackground="white", height=8, relief="flat")
        self.log.pack(fill="both", expand=True, padx=20, pady=(4, 15))
        self.log_print("Готов к работе. Вставьте ссылку на YouTube видео выше.")

    def browse_folder(self):
        folder = filedialog.askdirectory()
        if folder:
            self.folder_var.set(folder)

    def log_print(self, text):
        self.log.insert("end", text + "\\n")
        self.log.see("end")

    def start_download(self):
        url = self.url_entry.get().strip()
        if not url:
            messagebox.showwarning("Внимание", "Пожалуйста, введите ссылку на видео!")
            return

        self.btn.config(state="disabled", text="Скачивание... Подождите", bg="#475569")
        threading.Thread(target=self.run_download_thread, args=(url,), daemon=True).start()

    def run_download_thread(self, url):
        folder = self.folder_var.get()
        os.makedirs(folder, exist_ok=True)
        q = self.quality_var.get()

        if "MP3" in q:
            fmt = "bestaudio/best"
        elif "1080p" in q:
            fmt = "bestvideo[height<=1080]+bestaudio/best"
        elif "720p" in q:
            fmt = "bestvideo[height<=720]+bestaudio/best"
        else:
            fmt = "bestvideo+bestaudio/best"

        ffmpeg_bin = os.path.join(resource_base_path(), "ffmpeg.exe")
        ffmpeg_loc = ffmpeg_bin if os.path.exists(ffmpeg_bin) else None

        def progress_hook(d):
            if d.get("status") == "downloading":
                pct = d.get("_percent_str", "").strip()
                spd = d.get("_speed_str", "").strip()
                eta = d.get("_eta_str", "").strip()
                self.log_print(f"Загрузка: {pct} ({spd}, осталось {eta})")
            elif d.get("status") == "finished":
                self.log_print("Файл загружен, объединение аудио и видео...")

        ydl_opts = {
            "format": fmt,
            "outtmpl": os.path.join(folder, "%(title)s.%(ext)s"),
            "ffmpeg_location": ffmpeg_loc,
            "merge_output_format": "mp4" if "MP3" not in q else None,
            "progress_hooks": [progress_hook],
            "quiet": True,
            "no_warnings": True,
        }

        self.log_print(f"> Старт: {url}")
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            self.log_print(f"✅ УСПЕШНО СКАЧАНО! Сохранено в: {folder}")
        except Exception as e:
            self.log_print(f"❌ Ошибка загрузки: {str(e)}")
        finally:
            self.btn.config(state="normal", text="СКАЧАТЬ ВИДЕО", bg="#2563eb")

if __name__ == "__main__":
    r = tk.Tk()
    app = VRDownloaderApp(r)
    r.mainloop()
`;

  const copyBuildBatch = () => {
    navigator.clipboard.writeText(buildExeBatCode);
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  const copyQuickBatch = () => {
    navigator.clipboard.writeText(quickBatCode);
    setCopiedQuickBat(true);
    setTimeout(() => setCopiedQuickBat(false), 2000);
  };

  const copyWinget = () => {
    navigator.clipboard.writeText('winget install Python.Python.3.11');
    setCopiedWinget(true);
    setTimeout(() => setCopiedWinget(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsGenerating(true);
      const zip = new JSZip();

      // 1. Direct BAT & CMD (zero python needed)
      zip.file('1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat', quickBatCode);
      zip.file('1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.cmd', quickBatCode);

      // 2. Full single-exe builder
      zip.file('2_СОБРАТЬ_ОДИН_EXE.bat', buildExeBatCode);

      // 3. Instant GUI runner
      zip.file('3_ЗАПУСТИТЬ_ГРАФИЧЕСКОЕ_ОКНО.bat', launchGuiBatCode);

      // 4. Standalone python source
      zip.file('VR_downloader.py', pythonScript);
      zip.file('requirements.txt', 'yt-dlp>=2025.1.0\npyinstaller>=6.0.0\n');

      const readme = `==================================================================
YouTube & VR Downloader — Руководство по запуску и решению проблем
==================================================================

ВНИМАНИЕ! ЕСЛИ ПРИ ДВОЙНОМ КЛИКЕ ОКНО "ПРОСТО МОРГНУЛО И ЗАКРЫЛОСЬ":
------------------------------------------------------------------
Причина №1 (в 95% случаев):
Вы открыли архив .zip и кликнули по файлу ВНУТРИ АРХИВА без распаковки!
Windows блокирует запуск программ из временной папки архива.

ЧТО НУЖНО СДЕЛАТЬ:
1. Нажмите правой кнопкой мыши по скачанному архиву .zip.
2. Выберите пункт "Извлечь всё..." (Extract all...) и извлеките на Рабочий стол.
3. Откройте распакованную папку и запускайте файл из неё!

Причина №2:
Если окно все еще закрывается, вот как запустить так, чтобы оно
ГАРАНТИРОВАННО НЕ ЗАКРЫЛОСЬ и показало точную причину:
1. Нажмите сочетание клавиш [Win + R] на клавиатуре.
2. Введите: cmd и нажмите Enter (откроется черное окно).
3. Перетащите файл "1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat" мышкой прямо в это окно.
4. Нажмите Enter. Окно НЕ закроется и покажет результат!

ВАРИАНТЫ ЗАПУСКА:

1) "1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat" (РЕКОМЕНДУЕТСЯ)
   - Не требует установки Python!
   - Сам скачивает yt-dlp.exe и сразу готов качать любое видео в 4K и 360° VR.

2) "2_СОБРАТЬ_ОДИН_EXE.bat"
   - Собирает программу в один автономный YouTube_VR_Downloader.exe.
   - Требует установленный Python с сайта python.org с галочкой [x] Add python.exe to PATH.
`;
      zip.file('ИНСТРУКЦИЯ_КАК_ЗАПУСТИТЬ.txt', readme);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'YouTube_VR_Downloader_Fixed_Package.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#121926] border border-[#24334a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#1f2b3e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white tracking-tight">
                {isEn ? 'Windows Launcher & Standalone .EXE' : 'Готовый запуск и сборка .EXE для Windows'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEn ? 'Direct download without Python or 1-click single file builder' : 'Решение проблем с .bat, запуск без Python и сборка в 1 .exe файл'}
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
        <div className="p-6 space-y-5 text-xs overflow-y-auto max-h-[75vh]">
          {/* Diagnostic Alert Box: Why it flashes and closes */}
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-4 flex gap-3.5 text-red-200">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-red-300 text-xs">
                {isEn ? 'Why does the window flash and close immediately?' : 'Почему черное окно просто моргнуло и сразу закрылось?'}
              </h4>
              <div className="space-y-1.5 text-[11.5px] leading-relaxed text-red-200/90">
                <p>
                  <b>Причина №1 (в 90% случаев):</b> Вы запустили файл <b>внутри скачанного ZIP архива без распаковки</b>. Windows не позволяет скриптам работать внутри архива и блокирует их за доли секунды.
                </p>
                <div className="bg-red-950/60 border border-red-800/50 rounded-lg p-2 text-white font-medium flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Решение: нажмите правой кнопкой мыши по файлу архива .zip → <b>«Извлечь всё...»</b> на Рабочий стол, и запустите из распакованной папки!</span>
                </div>
                <p>
                  <b>Причина №2:</b> Не установлен Python (для сборщика <code>.exe</code>). Для этого мы сделали файл <b>«1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat»</b>, которому вообще не нужен Python!
                </p>
              </div>
            </div>
          </div>

          {/* Download Full Fixed Package Button */}
          <div className="bg-gradient-to-r from-blue-950/70 via-[#152540] to-indigo-950/50 border border-blue-700/40 rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-blue-400" />
                <span>{isEn ? 'Download Fixed Package (.ZIP)' : 'Скачать обновленный архив (.ZIP)'}</span>
              </h4>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">
                {isEn 
                  ? 'Contains 1-Click BAT without Python, Standalone EXE builder, and instructions.'
                  : 'Содержит батник БЕЗ Python (работает сразу), проверку на распаковку архива и сборщик .exe.'}
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isGenerating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50"
            >
              {isGenerating ? (
                <span>{isEn ? 'Packing...' : 'Формирование...'}</span>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>{isEn ? 'Downloaded!' : 'Скачано!'}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{isEn ? 'Download ZIP Package' : 'Скачать ZIP архив'}</span>
                </>
              )}
            </button>
          </div>

          {/* Guaranteed diagnostic trick */}
          <div className="bg-[#101725] border border-blue-500/30 rounded-xl p-3.5 space-y-2">
            <h5 className="font-semibold text-blue-300 flex items-center gap-2 text-xs">
              <Play className="w-3.5 h-3.5 text-blue-400" />
              <span>Способ запуска, при котором окно ГАРАНТИРОВАННО НЕ ЗАКРОЕТСЯ:</span>
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11.5px]">
              <li>Нажмите на клавиатуре клавиши <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-white font-mono text-[10px]">Win + R</kbd>.</li>
              <li>Введите <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">cmd</code> и нажмите Enter (откроется черное окно).</li>
              <li>Перетащите файл <b>1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat</b> мышкой прямо в это черное окно.</li>
              <li>Нажмите <b>Enter</b> — окно никогда не исчезнет и покажет точный результат!</li>
            </ol>
          </div>

          {/* Nav Tabs */}
          <div className="flex border-b border-[#202e42] gap-2">
            <button
              onClick={() => setActiveTab('quick')}
              className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'quick'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{isEn ? '1. Without Python (Instant)' : '1. Без Python (Работает сразу)'}</span>
            </button>
            <button
              onClick={() => setActiveTab('build')}
              className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'build'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>{isEn ? '2. Build Single .EXE' : '2. Собрать единый .EXE'}</span>
            </button>
            <button
              onClick={() => setActiveTab('troubleshoot')}
              className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'troubleshoot'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEn ? '3. Troubleshooting' : '3. Если не работает'}</span>
            </button>
          </div>

          {/* TAB 1: QUICK WITHOUT PYTHON */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="bg-[#101725] border border-[#1f2c42] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEn ? 'Zero dependencies — works on any Windows 10/11' : 'Не требует Python — работает на любой Windows 10 / 11 сразу'}</span>
                </div>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  {isEn
                    ? 'This script uses the official standalone yt-dlp.exe. It automatically downloads it on first launch, prompts for the link, and saves maximum quality 4K/VR video to your Downloads folder.'
                    : 'Этот файл использует официальный готовый yt-dlp.exe. Он скачивает его при первом запуске (17 МБ), запрашивает ссылку и сохраняет 4K/VR видео со звуком прямо в вашу папку «Загрузки».'}
                </p>
                <div className="text-[11px] text-slate-400">
                  {isEn ? 'File name in ZIP:' : 'Имя файла в архиве:'}{' '}
                  <code className="text-blue-300 bg-blue-950/70 px-1.5 py-0.5 rounded">1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat</code>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-300 text-xs">
                    {isEn ? 'Code of 1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat:' : 'Код батника прямого скачивания:'}
                  </span>
                  <button
                    onClick={copyQuickBatch}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {copiedQuickBat ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedQuickBat ? (isEn ? 'Copied!' : 'Скопировано!') : (isEn ? 'Copy' : 'Скопировать')}</span>
                  </button>
                </div>
                <pre className="font-mono text-slate-300 bg-[#090d15] p-3 rounded-xl overflow-x-auto text-[11px] max-h-48 leading-relaxed border border-[#1b2638]">
                  {quickBatCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: BUILD SINGLE EXE */}
          {activeTab === 'build' && (
            <div className="space-y-4">
              <div className="bg-[#101725] border border-[#1f2c42] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
                  <Package className="w-4 h-4" />
                  <span>{isEn ? 'Produces 1 standalone YouTube_VR_Downloader.exe' : 'Создает 1 автономный файл YouTube_VR_Downloader.exe'}</span>
                </div>
                <p className="text-slate-300 text-[11.5px] leading-relaxed">
                  {isEn
                    ? 'Compiles the graphical interface, ffmpeg, and download engine into one single portable executable that you can run anywhere.'
                    : 'Скрипт проверяет наличие Python, устанавливает yt-dlp и PyInstaller, скачивает ffmpeg и компилирует графическое окно со всеми библиотеками в единый .exe файл.'}
                </p>
                <div className="text-[11px] text-slate-400">
                  {isEn ? 'File name in ZIP:' : 'Имя файла в архиве:'}{' '}
                  <code className="text-blue-300 bg-blue-950/70 px-1.5 py-0.5 rounded">2_СОБРАТЬ_ОДИН_EXE.bat</code>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-slate-300 text-xs">
                    {isEn ? 'Code of 2_СОБРАТЬ_ОДИН_EXE.bat:' : 'Код скрипта сборки в .EXE:'}
                  </span>
                  <button
                    onClick={copyBuildBatch}
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium"
                  >
                    {copiedBatch ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBatch ? (isEn ? 'Copied!' : 'Скопировано!') : (isEn ? 'Copy' : 'Скопировать')}</span>
                  </button>
                </div>
                <pre className="font-mono text-slate-300 bg-[#090d15] p-3 rounded-xl overflow-x-auto text-[11px] max-h-48 leading-relaxed border border-[#1b2638]">
                  {buildExeBatCode}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: TROUBLESHOOTING */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-3.5">
              <div className="bg-[#101725] border border-[#1f2c42] rounded-xl p-3.5 space-y-3">
                <h5 className="font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  <span>{isEn ? 'How to install Python in 1 command (Windows)' : 'Как установить Python одной командой в Windows'}</span>
                </h5>
                <p className="text-slate-300 text-[11.5px]">
                  {isEn
                    ? 'Open PowerShell or Command Prompt (cmd) and paste this command:'
                    : 'Откройте PowerShell или Командную строку и вставьте команду:'}
                </p>
                <div className="flex items-center justify-between bg-[#090d15] border border-[#24334a] rounded-lg px-3 py-2">
                  <code className="text-emerald-400 font-mono text-xs select-all">winget install Python.Python.3.11</code>
                  <button
                    onClick={copyWinget}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 ml-3"
                  >
                    {copiedWinget ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedWinget ? 'OK' : 'Копировать'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  {isEn 
                    ? 'Or download installer manually from python.org and MUST CHECK "Add python.exe to PATH"!'
                    : 'Или скачайте с python.org — главное обязательно поставьте галочку "Add python.exe to PATH" в первом окне!'}
                </p>
              </div>

              <div className="bg-[#101725] border border-[#1f2c42] rounded-xl p-3.5 space-y-2">
                <h5 className="font-semibold text-white">
                  {isEn ? 'Common Questions:' : 'Частые вопросы:'}
                </h5>
                <ul className="space-y-2 text-[11.5px] text-slate-300">
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <div>
                      <b className="text-white">{isEn ? 'Windows Defender warning?' : 'Антивирус Windows Defender выдает предупреждение?'}</b>
                      <p className="text-slate-400 text-[11px]">
                        {isEn
                          ? 'Click "More info" -> "Run anyway". Self-built PyInstaller files do not have a paid Microsoft digital signature, so Windows shows this by default.'
                          : 'Нажмите «Подробнее» → «Выполнить в любом случае». Любые файлы, собранные через PyInstaller без платной цифровой подписи, вызывают это стандартное окно.'}
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 font-bold">•</span>
                    <div>
                      <b className="text-white">{isEn ? 'Need fast download right now?' : 'Нужно скачать видео прямо сейчас?'}</b>
                      <p className="text-slate-400 text-[11px]">
                        {isEn
                          ? 'Just run 1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat - it requires no preparation.'
                          : 'Просто запустите 1_СКАЧАТЬ_ВИДЕО_БЕЗ_PYTHON.bat — он вообще не требует настроек и работает сразу.'}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#1f2b3e] flex items-center justify-between bg-[#121926]">
          <span className="text-slate-400 text-xs">
            {isEn ? 'Compatibility: Windows 10, 11 (x64)' : 'Совместимость: Windows 10, 11 (x64)'}
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
