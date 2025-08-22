-- Verificar estructura de la tabla users
\d users

-- Verificar datos de usuarios de prueba
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

-- Verificar si hay algún trigger o función que pueda estar afectando
SELECT trigger_name, event_manipulation, event_object_table, action_statement 
FROM information_schema.triggers 
WHERE event_object_table = 'users';
