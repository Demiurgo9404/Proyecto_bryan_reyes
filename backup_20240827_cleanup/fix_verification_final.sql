-- Asegurarse de que las columnas existan y tengan los valores correctos
DO $$
BEGIN
    -- Verificar si las columnas existen, si no, crearlas
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

    -- Actualizar todos los usuarios de prueba para que estén verificados y activos
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
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al actualizar la base de datos: %', SQLERRM;
END $$;

-- Verificar los cambios
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
