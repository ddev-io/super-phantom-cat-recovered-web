@echo off
setlocal

cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8000"

echo Serving Super Phantom Cat
echo URL: http://127.0.0.1:%PORT%/assets/index.webv1.html
echo.
echo Press Ctrl+C to stop the server.
echo.

where py >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    py -3 serve.py --bind 127.0.0.1 --port %PORT%
) else (
    python serve.py --bind 127.0.0.1 --port %PORT%
)

if errorlevel 1 (
    echo.
    echo Server stopped with an error. Make sure Python 3 is available in PATH.
    pause
)

endlocal
