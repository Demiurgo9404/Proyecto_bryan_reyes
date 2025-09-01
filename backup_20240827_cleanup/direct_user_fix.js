const { sequelize } = require('./server/config/database');
const { User } = require('./server/models');

async function fixUser() {
  try {
    // Forzar la sincronización del modelo
    await sequelize.sync({ force: false, alter: true });
    
    // Buscar el usuario
    const user = await User.findOne({
      where: { email: 'user@loverose.com' },
      raw: true
    });

    console.log('Usuario encontrado:', user);
    
    if (!user) {
      console.error('Usuario no encontrado');
      return;
    }

    // Actualizar directamente con SQL puro
    const [updated] = await sequelize.query(`
      UPDATE users 
      SET 
        is_verified = true,
        is_active = true,
        updated_at = NOW()
      WHERE email = 'user@loverose.com'
      RETURNING *
    `);

    console.log('Usuario actualizado:', updated[0]);
    
    // Verificar la actualización
    const updatedUser = await User.findOne({
      where: { email: 'user@loverose.com' },
      raw: true
    });
    
    console.log('Verificación después de actualizar:');
    console.log('Email:', updatedUser.email);
    console.log('is_verified:', updatedUser.is_verified);
    console.log('is_active:', updatedUser.is_active);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

fixUser();
