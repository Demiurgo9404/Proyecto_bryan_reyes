const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando dependencias...\n');

// Verificar package.json
const pkgPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(pkgPath)) {
  console.error('❌ No se encontró package.json');
  process.exit(1);
}

const pkg = require(pkgPath);
console.log('📦 Dependencias requeridas:');
const requiredDeps = ['pg', 'sequelize', 'dotenv'];
const missingDeps = [];

requiredDeps.forEach(dep => {
  if (!pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]) {
    missingDeps.push(dep);
    console.log(`❌ Falta: ${dep}`);
  } else {
    console.log(`✅ ${dep} está instalado`);
  }
});

if (missingDeps.length > 0) {
  console.log('\n🚀 Instalando dependencias faltantes...');
  const { execSync } = require('child_process');
  try {
    execSync(`npm install ${missingDeps.join(' ')} --save`, { stdio: 'inherit' });
    console.log('\n✅ Dependencias instaladas correctamente');
  } catch (error) {
    console.error('❌ Error al instalar dependencias:', error.message);
    process.exit(1);
  }
} else {
  console.log('\n✅ Todas las dependencias están instaladas');
}

// Verificar archivo .env
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('\n⚠️  No se encontró el archivo .env. Creando uno por defecto...');
  fs.writeFileSync(envPath, `DB_NAME=Love_rose_db
DB_USER=postgres
DB_PASSWORD=Roximar2025
DB_HOST=localhost
DB_PORT=5432
`);
  console.log('✅ Archivo .env creado con valores por defecto');
}

console.log('\n🔍 Verificación completada. Ejecuta `node simple-check.js` para probar la conexión.');
