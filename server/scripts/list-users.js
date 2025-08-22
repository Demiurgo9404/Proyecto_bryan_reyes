const { sequelize, User } = require('../models');
const bcrypt = require('bcryptjs');

async function listUsers() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    const users = await User.findAll({
      attributes: ['id', 'email', 'password', 'isActive', 'isVerified', 'role'],
      raw: true
    });
    
    console.log('\nUsuarios en la base de datos:');
    console.table(users);
    
    if (users.length > 0) {
      console.log('\nNota: Las contraseñas están hasheadas. Usa el script create-admin-user.js para crear un nuevo usuario si es necesario.');
    } else {
      console.log('\nNo hay usuarios en la base de datos. Usa el script create-admin-user.js para crear un usuario administrador.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    process.exit(1);
  }
}

listUsers();
