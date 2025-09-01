const { sequelize } = require('./server/config/database');
const { User } = require('./server/models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // 1. Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Buscar el usuario
    const email = 'user@loverose.com';
    const password = 'User123!';
    
    console.log(`\n🔍 Buscando usuario: ${email}`);
    const user = await User.findOne({ 
      where: { email },
      raw: true
    });

    if (!user) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    console.log('\n📋 Datos del usuario:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('is_verified:', user.is_verified);
    console.log('is_active:', user.is_active);
    console.log('Contraseña hash:', user.password ? '✅ Presente' : '❌ Ausente');

    // 3. Forzar la actualización del usuario
    console.log('\n🔄 Actualizando usuario...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await sequelize.query(`
      UPDATE users 
      SET 
        is_verified = true,
        is_active = true,
        password = :hashedPassword,
        updated_at = NOW()
      WHERE email = :email
    `, {
      replacements: { email, hashedPassword }
    });

    console.log('✅ Usuario actualizado correctamente');

    // 4. Verificar la actualización
    const updatedUser = await User.findOne({ 
      where: { email },
      raw: true
    });

    console.log('\n🔍 Verificación después de actualizar:');
    console.log('is_verified:', updatedUser.is_verified);
    console.log('is_active:', updatedUser.is_active);

    // 5. Verificar la contraseña
    const isMatch = await bcrypt.compare(password, updatedUser.password);
    console.log('\n🔑 Verificación de contraseña:', isMatch ? '✅ Correcta' : '❌ Incorrecta');

    if (isMatch) {
      console.log('\n✅ ¡Listo para probar el inicio de sesión!');
      console.log('Por favor, intenta iniciar sesión con:');
      console.log('Email: user@loverose.com');
      console.log('Contraseña: User123!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.original) {
      console.error('Detalles del error:', error.original);
    }
  } finally {
    await sequelize.close();
  }
}

testLogin();
