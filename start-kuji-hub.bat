@echo off
title KUJI HUB - server + public tunnel
cd /d "%~dp0"

echo ============================================
echo   KUJIGACHA - KUJI CLUB  -  LOCAL HUB
echo ============================================
echo.

REM --- 1) local static server on :8123 ---
netstat -ano | findstr ":8123" | findstr "LISTENING" >nul
if %errorlevel%==0 (
  echo [OK] Local server already running on http://127.0.0.1:8123
) else (
  echo [..] Starting local server on http://127.0.0.1:8123 ...
  start "kuji-server" /min "C:\Users\user\.workbuddy-ai\binaries\python\versions\3.13.12\python.exe" -m http.server 8123 --bind 127.0.0.1
  timeout /t 2 >nul
)

REM --- 2) public cloudflare tunnel ---
tasklist | findstr /I "cloudflared.exe" >nul
if %errorlevel%==0 (
  echo [OK] Tunnel already running
) else (
  echo [..] Starting public tunnel ...
  start "kuji-tunnel" /min "C:\Users\user\.workbuddy-ai\tools\cloudflared.exe" tunnel --url http://127.0.0.1:8123 --no-autoupdate --logfile "%~dp0tunnel.log"
  timeout /t 8 >nul
)

echo.
echo --- Public share link ---
for /f "tokens=*" %%a in ('findstr /C:"trycloudflare.com" "%~dp0tunnel.log"') do (
  set LINE=%%a
  goto :found
)
echo (tunnel still starting - run this again in a few seconds)
goto :end
:found
powershell -NoProfile -Command "$m=[regex]::Match((Get-Content '%~dp0tunnel.log' -Raw),'https://[a-z0-9-]+\.trycloudflare\.com'); if($m.Success){ Write-Host $m.Value }"

:end
echo.
echo Press any key to close this window (server + tunnel keep running).
pause >nul
