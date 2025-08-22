const { Client } = require('pg');

console.log('🔍 Probando conexión a PostgreSQL...');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  port: 5432,
  connectionTimeoutMillis: 5000, // 5 segundos de timeout
});

client.connect()
  .then(() => {
    console.log('✅ ¡Conexión exitosa a PostgreSQL!');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('📌 Versión de PostgreSQL:', res.rows[0].version);
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
  })
  .finally(() => {
    client.end();
    console.log('🔌 Conexión cerrada');
  });
