const { execSync } = require('child_process');

console.log('🚨 RUNNING DATABASE FIX...');

try {
  const result = execSync('node scripts\\setup-database-fixed.js', { 
    encoding: 'utf8',
    cwd: 'c:\\Users\\Demiurgo\\Documents\\GitHub\\love_rose'
  });
  console.log(result);
  console.log('✅ Database setup completed!');
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('Output:', error.stdout);
}
