-- 1. Eliminar restricciones duplicadas
DO $$
BEGIN
    -- Eliminar restricciones UNIQUE duplicadas para email
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key1';
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key2';
    
    -- Eliminar restricciones UNIQUE duplicadas para username
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key1';
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key2';
    
    -- Eliminar claves foráneas duplicadas
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_id_fkey1';
    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_id_fkey2';
    
    -- Agregar columna role si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
    END IF;
    
    -- Agregar columnas faltantes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    
    -- Actualizar usuarios de prueba
    UPDATE users 
    SET 
        is_verified = true,
        is_active = true,
        role = CASE 
            WHEN email = 'super@loverose.com' THEN 'admin'
            WHEN email = 'admin@loverose.com' THEN 'admin'
            WHEN email = 'agency@loverose.com' THEN 'agency'
            WHEN email = 'model@loverose.com' THEN 'model'
            ELSE 'user'
        END,
        updated_at = NOW()
    WHERE email IN (
        'super@loverose.com',
        'admin@loverose.com',
        'agency@loverose.com',
        'model@loverose.com',
        'user@loverose.com'
    );
    
    RAISE NOTICE 'Base de datos actualizada correctamente';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al actualizar la base de datos: %', SQLERRM;
END $$;

-- 2. Verificar los cambios
SELECT 
    id, 
    username, 
    email, 
    role,
    is_verified,
    is_active,
    created_at, 
    updated_at 
FROM users 
WHERE email IN (
    'super@loverose.com',
    'admin@loverose.com',
    'agency@loverose.com',
    'model@loverose.com',
    'user@loverose.com'
);
