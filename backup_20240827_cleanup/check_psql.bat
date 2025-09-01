@echo off
echo Probando conexión a PostgreSQL...
psql -h localhost -p 5432 -U postgres -l
if %errorlevel% neq 0 (
    echo Error al conectar a PostgreSQL. Verifica que el servicio esté en ejecución.
    pause
) else (
    echo Conexión exitosa a PostgreSQL.
    pause
)
