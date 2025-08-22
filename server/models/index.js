const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Importar modelos
const initUserModel = require('./User.model');
const initProductModel = require('./Product.model');
const initOfferModel = require('./Offer.model');
const initTransactionModel = require('./Transaction.model');
const initRoleModel = require('./Role.model');
const initPermissionModel = require('./Permission.model');

// Inicializar modelos
const models = {
  User: initUserModel(sequelize, DataTypes),
  Product: initProductModel(sequelize, DataTypes),
  Offer: initOfferModel(sequelize, DataTypes),
  Transaction: initTransactionModel(sequelize, DataTypes),
  Role: initRoleModel(sequelize, DataTypes),
  Permission: initPermissionModel(sequelize, DataTypes)
};

// Verificar que los modelos se hayan inicializado correctamente
Object.keys(models).forEach(modelName => {
  if (!models[modelName]) {
    console.error(`Error: El modelo ${modelName} no se pudo inicializar correctamente`);
    process.exit(1);
  }
});

// Establecer relaciones
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sincronizar todos los modelos con la base de datos
const syncModels = async () => {
  try {
    // Usar { force: true } solo en desarrollo para recrear tablas
    // En producción, usar migraciones con sequelize-cli
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    console.log('✅ Modelos sincronizados con la base de datos'.green.bold);
    
    // Crear roles por defecto si no existen
    await createDefaultRolesAndPermissions();
    
  } catch (error) {
    console.error('❌ Error al sincronizar modelos:'.red.bold, error);
    process.exit(1);
  }
};

// Crear roles y permisos por defecto
const createDefaultRolesAndPermissions = async () => {
  try {
    const { Role, Permission } = models;
    
    // Roles por defecto
    const defaultRoles = [
      { id: '00000000-0000-0000-0000-000000000001', name: 'admin', description: 'Administrador del sistema' },
      { id: '00000000-0000-0000-0000-000000000002', name: 'user', description: 'Usuario estándar' },
      { id: '00000000-0000-0000-0000-000000000003', name: 'model', description: 'Modelo' },
      { id: '00000000-0000-0000-0000-000000000004', name: 'agency', description: 'Agencia' },
    ];
    
    // Permisos por defecto
    const defaultPermissions = [
      // Permisos de administración
      { name: 'manage_users', description: 'Gestionar usuarios' },
      { name: 'manage_roles', description: 'Gestionar roles' },
      { name: 'manage_products', description: 'Gestionar productos' },
      { name: 'manage_offers', description: 'Gestionar ofertas' },
      { name: 'view_reports', description: 'Ver reportes' },
      
      // Permisos de usuario
      { name: 'buy_products', description: 'Comprar productos' },
      { name: 'view_offers', description: 'Ver ofertas' },
      
      // Permisos de modelo
      { name: 'manage_profile', description: 'Gestionar perfil' },
      { name: 'view_earnings', description: 'Ver ganancias' },
      
      // Permisos de agencia
      { name: 'manage_models', description: 'Gestionar modelos' },
      { name: 'view_analytics', description: 'Ver análisis' },
    ];
    
    // Crear roles y permisos
    await Promise.all([
      ...defaultRoles.map(role => 
        Role.findOrCreate({ where: { id: role.id }, defaults: role })
      ),
      ...defaultPermissions.map(permission => 
        Permission.findOrCreate({ where: { name: permission.name }, defaults: permission })
      )
    ]);
    
    console.log('✅ Roles y permisos por defecto creados correctamente'.green.bold);
    
  } catch (error) {
    console.error('❌ Error al crear roles y permisos por defecto:'.red.bold, error);
  }
};

module.exports = {
  sequelize,
  syncModels,
  ...models,
};
