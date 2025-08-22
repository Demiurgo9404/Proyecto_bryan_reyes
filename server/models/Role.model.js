const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
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
          msg: 'El nombre del rol es requerido'
        }
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'roles',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  // Relaciones
  Role.associate = function(models) {
    Role.belongsToMany(models.Permission, {
      through: 'role_permissions',
      foreignKey: 'role_id',
      as: 'permissions'
    });

    Role.hasMany(models.User, {
      foreignKey: 'role_id',
      as: 'users'
    });
  };

  return Role;
};
