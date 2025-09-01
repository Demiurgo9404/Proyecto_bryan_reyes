// Test script para verificar carga de variables de entorno
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

console.log('=== TEST DE VARIABLES DE ENTORNO ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'CARGADO ✅' : 'NO ENCONTRADO ❌');
console.log('DB_HOST:', process.env.DB_HOST || 'NO ENCONTRADO');
console.log('DB_NAME:', process.env.DB_NAME || 'NO ENCONTRADO');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NO ENCONTRADO');
console.log('=======================================');

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET no está definido. Verifica el archivo .env');
  process.exit(1);
} else {
  console.log('✅ Variables de entorno cargadas correctamente');
}
