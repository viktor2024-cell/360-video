@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1
title YouTube Downloader v1.2

echo ==============================================================
echo   YouTube ^& VR Downloader v1.2 — Запуск интерфейса
echo ==============================================================
echo.

REM Проверка: запущен ли файл из нераспакованного архива ZIP
echo "%~dp0" | findstr /i "AppData\Local\Temp" >nul 2>&1
if not errorlevel 1 goto err_temp

echo Запуск современного интерфейса v1.2...

REM 1. Если установлен Python с библиотеками pywebview и yt-dlp — запуск нативного окна
where python >nul 2>&1
if not errorlevel 1 (
    python -c "import webview, yt_dlp" >nul 2>&1
    if not errorlevel 1 (
        echo Запуск через нативный движок Python...
        start "" python desktop_app.py
        exit /b 0
    )
)

REM 2. Надежный запуск через встроенный в Windows сервер PowerShell (без белого экрана и CORS)
if exist "%~dp0server.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
    exit /b 0
)

REM 3. Запасной запуск через Microsoft Edge в режиме отдельного окна
where msedge >nul 2>&1
if not errorlevel 1 (
    start msedge --app="%~dp0dist\index.html" --window-size=1220,840
    exit /b 0
)

REM 4. Запасной запуск через Google Chrome в режиме приложения
where chrome >nul 2>&1
if not errorlevel 1 (
    start chrome --app="%~dp0dist\index.html" --window-size=1220,840
    exit /b 0
)

REM 5. Открытие в браузере по умолчанию
start "" "%~dp0dist\index.html"
exit /b 0

:err_temp
color 0C
echo ==============================================================
echo [ВНИМАНИЕ! ВЫ ЗАПУСТИЛИ ФАЙЛ ПРЯМО ИЗ АРХИВА .ZIP БЕЗ РАСПАКОВКИ]
echo ==============================================================
echo Windows блокирует работу файлов внутри архива.
echo.
echo Сделайте 1 простое действие:
echo 1. Закройте это черное окно.
echo 2. Нажмите правой кнопкой по файлу архива .zip.
echo 3. Выберите "Извлечь всё..." (Extract all...) на Рабочий стол.
echo 4. Запустите этот же файл из распакованной папки!
echo.
pause
exit /b 1
