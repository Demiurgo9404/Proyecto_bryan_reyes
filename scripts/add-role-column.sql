-- Script para agregar columna 'role' a la tabla users existente
-- Ejecutar este script para solucionar el error "no existe la columna u.role"

DO $$
BEGIN
    -- Verificar si la columna 'role' ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        -- Agregar la columna role con valor por defecto 'user'
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
        RAISE NOTICE 'Columna role agregada exitosamente';
        
        -- Actualizar usuarios existentes con roles apropiados
        UPDATE users SET role = 'model' WHERE username LIKE 'model%';
        UPDATE users SET role = 'admin' WHERE username LIKE 'admin%' OR username = 'superadmin';
        UPDATE users SET role = 'study' WHERE username LIKE 'study%';
        
        RAISE NOTICE 'Roles asignados a usuarios existentes';
    ELSE
        RAISE NOTICE 'La columna role ya existe';
    END IF;
END $$;
