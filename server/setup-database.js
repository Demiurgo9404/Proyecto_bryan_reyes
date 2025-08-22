const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Base de datos por defecto
  port: 5432,
};

const dbName = 'Love_rose_db';

async function setupDatabase() {
  console.log('🔧 Configurando la base de datos...');
  
  // 1. Conectar a la base de datos postgres
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado al servidor PostgreSQL');

    // 2. Verificar si la base de datos existe
    const dbCheck = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, 
      [dbName]
    );

    if (dbCheck.rowCount === 0) {
      // 3. Crear la base de datos si no existe
      console.log(`🔄 Creando la base de datos '${dbName}'...`);
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Base de datos '${dbName}' creada exitosamente`);
    } else {
      console.log(`✅ La base de datos '${dbName}' ya existe`);
    }

    // 4. Conectar a la base de datos recién creada
    await client.end();
    const dbClient = new Client({ ...config, database: dbName });
    await dbClient.connect();

    // 5. Crear tablas necesarias
    console.log('🔄 Creando tablas...');
    await createTables(dbClient);
    
    console.log('\n✨ Configuración completada exitosamente!');
    console.log('Puedes continuar con el desarrollo de las dashboards.');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
  } finally {
    await client.end();
  }
}

async function createTables(client) {
  // Tabla de usuarios (si no existe)
  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ Tabla de usuarios verificada/creada');

  // Tabla de productos (paquetes de monedas)
  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      coins INTEGER NOT NULL,
      price DECIMAL(10, 2) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ Tabla de productos verificada/creada');

  // Tabla de ofertas
  await client.query(`
    CREATE TABLE IF NOT EXISTS offers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      discount_type VARCHAR(20) NOT NULL,
      discount_value DECIMAL(10, 2) NOT NULL,
      product_id UUID REFERENCES products(id) ON DELETE CASCADE,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ Tabla de ofertas verificada/creada');

  // Tabla de transacciones
  await client.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      product_id UUID REFERENCES products(id) ON DELETE SET NULL,
      offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
      amount DECIMAL(10, 2) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      payment_method VARCHAR(50),
      payment_id VARCHAR(100),
      ip_address VARCHAR(45),
      user_agent TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('✅ Tabla de transacciones verificada/creada');

  // Insertar datos de ejemplo si las tablas están vacías
  await seedInitialData(client);
}

async function seedInitialData(client) {
  // Verificar si ya hay usuarios
  const users = await client.query('SELECT 1 FROM users LIMIT 1');
  if (users.rowCount === 0) {
    console.log('🌱 Insertando datos iniciales...');
    
    // Insertar usuario administrador
    await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ('admin', 'admin@loverose.com', '$2b$10$XlQx71EFJ4lGxSDoH/nk8eYvJZvJtZJZvZJZvZJZvZJZvZJZvZJZv', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);

    // Insertar productos de ejemplo
    await client.query(`
      INSERT INTO products (name, description, coins, price, is_active)
      VALUES 
        ('Paquete Básico', '100 monedas', 100, 4.99, true),
        ('Paquete Estándar', '300 monedas', 300, 12.99, true),
        ('Paquete Premium', '1000 monedas', 1000, 29.99, true)
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ Datos iniciales insertados');
  }
}

// Ejecutar la configuración
setupDatabase();
