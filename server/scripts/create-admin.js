const { User } = require('../models');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  try {
    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ 
      where: { email: 'admin@loverose.com' } 
    });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        console.log('🔧 El usuario administrador existe pero tiene un rol incorrecto. Actualizando...');
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Rol del administrador actualizado a "admin".');
      } else {
        console.log('✅ El usuario administrador ya existe con el rol correcto.');
      }
      console.log(`   Email: ${existingAdmin.email}`);
      return;
    }

    // Crear el usuario administrador
    const adminData = {
      name: 'Administrador',
      email: 'admin@loverose.com',
      password: 'Admin123!', // Contraseña por defecto
      role: 'admin',
      isActive: true,
      isVerified: true,
    };

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Crear el usuario
    const admin = await User.create(adminData);

    console.log('✅ Usuario administrador creado exitosamente');
    console.log('\n🔑 Credenciales de acceso:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Contraseña: Admin123!`);
    console.log('\n⚠️ IMPORTANTE: Cambia esta contraseña después de iniciar sesión.');
    
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:');
    console.error(error.message);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('\n💡 Ya existe un usuario con ese correo electrónico.');
    }
    
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que la base de datos esté en ejecución');
    console.log('2. Asegúrate de que las migraciones estén ejecutadas');
    console.log('3. Revisa los logs de error para más detalles');
  } finally {
    process.exit();
  }
}

// Ejecutar la función principal
console.log('🔍 Iniciando creación de usuario administrador...');
createAdminUser();
