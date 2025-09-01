-- 1. Asegurarse de que las columnas existan con los tipos correctos
DO $$
BEGIN
    -- Verificar y modificar/crear is_verified
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ALTER COLUMN is_verified SET DEFAULT true;
        ALTER TABLE users ALTER COLUMN is_verified SET NOT NULL;
    ELSE
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- Verificar y modificar/crear is_active
    IF EXISTS (SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
        ALTER TABLE users ALTER COLUMN is_active SET NOT NULL;
    ELSE
        ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;

    -- Actualizar todos los usuarios de prueba
    UPDATE users 
    SET 
        is_verified = true,
        is_active = true,
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
    email, 
    username, 
    role, 
    is_verified, 
    is_active, 
    created_at, 
    updated_at 
FROM 
    users 
WHERE 
    email IN (
        'super@loverose.com',
        'admin@loverose.com',
        'agency@loverose.com',
        'model@loverose.com',
        'user@loverose.com'
    )
ORDER BY 
    email;
