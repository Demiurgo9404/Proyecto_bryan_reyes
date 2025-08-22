const { Client } = require('pg');

const config = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Roximar2025',
  port: 5432,
};

console.log('🔍 Probando conexión directa a PostgreSQL...');
console.log('Configuración:', JSON.stringify(config, null, 2));

const client = new Client(config);

client.connect()
  .then(() => {
    console.log('✅ ¡Conexión exitosa a PostgreSQL!');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('📌 Versión de PostgreSQL:', res.rows[0].version);
    return client.query('SELECT datname FROM pg_database');
  })
  .then(res => {
    console.log('\n📊 Bases de datos disponibles:');
    res.rows.forEach(db => console.log(`- ${db.datname}`));
  })
  .catch(err => {
    console.error('❌ Error de conexión:', err.message);
    console.log('\n🔧 Solución de problemas:');
    console.log('1. Verifica que PostgreSQL esté instalado y en ejecución');
    console.log('2. Verifica las credenciales en el código');
    console.log('3. Verifica que el puerto sea el correcto (por defecto 5432)');
    console.log('4. Verifica que el usuario tenga permisos para conectarse');
  })
  .finally(() => {
    client.end();
  });
