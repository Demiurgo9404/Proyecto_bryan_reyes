const { DataTypes } = require('sequelize');
const sequelize = require('../config/database').sequelize;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Definir el modelo de Usuario
const User = sequelize.define('User', {
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
      notEmpty: {
        msg: 'Por favor ingresa un nombre de usuario',
      },
      len: {
        args: [1, 20],
        msg: 'El nombre de usuario no puede tener más de 20 caracteres',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Por favor ingresa un correo electrónico válido',
      },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6],
        msg: 'La contraseña debe tener al menos 6 caracteres',
      },
    },
  },
  role: {
    type: DataTypes.ENUM('user', 'model', 'admin'),
    defaultValue: 'user',
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  resetPasswordToken: DataTypes.STRING,
  resetPasswordExpire: DataTypes.DATE,
  verificationToken: DataTypes.STRING,
  verificationExpire: DataTypes.DATE,
  lastLogin: DataTypes.DATE,
  loginCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  stripeCustomerId: DataTypes.STRING,
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
    },
  },
  // Campos anidados para el perfil
  fullName: {
    type: DataTypes.STRING,
    field: 'full_name',
  },
  bio: {
    type: DataTypes.TEXT,
    validate: {
      len: {
        args: [0, 500],
        msg: 'La biografía no puede tener más de 500 caracteres',
      },
    },
  },
  gender: {
    type: DataTypes.ENUM('masculino', 'femenino', 'otro', 'prefiero no decirlo'),
    defaultValue: 'prefiero no decirlo',
  },
  birthDate: {
    type: DataTypes.DATE,
    field: 'birth_date',
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      is: {
        args: /^\+?[0-9\s-]{10,}$/,
        msg: 'Por favor ingresa un número de teléfono válido',
      },
    },
  },
  location: DataTypes.STRING,
  profilePicture: {
    type: DataTypes.STRING,
    field: 'profile_picture',
    defaultValue: 'default.jpg',
  },
  coverPhoto: {
    type: DataTypes.STRING,
    field: 'cover_photo',
  },
  // Campos de dirección de facturación
  billingLine1: {
    type: DataTypes.STRING,
    field: 'billing_line1',
  },
  billingLine2: {
    type: DataTypes.STRING,
    field: 'billing_line2',
  },
  billingCity: {
    type: DataTypes.STRING,
    field: 'billing_city',
  },
  billingState: {
    type: DataTypes.STRING,
    field: 'billing_state',
  },
  billingPostalCode: {
    type: DataTypes.STRING,
    field: 'billing_postal_code',
  },
  billingCountry: {
    type: DataTypes.STRING,
    field: 'billing_country',
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
  },
});

// Métodos de instancia
User.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

User.prototype.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this.id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

User.prototype.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos
  return resetToken;
};

User.prototype.recordLogin = function(ip, userAgent) {
  this.lastLogin = new Date();
  this.loginCount += 1;
  // Aquí podrías guardar el historial de inicios de sesión si es necesario
  return this.save();
};

// Método para obtener la edad del usuario
User.prototype.getAge = function() {
  if (!this.birthDate) return null;
  const birthDate = new Date(this.birthDate);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = User;
