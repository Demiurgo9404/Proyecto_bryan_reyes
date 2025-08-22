const { User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    // Helpers de campos
    const camelToSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
    const createdAtField = User.rawAttributes?.createdAt?.field || 'created_at';
    const updatedAtField = User.rawAttributes?.updatedAt?.field || 'updated_at';
    const mapSortField = (f) => {
      if (f === 'createdAt') return createdAtField;
      if (f === 'updatedAt') return updatedAtField;
      return camelToSnake(f);
    };

    // Orden por createdAt real de la tabla
    let order = [[createdAtField, 'DESC']];
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      order = sortFields.map((field) => {
        let dir = 'ASC';
        if (field.startsWith('-')) {
          field = field.substring(1);
          dir = 'DESC';
        }
        return [mapSortField(field), dir];
      });
    }

    // Attributes selection: use array form when select is provided; always exclude password
    let attributes = { exclude: ['password'] };
    if (req.query.select) {
      const selected = req.query.select.split(',');
      const cleaned = selected.filter((f) => f !== 'password');
      attributes = cleaned.length ? cleaned : { exclude: ['password'] };
    }

    // Construcción segura de filtros
    const where = {};
    const roles = ['admin', 'agency', 'model', 'user'];
    const truthy = ['true', '1', 'activo', 'active', 'yes', 'si'];
    const falsy = ['false', '0', 'inactivo', 'inactive', 'no'];

    // role
    if (typeof req.query.role !== 'undefined' && req.query.role !== '' && req.query.role !== 'all') {
      if (roles.includes(req.query.role)) where.role = req.query.role;
    }

    // estado/isActive
    const stateInput = (req.query.isActive ?? req.query.estado ?? req.query.state);
    if (typeof stateInput !== 'undefined' && stateInput !== '' && stateInput !== 'all') {
      const v = String(stateInput).toLowerCase();
      if (truthy.includes(v)) where.isActive = true;
      if (falsy.includes(v)) where.isActive = false;
    }

    // isVerified
    if (typeof req.query.isVerified !== 'undefined' && req.query.isVerified !== '') {
      const v = String(req.query.isVerified).toLowerCase();
      if (truthy.includes(v)) where.isVerified = true;
      if (falsy.includes(v)) where.isVerified = false;
    }

    // username/email exactos u opcional búsqueda
    if (req.query.username) where.username = { [Op.iLike]: `%${req.query.username}%` };
    if (req.query.email) where.email = { [Op.iLike]: `%${req.query.email}%` };
    if (req.query.search || req.query.q) {
      const term = String(req.query.search || req.query.q);
      where[Op.or] = [
        { username: { [Op.iLike]: `%${term}%` } },
        { email: { [Op.iLike]: `%${term}%` } },
      ];
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes,
      order,
      limit,
      offset,
    });

    const pagination = {};
    const endIndex = page * limit;
    const totalPages = Math.ceil(count / limit);
    if (endIndex < count) pagination.next = { page: page + 1, limit };
    if (offset > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: users.length,
      pagination,
      total: count,
      totalPages,
      data: users,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error?.message);
    if (error?.name) console.error('Nombre del error:', error.name);
    if (error?.original?.message) console.error('DB error:', error.original.message);
    if (error?.stack) console.error(error.stack);
    res.status(500).json({ success: false, error: 'Error al obtener los usuarios' });
  }
};

// @desc    Obtener usuarios con rol "user" (Clientes)
// @route   GET /api/users/clients
// @access  Private/Admin
exports.getClients = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    // Orden seguro usando nombres reales del modelo
    const camelToSnake = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
    const createdAtField = User.rawAttributes?.createdAt?.field || 'created_at';
    const updatedAtField = User.rawAttributes?.updatedAt?.field || 'updated_at';
    const mapSortField = (f) => {
      if (f === 'createdAt') return createdAtField;
      if (f === 'updatedAt') return updatedAtField;
      return camelToSnake(f);
    };
    let order = [[createdAtField, 'DESC']];
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      order = sortFields.map((field) => {
        let dir = 'ASC';
        if (field.startsWith('-')) {
          field = field.substring(1);
          dir = 'DESC';
        }
        return [mapSortField(field), dir];
      });
    }

    const { count, rows } = await User.findAndCountAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] },
      order,
      limit,
      offset,
    });

    const pagination = {};
    const endIndex = page * limit;
    const totalPages = Math.ceil(count / limit);
    if (endIndex < count) pagination.next = { page: page + 1, limit };
    if (offset > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: rows.length,
      pagination,
      total: count,
      totalPages,
      data: rows,
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ success: false, error: 'Error al obtener los clientes' });
  }
};

// @desc    Resumen de roles con miembros por rol
// @route   GET /api/users/roles-summary
// @access  Private/Admin
exports.getRolesSummary = async (req, res) => {
  try {
    const roles = ['admin', 'agency', 'model', 'user'];

    const result = {};
    for (const role of roles) {
      const createdAtField = User.rawAttributes?.createdAt?.field || 'created_at';
      const members = await User.findAll({
        where: { role },
        attributes: { exclude: ['password'] },
        order: [[createdAtField, 'DESC']],
      });
      result[role] = {
        count: members.length,
        members,
      };
    }

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error al obtener resumen de roles:', error);
    res.status(500).json({ success: false, error: 'Error al obtener el resumen de roles' });
  }
};

// @desc    Obtener usuario por ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: `Usuario no encontrado con el id ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ success: false, error: 'Error al obtener el usuario' });
  }
};

// @desc    Obtener usuario actual
// @route   GET /api/users/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: { exclude: ['password'] } });
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error al obtener el usuario actual:', error);
    res.status(500).json({ success: false, error: 'Error al obtener el usuario actual' });
  }
};

// @desc    Crear usuario
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, username, email, password, role } = req.body;
    const finalUsername = username || name; // compatibilidad con validadores previos

    const existingUser = await User.findOne({ where: { [Op.or]: [{ email }, { username: finalUsername }] } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'El correo o usuario ya está en uso' });
    }

    const user = await User.create({
      username: finalUsername,
      email,
      password,
      role: role || 'user',
      isVerified: true,
    });

    const created = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ success: false, error: 'El correo o usuario ya está en uso' });
    }
    res.status(500).json({ success: false, error: 'Error al crear el usuario' });
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ 
      success: false, 
      error: `Usuario no encontrado con el id ${req.params.id}` 
    });

    // Validar email único si se está actualizando
    if (req.body.email && req.body.email !== user.email) {
      const existingEmail = await User.findOne({ 
        where: { email: req.body.email, id: { [Op.ne]: user.id } } 
      });
      if (existingEmail) return res.status(400).json({ 
        success: false, 
        error: 'El correo electrónico ya está en uso por otro usuario' 
      });
    }

    // Validar username único si se está actualizando
    if (req.body.username && req.body.username !== user.username) {
      const existingUsername = await User.findOne({ 
        where: { username: req.body.username, id: { [Op.ne]: user.id } } 
      });
      if (existingUsername) return res.status(400).json({ 
        success: false, 
        error: 'El nombre de usuario ya está en uso' 
      });
    }

    // Campos actualizables
    const updatableFields = [
      // Información básica
      'username', 'email', 'role', 'isActive', 'isVerified',
      // Perfil
      'fullName', 'bio', 'gender', 'birthDate', 'phone', 'location',
      'profilePicture', 'coverPhoto',
      // Dirección de facturación
      'billingLine1', 'billingLine2', 'billingCity',
      'billingState', 'billingPostalCode', 'billingCountry'
    ];

    // Actualizar campos permitidos
    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    // Manejar contraseña por separado (se hashea en el hook)
    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    
    // Obtener usuario actualizado sin la contraseña
    const updatedUser = await User.findByPk(user.id, { 
      attributes: { exclude: ['password'] } 
    });
    
    res.status(200).json({ 
      success: true, 
      data: updatedUser 
    });
    
  } catch (error) {
    console.error('Error al actualizar usuario:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.params.id
    });
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        error: 'Error de duplicación: El correo o nombre de usuario ya está en uso',
        details: process.env.NODE_ENV === 'development' ? error.errors : undefined
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar el perfil del usuario',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Eliminar usuario (soft delete -> inactivar)
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: `Usuario no encontrado con el id ${req.params.id}` });
    if (user.role === 'admin' && user.email === process.env.ADMIN_EMAIL) {
      return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este usuario' });
    }
    user.isActive = false;
    await user.save();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ success: false, error: 'Error al eliminar el usuario' });
  }
};

// @desc    Activar usuario
// @route   PUT /api/users/:id/activate
// @access  Private/Admin
exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    user.isActive = true;
    await user.save();
    const data = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error al activar usuario:', error);
    res.status(500).json({ success: false, error: 'Error al activar el usuario' });
  }
};

// @desc    Desactivar usuario
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    user.isActive = false;
    await user.save();
    const data = await User.findByPk(user.id, { attributes: { exclude: ['password'] } });
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    res.status(500).json({ success: false, error: 'Error al desactivar el usuario' });
  }
};

// @desc    Actualizar contraseña del usuario actual
// @route   PUT /api/users/update-password
// @access  Private
exports.updateUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(400).json({ success: false, error: 'La contraseña actual es incorrecta' });
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar contraseña:', error);
    res.status(500).json({ success: false, error: 'Error al actualizar la contraseña' });
  }
};

// Nota: Endpoints relacionados con perfiles y otras colecciones fueron removidos
// ya que esta base de datos usa Sequelize únicamente con el modelo User definido.
