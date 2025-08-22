-- 1. Verificar si la tabla users existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public' 
   AND    table_name   = 'users'
);

-- 2. Verificar columnas de la tabla users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users';

-- 3. Agregar columnas faltantes si no existen
DO $$
BEGIN
    -- Verificar y agregar is_verified si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_verified'
    ) THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Columna is_verified agregada';
    END IF;

    -- Verificar y agregar is_active si no existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        RAISE NOTICE 'Columna is_active agregada';
    END IF;
END $$;

-- 4. Verificar si el usuario de prueba existe
SELECT * FROM users WHERE email = 'user@loverose.com';

-- 5. Crear o actualizar el usuario de prueba
INSERT INTO users (
    id,
    email,
    password,
    username,
    role,
    is_verified,
    is_active,
    created_at,
    updated_at
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'user@loverose.com',
    -- Contraseña: User123! (hasheada con bcrypt)
    '$2a$10$XFDq3L7v4LdJ3H5p5n8G1OQJ1hJ3Zv5W8nUzXKjKvxY7dJ2mN3p4C',
    'usuario_prueba',
    'user',
    true,
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) 
DO UPDATE SET
    is_verified = true,
    is_active = true,
    updated_at = NOW()
RETURNING *;

-- 6. Verificar los cambios
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
    email = 'user@loverose.com';
