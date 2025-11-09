@echo off
echo              STARTING BUCHHALTUNG DASHBOARD SERVERS

echo [INFO] This will start 2 servers:
echo   1. Express API Server    - http://localhost:3001
echo   2. Next.js Frontend      - http://localhost:3000
echo.
echo [INFO] Press Ctrl+C to stop all servers
echo.
pause

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    pause
    exit /b 1
)


echo Starting Express API Server on port 3001...
start "Express API Server" cmd /k "cd apps\api && npm run dev"
timeout /t 3 >nul

echo.
echo Starting Next.js Frontend on port 3000...
start "Next.js Frontend" cmd /k "npm run dev"
timeout /t 5 >nul

echo.
echo ALL SERVERS STARTED!
echo.
echo   Express API:  http://localhost:3001
echo   Frontend UI:  http://localhost:3000
echo.
pause
