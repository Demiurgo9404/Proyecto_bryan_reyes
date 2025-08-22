-- 1. Corregir estructura de la tabla users
DO $$
BEGIN
    -- Agregar columnas faltantes si no existen
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna is_verified agregada';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
        RAISE NOTICE 'Columna is_active agregada';
    END IF;

    -- Actualizar usuarios de prueba
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
    
    RAISE NOTICE 'Usuarios actualizados correctamente';
END $$;

-- 2. Verificar cambios
SELECT 
    id, 
    username, 
    email, 
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
