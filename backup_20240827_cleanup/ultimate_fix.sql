-- 1. Forzar la actualización de los usuarios
UPDATE users SET 
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

-- 3. Verificar si hay restricciones o triggers que puedan estar afectando
SELECT conname, contype, convalidated, conkey, confkey 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;

-- 4. Verificar si hay índices únicos que puedan estar causando problemas
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'users' AND indexname LIKE '%unique%';

-- 5. Verificar si hay reglas o políticas de seguridad
SELECT * FROM pg_policies WHERE tablename = 'users';

-- 6. Verificar si hay reglas (rules) en la tabla
SELECT rulename, definition FROM pg_rules WHERE tablename = 'users';
