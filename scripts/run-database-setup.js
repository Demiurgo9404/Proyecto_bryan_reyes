const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Ejecutando configuración de base de datos...');

const scriptPath = path.join(__dirname, 'setup-database-fixed.js');

exec(`node "${scriptPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error ejecutando script:', error);
    return;
  }
  
  if (stderr) {
    console.error('⚠️ Stderr:', stderr);
  }
  
  console.log(stdout);
  console.log('✅ Script ejecutado');
});
