const { sequelize } = require('./config/database');
const fs = require('fs');
const path = require('path');

// Función para ejecutar consultas SQL
async function runQuery(query, params = []) {
  try {
    const [results] = await sequelize.query(query, { replacements: params });
    return { success: true, data: results };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      sql: error.sql
    };
  }
}

// Función para verificar la estructura de la base de datos
async function checkDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...\n');
  
  // 1. Verificar conexión
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    process.exit(1);
  }

  // 2. Verificar tablas requeridas
  const requiredTables = [
    'users', 'products', 'transactions', 
    'offers', 'roles', 'permissions',
    'role_permissions', 'product_offers', 'activity_logs', 'settings'
  ];

  console.log('\n📋 Verificando tablas requeridas:');
  const [tables] = await sequelize.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
  );
  
  const existingTables = tables.map(t => t.table_name);
  const missingTables = requiredTables.filter(t => !existingTables.includes(t));
  
  if (missingTables.length > 0) {
    console.error(`❌ Faltan tablas: ${missingTables.join(', ')}`.red);
  } else {
    console.log('✅ Todas las tablas requeridas existen'.green);
  }

  // 3. Verificar datos de ejemplo
  console.log('\n🔍 Verificando datos de ejemplo:');
  
  // Verificar usuario administrador
  const adminUser = await runQuery("SELECT * FROM users WHERE username = 'admin'");
  if (!adminUser.success || adminUser.data.length === 0) {
    console.error('❌ No se encontró el usuario administrador'.red);
  } else {
    console.log('✅ Usuario administrador encontrado'.green);
  }

  // Verificar productos
  const products = await runQuery("SELECT COUNT(*) as count FROM products");
  if (!products.success || products.data[0].count === 0) {
    console.error('❌ No se encontraron productos'.red);
  } else {
    console.log(`✅ ${products.data[0].count} productos encontrados`.green);
  }

  // 4. Verificar vistas de dashboards
  console.log('\n📊 Verificando vistas de dashboards:');
  
  const views = [
    'vw_sales_summary',
    'vw_users_summary',
    'vw_top_products'
  ];
  
  for (const view of views) {
    const result = await runQuery(`SELECT * FROM ${view} LIMIT 1`);
    if (result.success) {
      console.log(`✅ Vista ${view} funciona correctamente`.green);
    } else {
      console.error(`❌ Error en la vista ${view}: ${result.error}`.red);
    }
  }

  // 5. Verificar consultas de dashboards
  console.log('\n🚀 Probando consultas de dashboards:');
  
  const dashboardQueries = [
    {
      name: 'Resumen de ventas',
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
    },
    {
      name: 'Usuarios por rol',
      query: `
        SELECT r.name as rol, COUNT(u.id) as total
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        GROUP BY r.name
      `
    },
    {
      name: 'Productos más vendidos',
      query: `
        SELECT 
          p.name,
          COUNT(t.id) as ventas,
          SUM(t.amount) as ingresos
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        WHERE t.status = 'completed'
        GROUP BY p.name
        ORDER BY ventas DESC
        LIMIT 5
      `
    }
  ];

  for (const query of dashboardQueries) {
    console.log(`\n📌 ${query.name}:`);
    const result = await runQuery(query.query);
    
    if (result.success) {
      console.log(`✅ Consulta ejecutada correctamente (${result.data.length} resultados)`.green);
      if (result.data.length > 0) {
        console.table(result.data.slice(0, 3)); // Mostrar solo las primeras 3 filas
      }
    } else {
      console.error(`❌ Error en la consulta: ${result.error}`.red);
      if (result.sql) {
        console.error('Consulta SQL:', result.sql);
      }
    }
  }

  console.log('\n✨ Verificación completada'.green.bold);
  process.exit(0);
}

// Ejecutar la verificación
checkDatabaseStructure().catch(error => {
  console.error('❌ Error durante la verificación:'.red, error);
  process.exit(1);
});
