const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  database: 'love_rose_db',
  username: 'postgres',
  password: 'Roximar2025',
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log
});

async function checkUser() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    const [results] = await sequelize.query(
      'SELECT id, email, role, is_active, is_verified FROM users WHERE email = :email',
      {
        replacements: { email: 'model@loverose.com' },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (results) {
      console.log('Usuario encontrado:');
      console.log(`ID: ${results.id}`);
      console.log(`Email: ${results.email}`);
      console.log(`Rol: ${results.role}`);
      console.log(`¿Activo?: ${results.is_active ? 'Sí' : 'No'}`);
      console.log(`¿Verificado?: ${results.is_verified ? 'Sí' : 'No'}`);
    } else {
      console.log('No se encontró el usuario con el correo model@loverose.com');
    }
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

checkUser();
