const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando diagnóstico de PostgreSQL...\n');

// 1. Verificar si psql está en el PATH
exec('where psql', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ psql no encontrado en el PATH. Asegúrate de que PostgreSQL esté instalado correctamente.');
    console.log('   Ruta de instalación típica: C:\\Program Files\\PostgreSQL\\[versión]\\bin');
    console.log('   Asegúrate de que esta ruta esté en tu variable de entorno PATH.\n');
    return;
  }
  
  console.log('✅ psql encontrado en:', stdout.trim().split('\n')[0]);
  
  // 2. Verificar si el servicio está en ejecución
  console.log('\n🔄 Verificando estado del servicio PostgreSQL...');
  exec('sc query postgresql', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ No se pudo verificar el servicio PostgreSQL. Asegúrate de que esté instalado.');
      return;
    }
    
    if (stdout.includes('RUNNING')) {
      console.log('✅ Servicio PostgreSQL en ejecución');
    } else {
      console.log('⚠️  Servicio PostgreSQL no está en ejecución. Intentando iniciar...');
      exec('net start postgresql', (error, stdout, stderr) => {
        if (error) {
          console.log('❌ No se pudo iniciar el servicio PostgreSQL. Ejecuta como administrador o inícialo manualmente.');
          return;
        }
        console.log('✅ Servicio PostgreSQL iniciado correctamente');
      });
    }
  });
  
  // 3. Verificar conexión
  console.log('\n🔌 Probando conexión a PostgreSQL...');
  const config = require('./config/config.json').development;
  const { Client } = require('pg');
  
  const client = new Client({
    user: config.username,
    host: config.host,
    database: 'postgres', // Base de datos por defecto
    password: config.password,
    port: config.port,
  });
  
  client.connect()
    .then(() => {
      console.log('✅ Conexión exitosa a PostgreSQL');
      
      // 4. Verificar si la base de datos existe
      return client.query("SELECT 1 FROM pg_database WHERE datname = $1", [config.database])
        .then(res => {
          if (res.rowCount > 0) {
            console.log(`✅ La base de datos '${config.database}' existe`);
          } else {
            console.log(`⚠️  La base de datos '${config.database}' no existe. Creando...`);
            return client.query(`CREATE DATABASE ${config.database}`)
              .then(() => console.log(`✅ Base de datos '${config.database}' creada exitosamente`))
              .catch(err => console.error('❌ Error al crear la base de datos:', err.message));
          }
        });
    })
    .catch(err => {
      console.error('❌ Error de conexión a PostgreSQL:', err.message);
      console.log('\nPosibles soluciones:');
      console.log('1. Verifica que el servicio PostgreSQL esté en ejecución');
      console.log('2. Verifica el usuario y contraseña en config/config.json');
      console.log('3. Verifica que el puerto sea el correcto (por defecto 5432)');
      console.log('4. Asegúrate de que el usuario tenga los permisos necesarios');
    })
    .finally(() => {
      client.end();
      console.log('\n🔍 Diagnóstico completado. Revisa los resultados anteriores.');
    });
});
