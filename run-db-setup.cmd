@echo off
echo ========================================
echo    FIXING LOVEROSE DATABASE TABLES
echo ========================================
cd /d "c:\Users\Demiurgo\Documents\GitHub\love_rose"
echo Running database setup...
node scripts\setup-database-fixed.js
echo.
echo Setup completed. Press any key to continue...
pause > nul
