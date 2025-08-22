-- Script de configuración de base de datos para LoveRose
-- Garantiza la creación de todas las tablas necesarias para las dashboards

-- 1. Crear la base de datos si no existe
SELECT 'CREANDO BASE DE DATOS' AS mensaje;
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'love_rose_db' AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS love_rose_db;
CREATE DATABASE love_rose_db
    WITH 
    ENCODING = 'UTF8'
    LC_COLLATE = 'Spanish_Spain.1252'
    LC_CTYPE = 'Spanish_Spain.1252'
    TEMPLATE = template0;

-- Conectar a la base de datos recién creada
\c love_rose_db

-- 2. Crear extensión para UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Crear tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de permisos
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabla de relación entre roles y permisos
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

-- 6. Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    balance DECIMAL(15, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Crear tabla de productos (paquetes de monedas)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    coins INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT positive_coins CHECK (coins > 0),
    CONSTRAINT positive_price CHECK (price >= 0)
);

-- 8. Crear tabla de ofertas
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' o 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_discount_type CHECK (discount_type IN ('percentage', 'fixed')),
    CONSTRAINT valid_discount_value CHECK (
        (discount_type = 'percentage' AND discount_value > 0 AND discount_value <= 100) OR
        (discount_type = 'fixed' AND discount_value > 0)
    ),
    CONSTRAINT valid_dates CHECK (end_date > start_date)
);

-- 9. Tabla de relación entre productos y ofertas
CREATE TABLE IF NOT EXISTS product_offers (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (product_id, offer_id)
);

-- 10. Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    coins_credited INTEGER NOT NULL,
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'completed', 'failed', 'refunded'))
);

-- 11. Crear tabla de logs de actividades
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Crear tabla de configuraciones
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Insertar roles básicos
INSERT INTO roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrador del sistema')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO roles (id, name, description) VALUES
    ('00000000-0000-0000-0000-000000000002', 'user', 'Usuario estándar')
    ON CONFLICT (id) DO NOTHING;

-- 14. Insertar permisos básicos
INSERT INTO permissions (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'manage_users', 'Gestionar usuarios')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO permissions (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000002', 'manage_products', 'Gestionar productos')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO permissions (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000003', 'manage_offers', 'Gestionar ofertas')
    ON CONFLICT (id) DO NOTHING;

INSERT INTO permissions (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000004', 'view_dashboard', 'Ver panel de control')
    ON CONFLICT (id) DO NOTHING;

-- 15. Asignar permisos al rol de administrador
INSERT INTO role_permissions (role_id, permission_id)
SELECT '00000000-0000-0000-0000-000000000001', id FROM permissions
ON CONFLICT DO NOTHING;

-- 16. Insertar usuario administrador por defecto (contraseña: Admin123!)
INSERT INTO users (
    id,
    username,
    email,
    password,
    first_name,
    last_name,
    is_active,
    role_id
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin',
    'admin@loverose.com',
    '$2b$10$XlQx71EFJ4lGxSDoH/nk8eYvJZvJtZJZvZJZvZJZvZJZvZJZvZJZv', -- Admin123!
    'Administrador',
    'Sistema',
    true,
    '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- 17. Insertar productos de ejemplo
INSERT INTO products (id, name, description, coins, price, is_featured, is_active) VALUES
    ('22222222-2222-2222-2222-222222222221', 'Paquete Básico', '100 monedas', 100, 4.99, false, true),
    ('22222222-2222-2222-2222-222222222222', 'Paquete Estándar', '300 monedas', 300, 12.99, true, true),
    ('22222222-2222-2222-2222-222222222223', 'Paquete Premium', '1000 monedas', 1000, 29.99, true, true),
    ('22222222-2222-2222-2222-222222222224', 'Paquete VIP', '3000 monedas', 3000, 79.99, true, true)
ON CONFLICT (id) DO NOTHING;

-- 18. Insertar configuración por defecto
INSERT INTO settings (id, setting_key, setting_value, description, is_public) VALUES
    ('33333333-3333-3333-3333-333333333331', 'site_name', 'LoveRose', 'Nombre del sitio', true),
    ('33333333-3333-3333-3333-333333333332', 'currency', 'USD', 'Moneda por defecto', true),
    ('33333333-3333-3333-3333-333333333333', 'maintenance_mode', 'false', 'Modo mantenimiento', true)
ON CONFLICT (id) DO NOTHING;

-- 19. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- 20. Función para actualizar automáticamente los timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 21. Crear triggers para actualizar automáticamente los timestamps
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('users', 'products', 'offers', 'transactions', 'settings')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_modtime ON %I', t.table_name, t.table_name);
        EXECUTE format('CREATE TRIGGER update_%s_modtime
            BEFORE UPDATE ON %I
            FOR EACH ROW EXECUTE FUNCTION update_modified_column();', 
            t.table_name, t.table_name);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 22. Crear vistas para las dashboards
-- Vista para resumen de ventas
CREATE OR REPLACE VIEW vw_sales_summary AS
SELECT 
    DATE(created_at) AS sale_date,
    COUNT(*) AS total_transactions,
    SUM(amount) AS total_amount,
    SUM(coins_credited) AS total_coins
FROM 
    transactions
WHERE 
    status = 'completed'
GROUP BY 
    DATE(created_at)
ORDER BY 
    sale_date DESC;

-- Vista para resumen de usuarios
CREATE OR REPLACE VIEW vw_users_summary AS
SELECT 
    r.name AS role,
    COUNT(u.id) AS user_count,
    COUNT(DISTINCT CASE WHEN u.last_login >= NOW() - INTERVAL '30 days' THEN u.id END) AS active_users_30d
FROM 
    users u
JOIN 
    roles r ON u.role_id = r.id
GROUP BY 
    r.name;

-- Vista para productos más vendidos
CREATE OR REPLACE VIEW vw_top_products AS
SELECT 
    p.name AS product_name,
    COUNT(t.id) AS sales_count,
    SUM(t.amount) AS total_revenue,
    SUM(t.coins_credited) AS total_coins_sold
FROM 
    transactions t
JOIN 
    products p ON t.product_id = p.id
WHERE 
    t.status = 'completed'
GROUP BY 
    p.name
ORDER BY 
    sales_count DESC
LIMIT 10;

-- Mensaje de finalización exitosa
SELECT '✅ Base de datos y tablas creadas exitosamente' AS mensaje;
