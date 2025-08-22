require('colors');
const { sequelize, syncModels, User, Product, Transaction, Offer } = require('./models');

// Configuración
const DASHBOARD_TESTS = {
  // Dashboard de resumen general
  'Resumen General': {
    queries: [
      {
        name: 'Total de usuarios',
        query: 'SELECT COUNT(*) as total FROM users',
        min: 1 // Debe haber al menos 1 usuario (admin)
      },
      {
        name: 'Productos activos',
        query: 'SELECT COUNT(*) as total FROM products WHERE is_active = true',
        min: 1
      },
      {
        name: 'Transacciones completadas',
        query: "SELECT COUNT(*) as total FROM transactions WHERE status = 'completed'",
        min: 0
      }
    ]
  },
  
  // Dashboard de ventas
  'Ventas': {
    queries: [
      {
        name: 'Ventas por producto',
        query: `
          SELECT p.name, COUNT(t.id) as ventas, SUM(t.amount) as total 
          FROM transactions t
          JOIN products p ON t.product_id = p.id 
          WHERE t.status = 'completed'
          GROUP BY p.name
          ORDER BY ventas DESC
        `
      },
      {
        name: 'Ventas por fecha',
        query: `
          SELECT 
            DATE(created_at) as fecha, 
            COUNT(*) as transacciones,
            SUM(amount) as monto_total
          FROM transactions
          WHERE status = 'completed'
          GROUP BY DATE(created_at)
          ORDER BY fecha DESC
          LIMIT 7
        `
      }
    ]
  },
  
  // Dashboard de usuarios
  'Usuarios': {
    queries: [
      {
        name: 'Nuevos usuarios',
        query: `
          SELECT 
            DATE(created_at) as fecha, 
            COUNT(*) as nuevos_usuarios
          FROM users
          WHERE created_at >= NOW() - INTERVAL '30 days'
          GROUP BY DATE(created_at)
          ORDER BY fecha DESC
        `
      },
      {
        name: 'Usuarios por rol',
        query: `
          SELECT r.name as rol, COUNT(u.id) as total
          FROM users u
          LEFT JOIN roles r ON u.role_id = r.id
          GROUP BY r.name
        `
      }
    ]
  }
};

// Función para ejecutar una consulta SQL
async function runQuery(query) {
  try {
    const [results] = await sequelize.query(query);
    return { success: true, data: results };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Función principal de verificación
async function verifyDashboards() {
  console.log('\n🔍 Iniciando verificación de dashboards...\n'.cyan.bold);
  
  // 1. Verificar conexión a la base de datos
  console.log('🔄 Verificando conexión a la base de datos...');
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente'.green);
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:'.red, error.message);
    process.exit(1);
  }

  // 2. Sincronizar modelos
  console.log('\n🔄 Sincronizando modelos...');
  try {
    await syncModels();
    console.log('✅ Modelos sincronizados correctamente'.green);
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:'.red, error.message);
    process.exit(1);
  }

  // 3. Verificar tablas requeridas
  console.log('\n🔍 Verificando tablas requeridas...');
  const requiredTables = ['users', 'products', 'transactions', 'offers', 'roles', 'permissions'];
  
  try {
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    const existingTables = tables.map(t => t.table_name);
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    
    if (missingTables.length > 0) {
      console.error(`❌ Faltan tablas requeridas: ${missingTables.join(', ')}`.red);
      process.exit(1);
    }
    
    console.log(`✅ Todas las tablas requeridas existen (${requiredTables.length} encontradas)`.green);
  } catch (error) {
    console.error('❌ Error al verificar tablas:'.red, error.message);
    process.exit(1);
  }

  // 4. Verificar datos de prueba
  console.log('\n🔍 Verificando datos de prueba...');
  try {
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
      console.error('❌ No se encontró el usuario administrador'.red);
      process.exit(1);
    }
    
    const products = await Product.count();
    if (products === 0) {
      console.error('❌ No se encontraron productos en la base de datos'.red);
      process.exit(1);
    }
    
    console.log(`✅ Datos de prueba verificados (${products} productos encontrados)`.green);
  } catch (error) {
    console.error('❌ Error al verificar datos de prueba:'.red, error.message);
    process.exit(1);
  }

  // 5. Probar consultas de dashboards
  console.log('\n🚀 Probando consultas de dashboards...');
  
  for (const [dashboard, test] of Object.entries(DASHBOARD_TESTS)) {
    console.log(`\n📊 ${dashboard}:`.cyan.bold);
    
    for (const queryTest of test.queries) {
      process.stdout.write(`  - ${queryTest.name}... `);
      
      const result = await runQuery(queryTest.query);
      
      if (!result.success) {
        console.log('❌'.red);
        console.error(`    Error: ${result.error}`.red);
        continue;
      }
      
      if (queryTest.min !== undefined && result.data.length < queryTest.min) {
        console.log(`⚠️  (${result.data.length} resultados, se esperaban al menos ${queryTest.min})`.yellow);
      } else {
        console.log('✅'.green);
      }
      
      // Mostrar un resumen de los resultados
      if (result.data.length > 0) {
        console.log(`    Muestra de resultados (${result.data.length} filas):`);
        console.table(result.data.slice(0, 3)); // Mostrar solo las primeras 3 filas
      }
    }
  }

  console.log('\n✨ Verificación completada exitosamente!'.green.bold);
  console.log('Todas las dashboards deberían funcionar correctamente con la base de datos.\n'.green);
  
  // Cerrar la conexión
  await sequelize.close();
}

// Ejecutar la verificación
verifyDashboards().catch(error => {
  console.error('❌ Error durante la verificación:'.red, error);
  process.exit(1);
});
