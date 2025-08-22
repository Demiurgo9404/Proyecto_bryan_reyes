// server/scripts/update-admin-password.js
const bcrypt = require('bcryptjs');
const { sequelize } = require('../models');

async function updateAdminPassword() {
  try {
    const email = 'admin@loverose.com';
    const newPassword = 'Admin123!';
    
    // Hash de la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Actualizar la contraseña en la base de datos
    const [updated] = await sequelize.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      {
        bind: [hashedPassword, email],
        type: sequelize.QueryTypes.UPDATE
      }
    );
    
    if (updated) {
      console.log('✅ Contraseña actualizada correctamente');
      console.log(`Email: ${email}`);
      console.log(`Nueva contraseña: ${newPassword}`);
    } else {
      console.log('❌ No se pudo actualizar la contraseña');
    }
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
  } finally {
    process.exit();
  }
}

updateAdminPassword();
