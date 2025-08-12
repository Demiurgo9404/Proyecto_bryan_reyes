const { User, Profile } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    // Configuración de paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    // Configuración de ordenamiento
    let order = [['createdAt', 'DESC']];
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      order = sortFields.map(field => {
        let order = 'ASC';
        if (field.startsWith('-')) {
          field = field.substring(1);
          order = 'DESC';
        }
        return [field, order];
      });
    }

    // Configuración de atributos a incluir
    let attributes = { exclude: ['password'] }; // Por defecto, excluir la contraseña
    if (req.query.select) {
      const selectedFields = req.query.select.split(',');
      // Asegurarse de no incluir la contraseña a menos que se solicite explícitamente
      if (!selectedFields.includes('password')) {
        attributes.exclude = ['password'];
      } else {
        attributes.exclude = [];
      }
      attributes.include = selectedFields;
    }

    // Construir condiciones de búsqueda
    const where = {};
    Object.keys(req.query).forEach(key => {
      if (!['select', 'sort', 'page', 'limit'].includes(key)) {
        where[key] = req.query[key];
      }
    });

    // Realizar la consulta con paginación
    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes,
      order,
      limit,
      offset,
      include: [
        {
          model: Profile,
          as: 'profile',
          required: false
        }
      ]
    });

    // Construir objeto de paginación
    const pagination = {};
    const endIndex = page * limit;
    const totalPages = Math.ceil(count / limit);

    if (endIndex < count) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (offset > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    // Enviar respuesta
    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      total: count,
      totalPages,
      data: users
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener los usuarios' 
    });
  }
};

// @desc    Obtener un solo usuario
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('profile');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener el usuario' 
    });
  }
};

// @desc    Crear usuario
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico ya está en uso'
      });
    }

    // Crear usuario
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      isVerified: true // Los usuarios creados por admin se marcan como verificados
    });

    // Crear perfil vacío
    const profile = await Profile.create({
      user: user._id,
      displayName: user.name
    });

    // Asignar perfil al usuario
    user.profile = profile._id;
    await user.save();

    // Obtener usuario con perfil poblado
    const userWithProfile = await User.findById(user._id).populate('profile');

    res.status(201).json({
      success: true,
      data: userWithProfile
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico ya está en uso'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear el usuario' 
    });
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar si se está actualizando el correo electrónico
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser && existingUser._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          error: 'El correo electrónico ya está en uso por otro usuario'
        });
      }
    }

    // Actualizar campos
    const { name, email, role, status, isVerified } = req.body;
    
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (status) user.status = status;
    if (isVerified !== undefined) user.isVerified = isVerified;

    // Si se actualiza la contraseña
    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();

    // Obtener usuario actualizado con perfil
    user = await User.findById(user._id).populate('profile');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'El correo electrónico ya está en uso'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar el usuario' 
    });
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }

    // No permitir eliminar la cuenta de administrador principal
    if (user.role === 'superadmin' && user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar este usuario'
      });
    }

    // Eliminar perfil asociado si existe
    if (user.profile) {
      await Profile.findByIdAndDelete(user.profile);
    }

    // Marcar como eliminado en lugar de eliminarlo físicamente
    user.status = 'deleted';
    user.deletedAt = new Date();
    user.deletedBy = req.user.id;
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar el usuario' 
    });
  }
};

// @desc    Actualizar perfil de usuario
// @route   PUT /api/users/:id/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Verificar que el usuario existe
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario solo pueda actualizar su propio perfil o sea admin
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar este perfil'
      });
    }

    // Buscar o crear perfil
    let profile = await Profile.findOne({ user: user._id });
    
    if (!profile) {
      // Crear nuevo perfil si no existe
      profile = new Profile({
        user: user._id,
        displayName: user.name
      });
    }

    // Actualizar campos del perfil
    const {
      displayName,
      bio,
      dateOfBirth,
      gender,
      phone,
      location,
      website,
      socialMedia,
      preferences,
      settings
    } = req.body;

    if (displayName !== undefined) profile.displayName = displayName;
    if (bio !== undefined) profile.bio = bio;
    if (dateOfBirth !== undefined) profile.dateOfBirth = dateOfBirth;
    if (gender !== undefined) profile.gender = gender;
    if (phone !== undefined) profile.phone = phone;
    if (location !== undefined) profile.location = location;
    if (website !== undefined) profile.website = website;
    if (socialMedia !== undefined) profile.socialMedia = socialMedia;
    if (preferences !== undefined) profile.preferences = preferences;
    if (settings !== undefined) profile.settings = settings;

    // Guardar perfil
    await profile.save();

    // Si es el primer perfil del usuario, vincularlo
    if (!user.profile) {
      user.profile = profile._id;
      await user.save();
    }

    // Obtener usuario con perfil actualizado
    const updatedUser = await User.findById(user._id).populate('profile');

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar el perfil' 
    });
  }
};
