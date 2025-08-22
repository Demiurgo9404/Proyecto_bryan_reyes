const { sequelize } = require('./config/database');
const { QueryTypes } = require('sequelize');

async function fixDatabase() {
  try {
    console.log('🔧 Iniciando reparación de la base de datos...');
    
    // 1. Verificar si la tabla users tiene la columna role
    const hasRoleColumn = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name='users' AND column_name='role'`,
      { type: QueryTypes.SELECT }
    );

    if (hasRoleColumn.length > 0) {
      console.log('🔄 Eliminando restricciones de la columna role...');
      
      // 2. Eliminar restricciones de clave foránea que puedan referenciar a la columna role
      const constraints = await sequelize.query(
        `SELECT conname, conrelid::regclass, confrelid::regclass
         FROM pg_constraint 
         WHERE confrelid = (SELECT oid FROM pg_class WHERE relname = 'users' AND relkind = 'r')
         AND confkey @> array[(SELECT attnum FROM pg_attribute WHERE attname = 'role' AND attrelid = (SELECT oid FROM pg_class WHERE relname = 'users' AND relkind = 'r'))]`,
        { type: QueryTypes.SELECT }
      );

      for (const constraint of constraints) {
        console.log(`   Eliminando restricción: ${constraint.conname}`);
        await sequelize.query(
          `ALTER TABLE ${constraint.conrelid} DROP CONSTRAINT IF EXISTS ${constraint.conname}`,
          { type: QueryTypes.RAW }
        );
      }

      // 3. Eliminar la columna role
      console.log('🗑️  Eliminando columna role...');
      await sequelize.query(
        'ALTER TABLE users DROP COLUMN IF EXISTS role',
        { type: QueryTypes.RAW }
      );
    }

    // 4. Eliminar el tipo ENUM si existe
    console.log('🧹 Limpiando tipos ENUM antiguos...');
    await sequelize.query(
      'DROP TYPE IF EXISTS enum_users_role',
      { type: QueryTypes.RAW }
    );

    // 5. Crear el tipo ENUM correcto
    console.log('✨ Creando tipo ENUM actualizado...');
    await sequelize.query(
      `CREATE TYPE enum_users_role AS ENUM ('user', 'model', 'admin', 'agency')`,
      { type: QueryTypes.RAW }
    );

    // 6. Añadir la columna role de nuevo
    console.log('🔄 Añadiendo columna role con el tipo correcto...');
    await sequelize.query(
      `ALTER TABLE users ADD COLUMN role enum_users_role NOT NULL DEFAULT 'user'`,
      { type: QueryTypes.RAW }
    );

    console.log('✅ Base de datos reparada exitosamente');
    console.log('\nAhora puedes ejecutar las migraciones con:');
    console.log('npx sequelize-cli db:migrate');

  } catch (error) {
    console.error('❌ Error al reparar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar el script
fixDatabase();
