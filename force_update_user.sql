-- Forzar la actualización del usuario
UPDATE users 
SET 
    is_verified = true,
    is_active = true,
    updated_at = NOW()
WHERE email = 'user@loverose.com';

-- Verificar los cambios
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
