const { execSync } = require('child_process');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME || 'love_rose_db';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Roximar2025';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || '5432';

function runCommand(command) {
  try {
    console.log(`Ejecutando: ${command}`);
    const result = execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error ejecutando comando: ${command}`, error);
    return false;
  }
}

// Verificar si la base de datos existe
console.log('Verificando si la base de datos existe...');
const dbExists = runCommand(`psql -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} -d ${DB_NAME} -c "SELECT 1"`);

if (!dbExists) {
  console.log('La base de datos no existe. Creando...');
  const createdb = runCommand(`createdb -U ${DB_USER} -h ${DB_HOST} -p ${DB_PORT} ${DB_NAME}`);
  if (!createdb) {
    console.error('No se pudo crear la base de datos. Verifica los permisos y la conexión.');
    process.exit(1);
  }
}

// Instalar dependencias si no están instaladas
console.log('Instalando dependencias...');
runCommand('npm install sequelize-cli pg pg-hstore --save-dev');

// Configurar variables de entorno para Sequelize CLI
process.env.NODE_ENV = 'development';
process.env.SEQUELIZE_PATH = 'node_modules/.bin/sequelize';

// Ejecutar migraciones
console.log('Ejecutando migraciones...');
const migrations = runCommand('npx sequelize-cli db:migrate');

if (!migrations) {
  console.error('Error al ejecutar las migraciones');
  process.exit(1);
}

console.log('¡Base de datos configurada correctamente!');
