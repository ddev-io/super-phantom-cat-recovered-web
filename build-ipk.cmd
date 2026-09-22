@echo off
setlocal
cd /d "%~dp0"
where ares-package >nul 2>&1
if errorlevel 1 (
    echo webOS CLI is not installed. Install it with: npm install -g @webos-tools/cli
    exit /b 1
)
if not exist "app\appinfo.json" (
    echo Missing app\appinfo.json. Extract the complete project first.
    exit /b 1
)
call ares-package --no-minify ".\app"
exit /b %errorlevel%
