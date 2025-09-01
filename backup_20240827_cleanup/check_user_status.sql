-- Verificar la estructura de la tabla users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Verificar el estado del usuario user@loverose.com
SELECT 
    id, 
    email, 
    is_verified, 
    is_active,
    created_at,
    updated_at
FROM 
    users 
WHERE 
    email = 'user@loverose.com';
