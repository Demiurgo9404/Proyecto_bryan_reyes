-- Script para arreglar permisos de base de datos
-- Ejecutar como superusuario de PostgreSQL

-- Crear tabla user_follows si no existe
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    followed_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, followed_id)
);

-- Otorgar permisos completos al usuario de la aplicación
GRANT ALL PRIVILEGES ON TABLE user_follows TO postgres;
GRANT ALL PRIVILEGES ON TABLE users TO postgres;

-- Si existe un usuario específico de la aplicación, otorgar permisos también
-- Reemplazar 'app_user' con el nombre real del usuario de la aplicación
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
        GRANT ALL PRIVILEGES ON TABLE user_follows TO app_user;
        GRANT ALL PRIVILEGES ON TABLE users TO app_user;
    END IF;
END
$$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_followed ON user_follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insertar datos de prueba si la tabla está vacía
INSERT INTO user_follows (follower_id, followed_id)
SELECT 
    u1.id as follower_id,
    u2.id as followed_id
FROM users u1
CROSS JOIN users u2
WHERE u1.id != u2.id 
    AND u2.role = 'model'
    AND NOT EXISTS (
        SELECT 1 FROM user_follows 
        WHERE follower_id = u1.id AND followed_id = u2.id
    )
LIMIT 10
ON CONFLICT (follower_id, followed_id) DO NOTHING;
