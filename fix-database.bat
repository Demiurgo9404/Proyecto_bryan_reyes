@echo off
echo ========================================
echo    FIXING LOVEROSE DATABASE TABLES
echo ========================================
echo.
echo Navegando al directorio del proyecto...
cd /d "c:\Users\Demiurgo\Documents\GitHub\love_rose"
echo.
echo Ejecutando script de configuracion de base de datos...
node scripts/setup-database-fixed.js
echo.
echo ========================================
echo    PROCESO COMPLETADO
echo ========================================
pause
