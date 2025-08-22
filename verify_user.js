const { sequelize } = require('./server/config/database');
const { User } = require('./server/models');

async function verifyAndUpdateUser() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');

    // Buscar el usuario
    const email = 'user@loverose.com';
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log('\n📋 Usuario encontrado:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Rol: ${user.role}`);
    console.log(`Verificado: ${user.is_verified}`);
    console.log(`Activo: ${user.is_active}`);
    console.log(`Último inicio de sesión: ${user.last_login}`);

    // Actualizar el usuario si es necesario
    const updates = {};
    
    if (user.is_verified !== true) {
      console.log('\n🔄 Actualizando is_verified a true');
      updates.is_verified = true;
    }
    
    if (user.is_active !== true) {
      console.log('🔄 Actualizando is_active a true');
      updates.is_active = true;
    }
    
    if (Object.keys(updates).length > 0) {
      console.log('\n💾 Guardando cambios...');
      await user.update(updates);
      console.log('✅ Cambios guardados correctamente');
    } else {
      console.log('\n✅ El usuario ya está correctamente configurado');
    }

    // Verificar la contraseña
    const password = 'User123!';
    const isMatch = await user.matchPassword(password);
    console.log(`\n🔑 Verificación de contraseña: ${isMatch ? '✅ Correcta' : '❌ Incorrecta'}`);

    // Generar token JWT
    const token = user.getSignedJwtToken();
    console.log('\n🔑 Token JWT generado correctamente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
  } finally {
    await sequelize.close();
    process.exit();
  }
}

verifyAndUpdateUser();
