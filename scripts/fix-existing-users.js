// Script para actualizar contraseñas de usuarios existentes
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

// Usuarios conocidos con sus contraseñas
const knownUsers = [
  { email: 'admin@loverose.com', password: 'Admin123!' },
  { email: 'user@loverose.com', password: 'User123!' },
  { email: 'model@loverose.com', password: 'Model123!' },
  { email: 'super@loverose.com', password: 'Super123!' },
  { email: 'agency@loverose.com', password: 'Agency123!' }
];

async function fixExistingUsers() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await sequelize.authenticate();
    
    console.log('🔧 Actualizando contraseñas de usuarios existentes...\n');
    
    for (const user of knownUsers) {
      try {
        // Verificar si el usuario existe
        const existingUser = await sequelize.query(`
          SELECT id, username, email FROM users WHERE email = :email
        `, { 
          replacements: { email: user.email },
          type: Sequelize.QueryTypes.SELECT
        });
        
        if (existingUser.length > 0) {
          // Actualizar contraseña con hash correcto
          await sequelize.query(`
            UPDATE users 
            SET password_hash = crypt(:password, gen_salt('bf', 10)),
                updated_at = NOW()
            WHERE email = :email
          `, { 
            replacements: { 
              password: user.password,
              email: user.email 
            }
          });
          
          console.log(`✅ ${user.email} - Contraseña actualizada`);
        } else {
          console.log(`⚠️  ${user.email} - Usuario no encontrado, omitiendo`);
        }
      } catch (error) {
        console.error(`❌ Error actualizando ${user.email}:`, error.message);
      }
    }
    
    console.log('\n🎯 Usuarios actualizados. Credenciales disponibles:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    knownUsers.forEach(user => {
      console.log(`📧 ${user.email} | 🔑 ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

fixExistingUsers();
