-- Verificar si existe la columna isVerified
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'isVerified';

-- Agregar la columna isVerified si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'isVerified'
    ) THEN
        ALTER TABLE users ADD COLUMN isVerified BOOLEAN DEFAULT false;
        RAISE NOTICE 'Columna isVerified agregada';
    END IF;
END $$;

-- Actualizar todos los usuarios para que estén verificados
UPDATE users 
SET 
    isVerified = true,
    status = 'active',
    email_verified = true,
    updated_at = NOW()
WHERE email IN (
    'super@loverose.com',
    'admin@loverose.com',
    'agency@loverose.com',
    'model@loverose.com',
    'user@loverose.com'
);

-- Verificar los cambios
SELECT id, username, email, isVerified, status, email_verified, created_at, updated_at 
FROM users 
WHERE email IN (
    'super@loverose.com',
    'admin@loverose.com',
    'agency@loverose.com',
    'model@loverose.com',
    'user@loverose.com'
);
