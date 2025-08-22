'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    async validPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    toJSON() {
      const values = Object.assign({}, this.get());
      delete values.password;
      return values;
    }
  }
  
  User.init({
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 100]
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'model', 'admin', 'agency'),
      defaultValue: 'user',
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    last_login: {
      type: DataTypes.DATE
    },
    reset_password_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_password_expire: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verification_token: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
};
