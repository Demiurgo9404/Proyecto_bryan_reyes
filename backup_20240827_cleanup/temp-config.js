// Archivo temporal para configurar variables de entorno
process.env.NODE_ENV = 'development';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'Roximar2025';
process.env.DB_NAME = 'Love_rose_db';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';

// Ejecutar las migraciones
const { execSync } = require('child_process');

console.log('Ejecutando migraciones...');
try {
  const output = execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  console.log('Migraciones ejecutadas correctamente');
} catch (error) {
  console.error('Error al ejecutar migraciones:', error.message);
}

console.log('\nEjecutando seeders...');
try {
  const output = execSync('npx sequelize-cli db:seed:all', { stdio: 'inherit' });
  console.log('Seeders ejecutados correctamente');
} catch (error) {
  console.error('Error al ejecutar seeders:', error.message);
}
