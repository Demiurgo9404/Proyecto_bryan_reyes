const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

// Configuración directa de la conexión a la base de datos
const sequelize = new Sequelize('Love_rose_db', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

async function fixUser() {
  const email = 'user@loverose.com';
  const password = 'User123!';
  
  try {
    // 1. Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // 2. Verificar si la tabla users existe
    const [results] = await sequelize.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users')"
    );
    
    if (!results[0].exists) {
      console.error('❌ La tabla users no existe en la base de datos');
      return;
    }

    // 3. Verificar si el usuario existe
    const [users] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      { replacements: [email] }
    );
    
    if (users.length === 0) {
      console.error('❌ Usuario no encontrado');
      return;
    }

    const user = users[0];
    console.log('\n📋 Datos actuales del usuario:');
    console.log('ID:', user.id);
    console.log('Email:', user.email);
    console.log('is_verified:', user.is_verified);
    console.log('is_active:', user.is_active);
    console.log('Contraseña hash:', user.password ? '✅ Presente' : '❌ Ausente');

    // 4. Actualizar el usuario
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await sequelize.query(
      `UPDATE users 
       SET 
         is_verified = true,
         is_active = true,
         password = ?,
         updated_at = NOW()
       WHERE email = ?
       RETURNING *`,
      { replacements: [hashedPassword, email] }
    );

    console.log('\n✅ Usuario actualizado correctamente');

    // 5. Verificar la actualización
    const [updatedUsers] = await sequelize.query(
      'SELECT * FROM users WHERE email = ?',
      { replacements: [email] }
    );

    const updatedUser = updatedUsers[0];
    console.log('\n🔍 Verificación después de actualizar:');
    console.log('is_verified:', updatedUser.is_verified);
    console.log('is_active:', updatedUser.is_active);

    // 6. Verificar la contraseña
    const isMatch = await bcrypt.compare(password, updatedUser.password);
    console.log('\n🔑 Verificación de contraseña:', isMatch ? '✅ Correcta' : '❌ Incorrecta');

    if (isMatch) {
      console.log('\n✨ ¡Usuario listo para iniciar sesión!');
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

fixUser();
