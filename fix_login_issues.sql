-- 1. Eliminar restricciones duplicadas
DO $$
DECLARE
    r RECORD;
    constraint_names TEXT[] := ARRAY[]::TEXT[];
    constraint_name TEXT;
BEGIN
    -- Eliminar restricciones UNIQUE duplicadas para email
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND contype = 'u' 
        AND conname LIKE 'users_email_key%'
        ORDER BY conname
        OFFSET 1
    LOOP
        constraint_names := array_append(constraint_names, r.conname);
    END LOOP;
    
    -- Eliminar restricciones UNIQUE duplicadas para username
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND contype = 'u' 
        AND conname LIKE 'users_username_key%'
        ORDER BY conname
        OFFSET 1
    LOOP
        constraint_names := array_append(constraint_names, r.conname);
    END LOOP;
    
    -- Eliminar claves foráneas duplicadas
    FOR r IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'users'::regclass 
        AND contype = 'f' 
        AND conname LIKE 'users_role_id_fkey%'
        ORDER BY conname
        OFFSET 1
    LOOP
        constraint_names := array_append(constraint_names, r.conname);
    END LOOP;
    
    -- Ejecutar la eliminación de restricciones
    FOREACH constraint_name IN ARRAY constraint_names
    LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || constraint_name || ';';
        RAISE NOTICE 'Eliminada restricción: %', constraint_name;
    END LOOP;
    
    -- Agregar columnas faltantes si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'status') THEN
        ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active' NOT NULL;
        RAISE NOTICE 'Columna status agregada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'email_verified') THEN
        ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna email_verified agregada';
    END IF;
    
    -- Actualizar usuarios de prueba
    UPDATE users 
    SET 
        status = 'active',
        email_verified = true,
        updated_at = NOW()
    WHERE email IN (
        'super@loverose.com',
        'admin@loverose.com',
        'agency@loverose.com',
        'model@loverose.com',
        'user@loverose.com'
    );
    
    RAISE NOTICE 'Usuarios actualizados correctamente';
END $$;

-- 2. Verificar estructura final de la tabla
\d+ users

-- 3. Verificar datos de usuarios
SELECT id, username, email, status, email_verified, created_at, updated_at 
FROM users 
WHERE email IN (
    'super@loverose.com',
    'admin@loverose.com',
    'agency@loverose.com',
    'model@loverose.com',
    'user@loverose.com'
);
