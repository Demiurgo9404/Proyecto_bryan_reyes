const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize('Love_rose_db', 'postgres', 'Roximar2025', {
  host: 'localhost',
  dialect: 'postgres',
  logging: console.log
});

async function checkAndCreateTables() {
  try {
    // Autenticar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Verificar si la tabla de usuarios existe
    const [results] = await sequelize.query(
      "SELECT to_regclass('public.users') as table_exists;"
    );

    if (!results[0].table_exists) {
      console.log('La tabla de usuarios no existe. Creando...');
      
      // Crear tabla de usuarios
      await sequelize.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user',
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          "emailVerified" BOOLEAN DEFAULT false,
          "lastLogin" TIMESTAMP WITH TIME ZONE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
        );
      `);
      
      console.log('✅ Tabla de usuarios creada exitosamente.');
      
      // Insertar usuario administrador por defecto
      const hashedPassword = require('bcryptjs').hashSync('admin123', 10);
      await sequelize.query(`
        INSERT INTO users (name, email, password, role, status, "emailVerified", "createdAt", "updatedAt")
        VALUES ('Admin', 'admin@example.com', '${hashedPassword}', 'admin', 'active', true, NOW(), NOW());
      `);
      
      console.log('✅ Usuario administrador creado:');
      console.log('   Email: admin@example.com');
      console.log('   Contraseña: admin123');
    } else {
      console.log('✅ La tabla de usuarios ya existe.');
      
      // Verificar si hay usuarios
      const [users] = await sequelize.query('SELECT COUNT(*) as count FROM users');
      console.log(`Número de usuarios en la base de datos: ${users[0].count}`);
      
      if (users[0].count === 0) {
        // Insertar usuario administrador por defecto si no hay usuarios
        const hashedPassword = require('bcryptjs').hashSync('admin123', 10);
        await sequelize.query(`
          INSERT INTO users (name, email, password, role, status, "emailVerified", "createdAt", "updatedAt")
          VALUES ('Admin', 'admin@example.com', '${hashedPassword}', 'admin', 'active', true, NOW(), NOW());
        `);
        
        console.log('✅ Usuario administrador creado:');
        console.log('   Email: admin@example.com');
        console.log('   Contraseña: admin123');
      } else {
        // Mostrar los primeros 5 usuarios
        const [userList] = await sequelize.query('SELECT id, name, email, role FROM users LIMIT 5');
        console.log('\nPrimeros usuarios:');
        console.table(userList);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al verificar/crear tablas:', error.message);
    
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
    
    if (error.message.includes('does not exist')) {
      console.log('\nLa base de datos no existe. Por favor, crea la base de datos primero:');
      console.log('1. Abre psql como superusuario: psql -U postgres');
      console.log('2. Ejecuta: CREATE DATABASE "Love_rose_db";');
    } else if (error.message.includes('password authentication failed')) {
      console.log('\nError de autenticación. Verifica el usuario y contraseña en el script.');
    } else if (error.message.includes('could not connect')) {
      console.log('\nNo se pudo conectar a PostgreSQL. Verifica que:');
      console.log('1. PostgreSQL esté instalado y en ejecución');
      console.log('2. El usuario y contraseña sean correctos');
      console.log('3. El puerto 5432 esté accesible');
    }
  } finally {
    await sequelize.close();
  }
}

checkAndCreateTables();
