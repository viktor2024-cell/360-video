@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1
title YouTube Downloader v1.2 (Быстрое скачивание)
color 0B

echo ==============================================================
echo   YouTube ^& VR Downloader v1.2 - Скачивание видео [Консоль]
echo ==============================================================
echo.

REM Проверка запуска из нераспакованного архива ZIP
echo "%~dp0" | findstr /i "AppData\Local\Temp" >nul 2>&1
if not errorlevel 1 goto err_temp

REM Проверяем, скачан ли уже yt-dlp.exe
if exist "yt-dlp.exe" goto check_done

echo [1/2] Загрузка модуля yt-dlp.exe (около 17 МБ)...
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
echo Сначала распакуйте архив на Рабочий стол!
echo.
pause
exit /b 1

:dl_failed
color 0C
echo.
echo [ОШИБКА] Не удалось автоматически скачать yt-dlp.exe.
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
echo Папка сохранения: %USERPROFILE%\Downloads
echo Качество: Лучшее (включая 4K, 8K и 360 VR)
echo Начинаем скачивание...
echo --------------------------------------------------------------

.\yt-dlp.exe --format "bestvideo+bestaudio/best" --merge-output-format mp4 -o "%USERPROFILE%\Downloads\%%(title)s.%%(ext)s" "%VIDEO_URL%"

if errorlevel 1 (
    echo.
    echo [Попытка скачивания в совместимом формате...]
    .\yt-dlp.exe -f "b" -o "%USERPROFILE%\Downloads\%%(title)s.%%(ext)s" "%VIDEO_URL%"
)

echo.
echo ==============================================================
echo [ГОТОВО] Видео сохранено в папку: %USERPROFILE%\Downloads
echo ==============================================================
echo.
goto loop
