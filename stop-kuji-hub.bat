@echo off
title KUJI HUB - stop
echo Stopping kuji local server and tunnel...
taskkill /F /FI "WINDOWTITLE eq kuji-server*" >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8123" ^| findstr "LISTENING"') do taskkill /F /PID %%p >nul 2>&1
echo Done. Server + tunnel stopped, public link is offline.
pause
