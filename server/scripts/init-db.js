require('dotenv').config();
const { sequelize } = require('../config/database');
const { syncModels } = require('../models');
const colors = require('colors');

const initDatabase = async () => {
  try {
    console.log('Inicializando base de datos...'.yellow);
    
    // Autenticar la conexión a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a PostgreSQL establecida correctamente.'.green);
    
    // Sincronizar todos los modelos con la base de datos
    await syncModels();
    
    console.log('Base de datos inicializada correctamente.'.green.bold);
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar la base de datos:'.red, error);
    process.exit(1);
  }
};

// Ejecutar la inicialización
initDatabase();
