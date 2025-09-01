@echo off
echo Probando conexión a la base de datos...

psql -U postgres -d Love_rose_db -c "SELECT id, email, is_verified, is_active FROM users WHERE email = 'user@loverose.com';"

echo.
echo Actualizando usuario...

psql -U postgres -d Love_rose_db -c "UPDATE users SET is_verified = true, is_active = true, updated_at = NOW() WHERE email = 'user@loverose.com';"

echo.
echo Verificando actualización...

psql -U postgres -d Love_rose_db -c "SELECT id, email, is_verified, is_active, updated_at FROM users WHERE email = 'user@loverose.com';"

echo.
echo Prueba completada. Presiona cualquier tecla para continuar...
pause >nul
