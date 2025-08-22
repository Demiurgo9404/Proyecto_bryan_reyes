const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Iniciando diagnóstico de PostgreSQL...\n');

// 1. Verificar si el servicio está en ejecución
console.log('1. Verificando estado del servicio PostgreSQL...');
exec('sc query postgresql-x64-17', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ No se pudo verificar el estado del servicio:', error.message);
  } else {
    console.log('✅ Estado del servicio:', stdout.includes('RUNNING') ? 'En ejecución' : 'Detenido');
  }

  // 2. Verificar configuración de red
  console.log('\n2. Verificando configuración de red...');
  const pgHbaPath = 'C:\\Program Files\\PostgreSQL\\17\\data\\pg_hba.conf';
  
  if (fs.existsSync(pgHbaPath)) {
    const pgHbaContent = fs.readFileSync(pgHbaPath, 'utf8');
    const hasTrustLocal = pgHbaContent.includes('local   all             all                                     trust');
    const hasTrustHost = pgHbaContent.includes('host    all             all             127.0.0.1/32            trust');
    
    console.log('   - Archivo pg_hba.conf encontrado');
    console.log(`   - Configuración local trust: ${hasTrustLocal ? '✅' : '❌'}`);
    console.log(`   - Configuración host trust: ${hasTrustHost ? '✅' : '❌'}`);
  } else {
    console.error('❌ No se encontró el archivo pg_hba.conf');
  }

  // 3. Verificar si el puerto está en uso
  console.log('\n3. Verificando puerto 5432...');
  exec('netstat -ano | findstr :5432', (error, stdout, stderr) => {
    if (stdout) {
      console.log('✅ Puerto 5432 está en uso:');
      console.log(stdout);
    } else {
      console.log('⚠️  No se detectó actividad en el puerto 5432');
    }

    // 4. Intentar conexión con psql
    console.log('\n4. Probando conexión con psql...');
    const psqlCommand = 'psql -U postgres -c "SELECT version();"';
    console.log(`   Ejecutando: ${psqlCommand}`);
    
    // Configurar variables de entorno para la contraseña
    const env = { ...process.env, PGPASSWORD: 'Roximar2025' };
    
    exec(psqlCommand, { env }, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error al conectar con psql:', error.message);
        console.log('\n🔧 Posibles soluciones:');
        console.log('1. Verifica que el servicio PostgreSQL esté en ejecución');
        console.log('2. Asegúrate de que el usuario y contraseña sean correctos');
        console.log('3. Verifica que el puerto 5432 esté abierto en el firewall');
        console.log('4. Intenta conectar manualmente con: psql -U postgres -h localhost -p 5432');
      } else {
        console.log('✅ Conexión exitosa a PostgreSQL');
        console.log('   Versión:', stdout.trim());
      }
    });
  });
});
