const { sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

async function checkDatabase() {
  try {
    console.log('Intentando conectar a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa');

    // Verificar si la tabla de usuarios existe
    console.log('\nVerificando tabla de usuarios...');
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
    );

    if (results.length === 0) {
      console.log('❌ La tabla de usuarios no existe. ¿Ejecutaste las migraciones?');
      console.log('Ejecuta: npx sequelize-cli db:migrate');
    } else {
      console.log('✅ Tabla de usuarios encontrada');
      
      // Contar usuarios
      const [users] = await sequelize.query("SELECT COUNT(*) as count FROM users", {
        type: QueryTypes.SELECT
      });
      
      console.log(`\n📊 Total de usuarios en la base de datos: ${users.count}`);
      
      // Mostrar primeros 5 usuarios
      if (users.count > 0) {
        console.log('\n📝 Listando usuarios (máx. 5):');
        const userList = await sequelize.query(
          "SELECT id, email, "role", "isActive", "isVerified" FROM users LIMIT 5",
          { type: QueryTypes.SELECT }
        );
        console.table(userList);
      }
    }
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:');
    console.error(error.message);
    console.log('\nPosibles soluciones:');
    console.log('1. Verifica que PostgreSQL esté en ejecución');
    console.log('2. Revisa la configuración en .env o config/config.json');
    console.log('3. Verifica el usuario y contraseña de la base de datos');
    console.log('4. Asegúrate de que la base de datos existe');
  } finally {
    await sequelize.close();
    process.exit();
  }
}

checkDatabase();
