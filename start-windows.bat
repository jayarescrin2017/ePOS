@echo off
TITLE Local POS System Setup
echo ===================================================
echo     Local POS System Setup and Runner (Windows)
echo ===================================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/ before running this script.
    echo.
    pause
    exit /b
)

:: Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo [INFO] First time setup: Installing dependencies...
    echo This might take a minute or two...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies. Check your internet connection.
        pause
        exit /b
    )
    echo [SUCCESS] Dependencies installed successfully!
    echo.
) else (
    echo [INFO] Dependencies found.
)

:: Start the application
echo [INFO] Starting the local server on port 8080...
echo Go to http://localhost:8080 in your web browser once you see "Server running"
echo.
set LOCAL_PORT=8080
call npm run dev

pause
