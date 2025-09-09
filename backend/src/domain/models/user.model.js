const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const config = require('../../config');
const logger = require('../../infrastructure/logging/logger');

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            len: [3, 50],
            is: /^[a-zA-Z0-9_]+$/,
          },
        },
        email: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
            len: [5, 100],
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            len: [8, 255],
          },
        },
        role: {
          type: DataTypes.ENUM('user', 'model', 'admin', 'superadmin'),
          defaultValue: 'user',
          allowNull: false,
        },
        is_email_verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        last_login_at: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('active', 'suspended', 'banned'),
          defaultValue: 'active',
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        paranoid: true,
        underscored: true,
        hooks: {
          beforeCreate: async (user) => {
            if (user.password) {
              user.password = await bcrypt.hash(
                user.password,
                config.auth.passwordSaltRounds
              );
            }
          },
          beforeUpdate: async (user) => {
            if (user.changed('password')) {
              user.password = await bcrypt.hash(
                user.password,
                config.auth.passwordSaltRounds
              );
            }
          },
        },
        defaultScope: {
          attributes: { exclude: ['password'] },
        },
        scopes: {
          withPassword: {
            attributes: { include: ['password'] },
          },
        },
      }
    );
  }

  // Instance Methods
  async validatePassword(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      logger.error('Error validating password', { error, userId: this.id });
      return false;
    }
  }

  toJSON() {
    const values = { ...this.get() };
    // Always exclude password
    delete values.password;
    return values;
  }

  // Class Methods
  static associate(models) {
    // Define associations here
    // Example:
    // this.hasMany(models.Post, { foreignKey: 'author_id', as: 'posts' });
  }
}

module.exports = User;
