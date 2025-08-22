const { sequelize } = require('./server/config/database');

async function syncModels() {
  try {
    // Forzar la sincronización de todos los modelos
    await sequelize.sync({ force: false, alter: true });
    console.log('Modelos sincronizados exitosamente');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
  } finally {
    await sequelize.close();
  }
}

syncModels();
