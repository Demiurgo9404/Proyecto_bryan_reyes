// Script para crear usuario de prueba con contraseña conocida
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');
const config = require('../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  dialect: dbConfig.dialect,
  logging: false
});

async function createTestUser() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    
    // Crear usuario de prueba con contraseña conocida
    const email = 'test@loverose.com';
    const password = 'Test123!';
    const username = 'testuser';
    
    console.log(`👤 Creando usuario de prueba: ${username}`);
    
    // Eliminar usuario si existe
    await sequelize.query(`
      DELETE FROM users WHERE email = :email
    `, { replacements: { email } });
    
    // Crear usuario con contraseña hasheada usando pgcrypto
    await sequelize.query(`
      INSERT INTO users (id, username, email, password_hash, is_active, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        :username,
        :email,
        crypt(:password, gen_salt('bf', 10)),
        true,
        NOW(),
        NOW()
      )
    `, { 
      replacements: { username, email, password }
    });
    
    // Asignar rol de usuario
    await sequelize.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT u.id, r.id
      FROM users u, roles r
      WHERE u.email = :email AND r.name = 'user'
    `, { replacements: { email } });
    
    console.log('✅ Usuario de prueba creado exitosamente');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log('🎯 Usa estas credenciales para hacer login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

createTestUser();
