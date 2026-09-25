@echo off
chcp 65001 > nul
title Сборка единого файла YouTube_VR_Downloader.exe

echo ==============================================================================
echo    YouTube ^& VR Downloader — Сборка единого .EXE файла (Windows)
echo ==============================================================================
echo.

echo [1/4] Проверка Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ОШИБКА] Python не найден! Установите Python с официального сайта python.org
    echo и обязательно отметьте галочку "Add python.exe to PATH".
    pause
    exit /b
)

echo [2/4] Установка библиотек сборки (yt-dlp, pywebview, pyinstaller)...
pip install --upgrade yt-dlp pywebview pyinstaller
if %errorlevel% neq 0 (
    echo [ОШИБКА] Не удалось установить библиотеки. Проверьте интернет-соединение.
    pause
    exit /b
)

echo [3/4] Проверка ffmpeg.exe...
if not exist "ffmpeg.exe" (
    echo Скачивание ffmpeg.exe (необходимо для склеивания 4K видео и 360 VR)...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip', 'ffmpeg.zip')"
    if exist "ffmpeg.zip" (
        powershell -Command "Expand-Archive -Path 'ffmpeg.zip' -DestinationPath 'ffmpeg_temp' -Force"
        powershell -Command "Get-ChildItem -Path 'ffmpeg_temp' -Filter 'ffmpeg.exe' -Recurse | Copy-Item -Destination 'ffmpeg.exe'"
        del ffmpeg.zip
        rmdir /s /q ffmpeg_temp
    )
)

if not exist "ffmpeg.exe" (
    echo [ВНИМАНИЕ] Автоскачивание ffmpeg не удалось. Пожалуйста, положите ffmpeg.exe рядом со скриптом.
) else (
    echo ffmpeg.exe готов к интеграции!
)

echo [4/4] Запуск PyInstaller: компиляция единого .EXE со всеми ресурсами...
echo Это займет около 1-2 минут...

pyinstaller --onefile --noconsole ^
    --name "YouTube_VR_Downloader" ^
    --add-data "dist;dist" ^
    --add-binary "ffmpeg.exe;." ^
    desktop_app.py

if exist "dist\YouTube_VR_Downloader.exe" (
    echo.
    echo ==============================================================================
    echo  УСПЕХ! Сборка завершена!
    echo.
    echo  Готовый файл: dist\YouTube_VR_Downloader.exe
    echo.
    echo  Этот ОДИН файл содержит:
    echo    * Весь графический интерфейс (как на картинке)
    echo    * Движок yt-dlp
    echo    * Конвертер ffmpeg.exe
    echo.
    echo  Его можно скопировать на любую флешку или другой компьютер с Windows.
    echo  Никаких других файлов или установок НЕ ТРЕБУЕТСЯ!
    echo ==============================================================================
) else (
    echo [ОШИБКА] Сборка не удалась. Проверьте вывод выше.
)

pause
