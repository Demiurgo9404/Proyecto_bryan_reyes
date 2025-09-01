const { sequelize } = require('./server/config/database');
const { User } = require('./server/models');

async function checkDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Check test users
    const testEmails = [
      'super@loverose.com',
      'admin@loverose.com',
      'agency@loverose.com',
      'model@loverose.com',
      'user@loverose.com'
    ];

    const users = await User.findAll({
      where: { email: testEmails },
      attributes: ['id', 'email', 'username', 'role', 'is_verified', 'is_active']
    });

    console.log('\n📋 Usuarios de prueba:');
    console.table(users.map(u => u.toJSON()));

    // Check if users are verified and active
    const unverifiedUsers = users.filter(u => !u.is_verified || !u.is_active);
    if (unverifiedUsers.length > 0) {
      console.log('\n⚠️  Usuarios no verificados o inactivos:');
      console.table(unverifiedUsers.map(u => ({
        email: u.email,
        is_verified: u.is_verified ? '✅' : '❌',
        is_active: u.is_active ? '✅' : '❌'
      })));
    } else {
      console.log('\n✅ Todos los usuarios están verificados y activos.');
    }

    // Check environment variables
    console.log('\n🔍 Variables de entorno:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'No definido'}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Definido' : '❌ No definido'}`);
    console.log(`JWT_EXPIRE: ${process.env.JWT_EXPIRE || '7d'}`);

  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error.message);
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
  } finally {
    await sequelize.close();
    process.exit();
  }
}

checkDatabase();
