-- Verificar la estructura de la tabla users
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Verificar los usuarios de prueba
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
