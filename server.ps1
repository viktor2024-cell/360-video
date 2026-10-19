# PowerShell Local Server for YouTube Downloader v1.2
$port = 8765
$dist = Join-Path $PSScriptRoot "dist"

while ($true) {
    try {
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://127.0.0.1:$port/")
        $listener.Start()
        break
    } catch {
        $port++
        if ($port -gt 8790) { break }
    }
}

if ($listener.IsListening) {
    $url = "http://127.0.0.1:$port/index.html?desktop=1"
    
    # Открываем в отдельном окне приложения Edge или Chrome
    if (Get-Command msedge -ErrorAction SilentlyContinue) {
        Start-Process msedge -ArgumentList "--app=$url", "--window-size=1220,840"
    } elseif (Get-Command chrome -ErrorAction SilentlyContinue) {
        Start-Process chrome -ArgumentList "--app=$url", "--window-size=1220,840"
    } else {
        Start-Process $url
    }

    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host "  YouTube & VR Downloader v1.2 запущен успешно!" -ForegroundColor Green
    Write-Host "  URL: $url" -ForegroundColor White
    Write-Host "==============================================================" -ForegroundColor Cyan
    Write-Host "Оставьте это окно открытым во время работы (можно свернуть)." -ForegroundColor Yellow
    Write-Host "Для завершения работы просто закройте это окно." -ForegroundColor Gray

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $relPath = $request.Url.LocalPath.TrimStart('/')
            if ([string]::IsNullOrWhiteSpace($relPath)) { $relPath = 'index.html' }
            $filePath = Join-Path $dist $relPath

            if (-not (Test-Path $filePath) -or (Get-Item $filePath).PSIsContainer) {
                $filePath = Join-Path $dist 'index.html'
            }

            if (Test-Path $filePath) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                switch ($ext) {
                    '.js'   { $response.ContentType = 'application/javascript; charset=utf-8' }
                    '.css'  { $response.ContentType = 'text/css; charset=utf-8' }
                    '.html' { $response.ContentType = 'text/html; charset=utf-8' }
                    '.json' { $response.ContentType = 'application/json; charset=utf-8' }
                    '.png'  { $response.ContentType = 'image/png' }
                    '.jpg'  { $response.ContentType = 'image/jpeg' }
                    '.svg'  { $response.ContentType = 'image/svg+xml' }
                    Default { $response.ContentType = 'application/octet-stream' }
                }
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                $response.Close()
            } else {
                $response.StatusCode = 404
                $response.Close()
            }
        } catch {
            # continue
        }
    }
}
