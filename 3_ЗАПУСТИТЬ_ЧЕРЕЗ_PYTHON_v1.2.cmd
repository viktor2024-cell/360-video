@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1
title YouTube Downloader v1.2 (Python App)
color 0B

echo Запуск приложения v1.2...

echo "%~dp0" | findstr /i "AppData\Local\Temp" >nul 2>&1
if not errorlevel 1 goto err_temp

where python >nul 2>&1
if not errorlevel 1 (
    python -m pip install --quiet pywebview yt-dlp >nul 2>&1
    python desktop_app.py
    exit /b 0
)

where py >nul 2>&1
if not errorlevel 1 (
    py -m pip install --quiet pywebview yt-dlp >nul 2>&1
    py desktop_app.py
    exit /b 0
)

echo [ОШИБКА] Python не установлен.
echo Запустите "1_ЗАПУСТИТЬ_ИНТЕРФЕЙС_v1.2.bat" для открытия БЕЗ Python!
pause
exit /b 1

:err_temp
color 0C
echo [ВНИМАНИЕ] Распакуйте архив .zip на Рабочий стол перед запуском!
pause
exit /b 1
