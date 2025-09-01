const { execSync } = require('child_process');
const path = require('path');

console.log('🚨 FIXING DATABASE TABLES IMMEDIATELY...');
console.log('=====================================');

try {
  // Change to project directory
  process.chdir('c:\\Users\\Demiurgo\\Documents\\GitHub\\love_rose');
  console.log('📁 Directory:', process.cwd());
  
  // Execute database setup
  console.log('🔧 Executing database setup...');
  const output = execSync('node scripts/setup-database-fixed.js', { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  
  console.log(output);
  console.log('✅ DATABASE SETUP COMPLETED!');
  console.log('=====================================');
  console.log('🚀 Now restart backend with: npm start');
  console.log('🔑 Test login: admin@loverose.com / password123');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  if (error.stdout) console.log('Output:', error.stdout);
  if (error.stderr) console.error('Error output:', error.stderr);
}
