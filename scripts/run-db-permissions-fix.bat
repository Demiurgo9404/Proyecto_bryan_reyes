@echo off
echo Ejecutando script de permisos de base de datos...
echo.

REM Ejecutar el script SQL de permisos con el nombre correcto de la base de datos
psql -h localhost -U postgres -d LoveRoseDB -f "%~dp0fix-database-permissions.sql"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Permisos de base de datos arreglados exitosamente
    echo.
    echo Reinicia el servidor backend para aplicar los cambios
) else (
    echo.
    echo ❌ Error al ejecutar el script de permisos
    echo Verifica que PostgreSQL esté ejecutándose y las credenciales sean correctas
)

pause
