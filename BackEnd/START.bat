@echo off
REM Medical Pharmacy Chatbot - Windows Batch Startup Script

setlocal enabledelayedexpansion

cls
echo.
echo ╔════════════════════════════════════════╗
echo ║ Medical Pharmacy Chatbot - Startup    ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if we're in BackEnd folder
if not exist ".env" (
    echo ❌ ERROR: .env file not found!
    echo Expected location: %CD%\.env
    echo.
    pause
    exit /b 1
)

echo ✅ Environment configuration found
echo.
echo 🚀 Starting Medical Pharmacy Chatbot Backend...
echo ⏳ Server starting on http://localhost:5000
echo.

REM Start the server
node src/server.js

REM If we get here, server has stopped
echo.
echo ❌ Server has stopped
pause
