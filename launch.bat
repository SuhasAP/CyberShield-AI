@echo off
echo ========================================================
echo   CYBERSHIELD AI - SECURITY ANALYTICS LAUNCH SYSTEM     
echo ========================================================
echo.
echo Starting Flask API Backend server in separate shell...
start cmd /k "title CyberShield Backend ^& cd backend ^& python app.py"

echo Starting React Vite Frontend Client in separate shell...
start cmd /k "title CyberShield Frontend ^& cd frontend ^& npm run dev"
echo.
echo ========================================================
echo   API Server running at: http://127.0.0.1:5000         
echo   Frontend Client running at: http://localhost:5173    
echo ========================================================
echo.
pause
