-- Crear extensión pgcrypto si no existe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Función para crear un usuario con contraseña hasheada
CREATE OR REPLACE FUNCTION create_user(
    p_username VARCHAR,
    p_email VARCHAR,
    p_password VARCHAR,
    p_role_name VARCHAR
) RETURNS VOID AS $$
DECLARE
    v_role_id UUID;
    v_user_id UUID;
BEGIN
    -- Obtener el ID del rol
    SELECT id INTO v_role_id FROM roles WHERE name = p_role_name;
    
    IF v_role_id IS NULL THEN
        RAISE EXCEPTION 'Rol % no encontrado', p_role_name;
    END IF;
    
    -- Insertar el usuario
    INSERT INTO users (id, username, email, password, role_id, created_at, updated_at)
    VALUES (
        gen_random_uuid(),
        p_username,
        p_email,
        crypt(p_password, gen_salt('bf', 10)),
        v_role_id,
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        role_id = EXCLUDED.role_id,
        updated_at = NOW();
        
    RAISE NOTICE 'Usuario % creado/actualizado con rol %', p_username, p_role_name;
END;
$$ LANGUAGE plpgsql;

-- Crear los usuarios de prueba
SELECT create_user('superuser', 'super@loverose.com', 'Super123!', 'admin');
SELECT create_user('admin', 'admin@loverose.com', 'Admin123!', 'admin');
SELECT create_user('agencia_demo', 'agency@loverose.com', 'Agency123!', 'agency');
SELECT create_user('modelo_demo', 'model@loverose.com', 'Model123!', 'model');
SELECT create_user('usuario_demo', 'user@loverose.com', 'User123!', 'user');

-- Verificar usuarios creados
SELECT u.id, u.username, u.email, r.name as role 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email IN (
    'super@loverose.com',
    'admin@loverose.com',
    'agency@loverose.com',
    'model@loverose.com',
    'user@loverose.com'
);
