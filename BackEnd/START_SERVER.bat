@echo off
REM Medical Pharmacy Chatbot - Start Server
REM Starts the Node.js backend server

echo.
echo ╔════════════════════════════════════════╗
echo ║ Medical Pharmacy Chatbot - Server      ║
echo ║ Version: 1.0                           ║
echo ║ Status: STARTING...                    ║
echo ╚════════════════════════════════════════╝
echo.

cd /d "%~dp0"

if not exist ".env" (
  echo ❌ ERROR: .env file not found in %CD%
  echo Please create .env with database credentials
  pause
  exit /b 1
)

echo ✅ Environment file loaded
echo.
echo Starting backend server on localhost:5000...
echo.

node src/server.js

pause
