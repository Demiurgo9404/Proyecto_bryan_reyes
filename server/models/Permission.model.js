const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

module.exports = (sequelize, DataTypes) => {
  const Permission = sequelize.define('Permission', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'El nombre del permiso es requerido'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'permissions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  // Relaciones
  Permission.associate = function(models) {
    Permission.belongsToMany(models.Role, {
      through: 'role_permissions',
      foreignKey: 'permission_id',
      as: 'roles'
    });
  };

  return Permission;
};
