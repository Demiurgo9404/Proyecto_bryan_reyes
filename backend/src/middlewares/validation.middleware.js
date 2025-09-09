const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');

// Esquemas de validación
const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'El correo electrónico no es válido',
      'string.empty': 'El correo electrónico es obligatorio',
      'any.required': 'El correo electrónico es obligatorio'
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': 'La contraseña debe tener al menos 8 caracteres',
      'string.empty': 'La contraseña es obligatoria',
      'any.required': 'La contraseña es obligatoria'
    })
  }),
  
  register: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')).required(),
    confirmPassword: Joi.ref('password'),
    role: Joi.string().valid('user', 'model', 'admin')
  }).with('password', 'confirmPassword')
};

const userSchemas = {
  updateProfile: Joi.object({
    firstName: Joi.string().max(50),
    lastName: Joi.string().max(50),
    bio: Joi.string().max(500),
    website: Joi.string().uri().allow(''),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/),
    gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say'),
    birthDate: Joi.date().max('now')
  })
};

// Middleware de validación
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], { 
      abortEarly: false, 
      allowUnknown: true 
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, '')
      }));

      return res.status(StatusCodes.BAD_REQUEST).json({
        status: 'error',
        message: 'Error de validación',
        errors
      });
    }

    next();
  };
};

module.exports = {
  validate,
  schemas: {
    ...authSchemas,
    ...userSchemas
  }
};
