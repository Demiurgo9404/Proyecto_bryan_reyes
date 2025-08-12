const { app, server } = require('./app');
const colors = require('colors');
const { sequelize, testConnection } = require('./config/database');

// Configuración del puerto
const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar la conexión a la base de datos
    await testConnection();
    
    // Sincronizar modelos con la base de datos (esto crea las tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.'.green.underline);
    
    // Iniciar el servidor
    server.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`.yellow.bold);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:'.red, error);
    process.exit(1);
  }
};

// Iniciar la aplicación
startServer();

// Manejar errores de promesas no manejadas
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error no manejado: ${err.message}`.red);
  console.error(err.stack);
  // Cerrar el servidor y salir del proceso
  server.close(() => process.exit(1));
});

// Manejar excepciones no capturadas
process.on('uncaughtException', (err) => {
  console.error(`Excepción no capturada: ${err.message}`.red);
  console.error(err.stack);
  // Cerrar el servidor y salir del proceso
  server.close(() => process.exit(1));
});

// Manejar la señal de terminación
process.on('SIGTERM', () => {
  console.log('Recibida señal SIGTERM. Cerrando servidor...'.yellow);
  server.close(() => {
    console.log('Servidor cerrado.'.yellow);
    process.exit(0);
  });
});

// Manejar la señal de terminación (Ctrl+C)
process.on('SIGINT', () => {
  console.log('Apagando el servidor...'.yellow);
  server.close(() => {
    console.log('Servidor cerrado.'.red);
    process.exit(0);
  });
});
