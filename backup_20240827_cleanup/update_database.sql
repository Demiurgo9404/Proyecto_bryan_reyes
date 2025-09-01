-- 1. Actualizar la estructura de la tabla users
DO $$
BEGIN
    -- Asegurarse de que las columnas necesarias existan
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna is_verified agregada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna is_active agregada';
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
