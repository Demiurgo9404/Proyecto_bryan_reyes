-- 1. Asegurarse de que las columnas necesarias existan
DO $$
BEGIN
    -- Verificar y agregar columnas si no existen
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
    
    RAISE NOTICE 'Usuarios actualizados correctamente';
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

-- 3. Verificar si hay triggers que puedan estar afectando
SELECT trigger_name, event_manipulation, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users';
