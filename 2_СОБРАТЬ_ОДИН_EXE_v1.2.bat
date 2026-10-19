@echo off
cd /d "%~dp0"
chcp 65001 >nul 2>&1
title YouTube Downloader v1.2 - Сборщик EXE
color 0B

echo ==============================================================
echo   YouTube ^& VR Downloader v1.2 — Сборка единого .EXE файла
echo ==============================================================
echo.

REM Проверка запуска из нераспакованного архива
echo "%~dp0" | findstr /i "AppData\Local\Temp" >nul 2>&1
if not errorlevel 1 goto err_temp

REM 1. Проверка наличия Python
echo [1/3] Проверка Python в системе...
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
echo.
echo Чтобы собрать файл .exe:
echo 1. Скачайте Python с официального сайта: https://www.python.org/downloads/
echo    ВНИМАНИЕ: Обязательно отметьте галочку:
echo    [x] "Add python.exe to PATH" внизу первого окна установщика!
echo.
echo --------------------------------------------------------------
echo ЛАЙФХАК: Вам НЕ обязательно собирать .exe, чтобы пользоваться v1.2!
echo Просто дважды кликните по файлу:
echo "1_ЗАПУСТИТЬ_ИНТЕРФЕЙС_v1.2.bat"
echo Он открывает весь интерфейс v1.2 сразу БЕЗ Python!
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
echo [2/3] Установка библиотек (pywebview, yt-dlp, pyinstaller)...
%PYCMD% -m pip install --upgrade pip >nul 2>&1
%PYCMD% -m pip install pywebview yt-dlp pyinstaller
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
if exist "ffmpeg.exe" goto ffmpeg_ready
echo Проверка ffmpeg.exe...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { Invoke-WebRequest -Uri 'https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip' -OutFile 'ffmpeg.zip' -UseBasicParsing; Expand-Archive -Path 'ffmpeg.zip' -DestinationPath 'ffmpeg_tmp' -Force; Get-ChildItem -Path 'ffmpeg_tmp' -Filter 'ffmpeg.exe' -Recurse | Copy-Item -Destination 'ffmpeg.exe'; Remove-Item 'ffmpeg.zip' -Force; Remove-Item 'ffmpeg_tmp' -Recurse -Force; echo 'ffmpeg.exe успешно загружен!' } catch { echo 'ffmpeg.exe не удалось скачать автоматически. Сборка продолжится.' }"

:ffmpeg_ready
echo.

REM 4. Сборка единого .EXE файла
echo [3/3] Компиляция единого .EXE файла с интерфейсом v1.2 через PyInstaller...
echo Это займет около 1-2 минут, подождите...

%PYCMD% -m PyInstaller --onefile --noconsole --noupx --clean -y --distpath release --workpath build --name "YouTube_VR_Downloader_v1.2" --add-data "dist\index.html;dist" --add-data "dist\assets;dist\assets" --add-binary "ffmpeg.exe;." --exclude-module tkinter desktop_app.py

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
echo [УСПЕХ] Сборка v1.2 завершена!
echo Готовый файл: release\YouTube_VR_Downloader_v1.2.exe
echo ==============================================================
echo Этот ОДИН файл содержит интерфейс, yt-dlp и ffmpeg.
echo Его можно переместить куда угодно и запускать.
echo.
pause
