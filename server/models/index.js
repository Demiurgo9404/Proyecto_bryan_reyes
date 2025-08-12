const { sequelize } = require('../config/database');
const User = require('./User.model');

// Aquí irán las relaciones entre modelos cuando las definamos

// Sincronizar todos los modelos con la base de datos
const syncModels = async () => {
  try {
    // { alter: true } actualiza las tablas sin borrar datos existentes
    // { force: true } borra y recrea las tablas (¡cuidado en producción!)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.'.green.underline);
  } catch (error) {
    console.error('Error al sincronizar modelos:'.red, error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  User,
  syncModels,
};
