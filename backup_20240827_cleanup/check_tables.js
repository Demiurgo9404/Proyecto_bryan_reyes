const { Sequelize } = require('sequelize');
const config = require('./server/config/config.json').development;

async function checkTables() {
  const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'postgres',
    logging: false
  });

  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');

    // Verificar si las tablas existen
    const [usersTable] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users'"
    );
    
    const [userImagesTable] = await sequelize.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_images'"
    );

    console.log('\nTabla users existe:', usersTable.length > 0);
    console.log('\nColumnas en user_images:', userImagesTable.map(col => `${col.column_name} (${col.data_type})`).join(', '));

    // Verificar si la columna profile_image_id existe en users
    const [profileImageColumn] = await sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image_id'"
    );
    
    console.log('\nColumna profile_image_id en users:', profileImageColumn.length > 0 ? 'EXISTE' : 'NO EXISTE');

    // Verificar claves foráneas
    const [foreignKeys] = await sequelize.query(`
      SELECT
        tc.constraint_name, 
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'users' OR ccu.table_name = 'users')
        OR (tc.table_name = 'user_images' OR ccu.table_name = 'user_images')
    `);

    console.log('\nRelaciones de claves foráneas:');
    console.table(foreignKeys);

  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
  } finally {
    await sequelize.close();
  }
}

checkTables();
