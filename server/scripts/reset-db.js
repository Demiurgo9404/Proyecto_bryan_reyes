const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

async function resetDatabase() {
  try {
    // Obtener todos los nombres de las tablas
    const [results] = await sequelize.query(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
    );

    // Deshabilitar triggers
    await sequelize.query('SET session_replication_role = "replica";');

    // Eliminar todas las tablas
    for (const table of results) {
      await sequelize.query(`DROP TABLE IF EXISTS "${table.tablename}" CASCADE;`);
      console.log(`Tabla eliminada: ${table.tablename}`);
    }

    // Eliminar tipos ENUM
    const [enums] = await sequelize.query(
      `SELECT t.typname as enum_name 
       FROM pg_type t 
       JOIN pg_enum e ON t.oid = e.enumtypid
       GROUP BY t.typname`
    );

    for (const enumType of enums) {
      await sequelize.query(`DROP TYPE IF EXISTS "${enumType.enum_name}" CASCADE;`);
      console.log(`Tipo ENUM eliminado: ${enumType.enum_name}`);
    }

    // Reactivar triggers
    await sequelize.query('SET session_replication_role = "origin";');

    console.log('\n✅ Base de datos limpiada exitosamente!');
    console.log('\nAhora puedes reiniciar el servidor con: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error);
    process.exit(1);
  }
}

resetDatabase();
