'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    // MÉTODOS DE INSTANCIA
    async matchPassword(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }

    getSignedJwtToken() {
      return jwt.sign(
        { id: this.id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );
    }

    getResetPasswordToken() {
      const resetToken = crypto.randomBytes(20).toString('hex');
      this.reset_password_token = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      this.reset_password_expire = Date.now() + 10 * 60 * 1000; // 10 minutos
      return resetToken;
    }

    getAge() {
      if (!this.birthDate) return null;
      const birthDate = new Date(this.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'Por favor ingresa un nombre de usuario' },
        len: { args: [1, 20], msg: 'El nombre de usuario no puede tener más de 20 caracteres' },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: 'Por favor ingresa un correo electrónico válido' } },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { len: { args: [6], msg: 'La contraseña debe tener al menos 6 caracteres' } },
    },
    role: {
      type: DataTypes.ENUM('user', 'model', 'admin', 'agency'),
      defaultValue: 'user',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    reset_password_token: DataTypes.STRING,
    reset_password_expire: DataTypes.DATE,
    verification_token: DataTypes.STRING,
    verification_expire: DataTypes.DATE,
    last_login: DataTypes.DATE,
    loginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    stripeCustomerId: DataTypes.STRING,
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    fullName: DataTypes.STRING,
    bio: {
      type: DataTypes.TEXT,
      validate: { len: { args: [0, 500], msg: 'La biografía no puede tener más de 500 caracteres' } },
    },
    gender: {
      type: DataTypes.ENUM('masculino', 'femenino', 'otro', 'prefiero no decirlo'),
      defaultValue: 'prefiero no decirlo',
    },
    birthDate: DataTypes.DATE,
    phone: {
      type: DataTypes.STRING,
      validate: { is: { args: /^\+?[0-9\s-]{10,}$/, msg: 'Por favor ingresa un número de teléfono válido' } },
    },
    location: DataTypes.STRING,
    profilePicture: {
      type: DataTypes.STRING,
      defaultValue: 'default.jpg',
    },
    coverPhoto: DataTypes.STRING,
    billingLine1: DataTypes.STRING,
    billingLine2: DataTypes.STRING,
    billingCity: DataTypes.STRING,
    billingState: DataTypes.STRING,
    billingPostalCode: DataTypes.STRING,
    billingCountry: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
        if (user.is_verified === undefined) user.is_verified = true;
        if (user.is_active === undefined) user.is_active = true;
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  return User;
};
