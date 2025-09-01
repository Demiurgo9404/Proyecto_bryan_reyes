// Quick database setup execution
const { spawn } = require('child_process');
const path = require('path');

console.log('🔧 Ejecutando configuración rápida de base de datos...');

const setupScript = path.join(__dirname, 'setup-database-fixed.js');
const child = spawn('node', [setupScript], {
  stdio: 'inherit',
  cwd: path.dirname(__dirname)
});

child.on('close', (code) => {
  console.log(`\n📊 Proceso terminado con código: ${code}`);
  if (code === 0) {
    console.log('✅ Base de datos configurada exitosamente');
    console.log('🚀 Ahora puedes reiniciar el backend con: npm start');
  } else {
    console.log('❌ Error en la configuración');
  }
});
