const Profile = require('../models/Profile');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Obtener todos los perfiles
// @route   GET /api/profiles
// @access  Public
exports.getProfiles = async (req, res, next) => {
  try {
    // Copiar req.query
    const reqQuery = { ...req.query };
    
    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Eliminar campos de la consulta
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Crear cadena de consulta
    let queryStr = JSON.stringify(reqQuery);
    
    // Crear operadores ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Encontrar recursos
    let query = Profile.find(JSON.parse(queryStr))
      .populate('user', 'name email role')
      .populate('followers', 'name email')
      .populate('following', 'name email');

    // Seleccionar campos
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Ordenar
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Profile.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Ejecutar consulta
    const profiles = await query;

    // Resultado de la paginación
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: profiles.length,
      pagination,
      data: profiles
    });
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener los perfiles' 
    });
  }
};

// @desc    Obtener un perfil por ID
// @route   GET /api/profiles/:id
// @access  Public
exports.getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('followers', 'name email')
      .populate('following', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Perfil no encontrado con el id ${req.params.id}`
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Perfil no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener el perfil' 
    });
  }
};

// @desc    Obtener perfil por ID de usuario
// @route   GET /api/profiles/user/:userId
// @access  Public
exports.getProfileByUser = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.params.userId })
      .populate('user', 'name email role')
      .populate('followers', 'name email')
      .populate('following', 'name email');

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: `Perfil no encontrado para el usuario con id ${req.params.userId}`
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error al obtener perfil por usuario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Usuario no encontrado con el id ${req.params.userId}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener el perfil del usuario' 
    });
  }
};

// @desc    Crear o actualizar perfil de usuario
// @route   POST /api/profiles
// @access  Private
exports.createOrUpdateProfile = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

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
      settings,
      isModel,
      modelInfo
    } = req.body;

    // Construir objeto de perfil
    const profileFields = {};
    profileFields.user = req.user.id;
    
    if (displayName) profileFields.displayName = displayName;
    if (bio) profileFields.bio = bio;
    if (dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
    if (gender) profileFields.gender = gender;
    if (phone) profileFields.phone = phone;
    if (location) profileFields.location = location;
    if (website) profileFields.website = website;
    if (socialMedia) profileFields.socialMedia = socialMedia;
    if (preferences) profileFields.preferences = preferences;
    if (settings) profileFields.settings = settings;
    if (isModel !== undefined) profileFields.isModel = isModel;
    if (modelInfo) profileFields.modelInfo = modelInfo;

    // Verificar si el perfil ya existe
    let profile = await Profile.findOne({ user: req.user.id });

    if (profile) {
      // Actualizar perfil existente
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json({
        success: true,
        data: profile
      });
    }

    // Crear nuevo perfil
    profile = new Profile(profileFields);
    await profile.save();

    // Actualizar referencia del perfil en el usuario
    await User.findByIdAndUpdate(
      req.user.id,
      { profile: profile._id },
      { new: true }
    );

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error al crear/actualizar perfil:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un perfil para este usuario'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear/actualizar el perfil' 
    });
  }
};

// @desc    Eliminar perfil y usuario
// @route   DELETE /api/profiles
// @access  Private
exports.deleteProfile = async (req, res, next) => {
  try {
    // Eliminar perfil
    await Profile.findOneAndRemove({ user: req.user.id });
    
    // Eliminar usuario
    await User.findOneAndRemove({ _id: req.user.id });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar perfil:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar el perfil' 
    });
  }
};

// @desc    Seguir a un usuario
// @route   PUT /api/profiles/follow/:id
// @access  Private
exports.followUser = async (req, res, next) => {
  try {
    // Obtener perfil del usuario a seguir
    const profileToFollow = await Profile.findById(req.params.id);
    
    if (!profileToFollow) {
      return res.status(404).json({
        success: false,
        error: 'Perfil no encontrado'
      });
    }

    // Verificar que no sea el mismo usuario
    if (profileToFollow.user.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'No puedes seguirte a ti mismo'
      });
    }

    // Obtener perfil del usuario actual
    const currentUserProfile = await Profile.findOne({ user: req.user.id });
    
    // Verificar si ya lo sigue
    if (
      currentUserProfile.following.some(
        follow => follow.user.toString() === profileToFollow.user.toString()
      )
    ) {
      return res.status(400).json({
        success: false,
        error: 'Ya sigues a este usuario'
      });
    }

    // Agregar a la lista de seguidos
    currentUserProfile.following.unshift({ user: profileToFollow.user });
    await currentUserProfile.save();

    // Agregar a la lista de seguidores del otro perfil
    profileToFollow.followers.unshift({ user: req.user.id });
    await profileToFollow.save();

    res.status(200).json({
      success: true,
      data: currentUserProfile
    });
  } catch (error) {
    console.error('Error al seguir usuario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Perfil no encontrado'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al seguir al usuario' 
    });
  }
};

// @desc    Dejar de seguir a un usuario
// @route   PUT /api/profiles/unfollow/:id
// @access  Private
exports.unfollowUser = async (req, res, next) => {
  try {
    // Obtener perfil del usuario a dejar de seguir
    const profileToUnfollow = await Profile.findById(req.params.id);
    
    if (!profileToUnfollow) {
      return res.status(404).json({
        success: false,
        error: 'Perfil no encontrado'
      });
    }

    // Obtener perfil del usuario actual
    const currentUserProfile = await Profile.findOne({ user: req.user.id });
    
    // Verificar si lo sigue
    if (
      !currentUserProfile.following.some(
        follow => follow.user.toString() === profileToUnfollow.user.toString()
      )
    ) {
      return res.status(400).json({
        success: false,
        error: 'No sigues a este usuario'
      });
    }

    // Eliminar de la lista de seguidos
    currentUserProfile.following = currentUserProfile.following.filter(
      follow => follow.user.toString() !== profileToUnfollow.user.toString()
    );
    await currentUserProfile.save();

    // Eliminar de la lista de seguidores del otro perfil
    profileToUnfollow.followers = profileToUnfollow.followers.filter(
      follower => follower.user.toString() !== req.user.id
    );
    await profileToUnfollow.save();

    res.status(200).json({
      success: true,
      data: currentUserProfile
    });
  } catch (error) {
    console.error('Error al dejar de seguir usuario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Perfil no encontrado'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al dejar de seguir al usuario' 
    });
  }
};

// @desc    Actualizar información de modelo
// @route   PUT /api/profiles/model
// @access  Private/Model
exports.updateModelInfo = async (req, res, next) => {
  try {
    // Verificar que el perfil pertenece al usuario
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Perfil no encontrado'
      });
    }

    // Verificar que el usuario sea un modelo
    const user = await User.findById(req.user.id);
    if (user.role !== 'model') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar información de modelo'
      });
    }

    const {
      bio,
      category,
      tags,
      availability,
      rates,
      contentPreferences,
      paymentMethods,
      verificationStatus,
      socialMediaLinks,
      gallery,
      isOnline,
      lastActive
    } = req.body;

    // Construir objeto de información de modelo
    const modelInfo = {};
    
    if (bio) modelInfo.bio = bio;
    if (category) modelInfo.category = category;
    if (tags) modelInfo.tags = tags;
    if (availability) modelInfo.availability = availability;
    if (rates) modelInfo.rates = rates;
    if (contentPreferences) modelInfo.contentPreferences = contentPreferences;
    if (paymentMethods) modelInfo.paymentMethods = paymentMethods;
    if (verificationStatus) modelInfo.verificationStatus = verificationStatus;
    if (socialMediaLinks) modelInfo.socialMediaLinks = socialMediaLinks;
    if (gallery) modelInfo.gallery = gallery;
    if (isOnline !== undefined) modelInfo.isOnline = isOnline;
    if (lastActive) modelInfo.lastActive = lastActive;

    // Actualizar perfil
    profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { 
        isModel: true,
        modelInfo: { ...profile.modelInfo, ...modelInfo },
        $addToSet: { roles: 'model' }
      },
      { new: true, runValidators: true }
    );

    // Actualizar rol del usuario si es necesario
    if (user.role !== 'model') {
      user.role = 'model';
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error al actualizar información de modelo:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar la información de modelo' 
    });
  }
};

// @desc    Subir foto de perfil
// @route   PUT /api/profiles/photo
// @access  Private
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    // Verificar que el perfil existe
    let profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: 'Perfil no encontrado'
      });
    }

    // Verificar que se haya subido un archivo
    if (!req.files || !req.files.photo) {
      return res.status(400).json({
        success: false,
        error: 'Por favor sube un archivo de imagen'
      });
    }

    const file = req.files.photo;

    // Verificar que el archivo sea una imagen
    if (!file.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        error: 'Por favor sube un archivo de imagen válido (jpg, jpeg, png, gif)'
      });
    }

    // Verificar el tamaño de la imagen (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        error: 'La imagen no puede ser mayor a 5MB'
      });
    }

    // Crear nombre de archivo único
    file.name = `photo_${profile._id}${path.parse(file.name).ext}`;

    // Mover el archivo a la carpeta de uploads
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
      if (err) {
        console.error('Error al subir la imagen:', err);
        return res.status(500).json({
          success: false,
          error: 'Error al subir la imagen'
        });
      }

      // Actualizar perfil con la nueva foto
      profile = await Profile.findByIdAndUpdate(
        profile._id,
        { photo: file.name },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        data: profile
      });
    });
  } catch (error) {
    console.error('Error al subir foto de perfil:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al subir la foto de perfil' 
    });
  }
};
