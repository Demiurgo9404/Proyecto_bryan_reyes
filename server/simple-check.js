const { Client } = require('pg');
const config = require('./config/config.json').development;

console.log('🔍 Probando conexión a PostgreSQL...');

const client = new Client({
  user: config.username,
  host: config.host,
  database: 'postgres',
  password: config.password,
  port: config.port,
});

client.connect()
  .then(() => {
    console.log('✅ ¡Conexión exitosa a PostgreSQL!');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('📌 Versión de PostgreSQL:', res.rows[0].version);
    return client.query("SELECT 1 AS result");
  })
  .then(() => {
    console.log('✅ La consulta básica funcionó correctamente');
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    console.log('\n🔧 Solución de problemas:');
    console.log(`1. Verifica que PostgreSQL esté instalado y en ejecución`);
    console.log(`2. Revisa las credenciales en config/config.json`);
    console.log(`3. Usuario: ${config.username}`);
    console.log(`4. Puerto: ${config.port}`);
    console.log(`5. Host: ${config.host}`);
  })
  .finally(() => {
    client.end();
  });
