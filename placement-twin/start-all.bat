@echo off
title Placement Twin Launcher
echo ===================================================
echo       Launching Placement Twin AI Platform
echo ===================================================

echo [1/3] Starting Python FastAPI AI Service (Port 8000)...
start "Placement Twin AI Service (Qwen 2.5)" cmd /k "cd ai-service && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/3] Starting Node.js Express Backend (Port 5000)...
start "Placement Twin Backend (Express)" cmd /k "cd backend && npm start"

echo [3/3] Starting Vite Frontend (Port 5173)...
start "Placement Twin Frontend (Vite React)" cmd /k "cd frontend && npm run dev"

echo.
echo All services launched!
echo Frontend will be accessible at: http://localhost:5173
echo Backend API running at:         http://localhost:5000
echo Python AI Service running at:   http://localhost:8000
echo.
