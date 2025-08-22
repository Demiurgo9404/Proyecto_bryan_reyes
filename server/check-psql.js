const { exec } = require('child_process');

// Verificar si psql está en el PATH
exec('where psql', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ psql no está en el PATH. Asegúrate de que la carpeta bin de PostgreSQL esté en el PATH.');
    console.log('Ruta típica: C:\\Program Files\\PostgreSQL\\17\\bin');
    return;
  }
  console.log('✅ psql encontrado en:', stdout.trim());
  
  // Intentar conectar con psql
  const command = 'psql -U postgres -c "SELECT version();"';
  console.log('\n🔍 Ejecutando:', command);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error al conectar con psql:', error.message);
      console.log('\n🔧 Solución de problemas:');
      console.log('1. Asegúrate de que el servicio de PostgreSQL esté en ejecución');
      console.log('2. Verifica que el usuario y contraseña sean correctos');
      console.log('3. Intenta conectar manualmente con: psql -U postgres');
      return;
    }
    console.log('✅ Conexión exitosa a PostgreSQL');
    console.log('Salida:', stdout);
  });
});
