const Content = require('../models/Content');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

// @desc    Obtener todo el contenido
// @route   GET /api/contents
// @access  Public
exports.getContents = async (req, res, next) => {
  try {
    // Copiar req.query
    const reqQuery = { ...req.query };
    
    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Eliminar campos de la consulta
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Solo mostrar contenido público para usuarios no autenticados
    if (!req.user) {
      reqQuery.privacy = 'public';
      reqQuery.status = 'published';
    } else if (req.user.role !== 'admin') {
      // Para usuarios autenticados que no son admin, mostrar contenido público o su propio contenido
      if (req.query.creator && req.query.creator !== req.user.id) {
        // Si se está pidiendo contenido de otro usuario, solo mostrar contenido público
        reqQuery.privacy = 'public';
        reqQuery.status = 'published';
      } else if (!req.query.creator) {
        // Si no se especifica un creador, mostrar contenido público o del usuario actual
        reqQuery.$or = [
          { privacy: 'public', status: 'published' },
          { creator: req.user.id }
        ];
      }
    }
    
    // Crear cadena de consulta
    let queryStr = JSON.stringify(reqQuery);
    
    // Crear operadores ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Encontrar recursos
    let query = Content.find(JSON.parse(queryStr))
      .populate('creator', 'name email')
      .populate('category', 'name slug');

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

    // Búsqueda por texto
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    // Filtro por etiquetas
    if (req.query.tags) {
      const tags = Array.isArray(req.query.tags) 
        ? req.query.tags 
        : req.query.tags.split(',');
      
      query = query.find({ tags: { $in: tags } });
    }

    // Filtro por categoría
    if (req.query.category) {
      query = query.find({ 'category.slug': req.query.category });
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Content.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Ejecutar consulta
    const contents = await query;

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
      count: contents.length,
      pagination,
      data: contents
    });
  } catch (error) {
    console.error('Error al obtener contenido:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener el contenido' 
    });
  }
};

// @desc    Obtener un contenido por ID
// @route   GET /api/contents/:id
// @access  Public
exports.getContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('category', 'name slug');

    if (!content) {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar permisos para contenido privado o de pago
    if (content.privacy !== 'public' || content.pricing.type !== 'free') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Debes iniciar sesión para ver este contenido'
        });
      }

      // Verificar si el usuario es el creador o un administrador
      if (content.creator._id.toString() !== req.user.id && req.user.role !== 'admin') {
        // Verificar si el contenido es de pago y el usuario lo ha comprado
        if (content.pricing.type !== 'free') {
          // Aquí iría la lógica para verificar la compra
          // Por ahora, asumimos que el usuario no tiene acceso
          return res.status(403).json({
            success: false,
            error: 'No tienes permiso para ver este contenido'
          });
        }
      }
    }

    // Registrar visualización
    content.stats.views += 1;
    
    // Registrar visualización única si el usuario está autenticado
    if (req.user && !content.viewedBy.includes(req.user.id)) {
      content.viewedBy.push(req.user.id);
      content.stats.uniqueViews += 1;
    }
    
    await content.save();

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error al obtener contenido:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al obtener el contenido' 
    });
  }
};

// @desc    Crear nuevo contenido
// @route   POST /api/contents
// @access  Private
exports.createContent = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      type,
      category,
      tags,
      privacy,
      pricing,
      interactionSettings,
      metadata
    } = req.body;

    // Crear contenido
    const content = await Content.create({
      title,
      description,
      type,
      category,
      tags,
      privacy: privacy || 'public',
      pricing: {
        type: pricing?.type || 'free',
        amount: pricing?.amount || 0,
        currency: pricing?.currency || 'USD',
        ...pricing
      },
      interactionSettings: {
        allowComments: interactionSettings?.allowComments ?? true,
        allowLikes: interactionSettings?.allowLikes ?? true,
        allowShares: interactionSettings?.allowShares ?? true,
        allowDownloads: interactionSettings?.allowDownloads ?? false,
        ...interactionSettings
      },
      metadata: {
        language: metadata?.language || 'es',
        ...metadata
      },
      creator: req.user.id,
      status: 'draft'
    });

    // Si hay archivos multimedia, procesarlos
    if (req.files && req.files.length > 0) {
      const mediaFiles = [];
      
      for (const file of req.files) {
        mediaFiles.push({
          url: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
          originalName: file.originalname,
          isPreview: mediaFiles.length === 0 // La primera imagen como vista previa
        });
      }
      
      content.media = mediaFiles;
      await content.save();
    }

    res.status(201).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error al crear contenido:', error);
    
    // Eliminar archivos subidos si hay un error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = path.join(__dirname, '../public/uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al crear el contenido' 
    });
  }
};

// @desc    Actualizar contenido
// @route   PUT /api/contents/:id
// @access  Private
exports.updateContent = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario es el creador o un administrador
    if (content.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para actualizar este contenido'
      });
    }

    // Actualizar campos permitidos
    const {
      title,
      description,
      category,
      tags,
      privacy,
      pricing,
      interactionSettings,
      metadata,
      status
    } = req.body;

    if (title) content.title = title;
    if (description !== undefined) content.description = description;
    if (category) content.category = category;
    if (tags) content.tags = tags;
    if (privacy) content.privacy = privacy;
    if (pricing) content.pricing = { ...content.pricing, ...pricing };
    if (interactionSettings) {
      content.interactionSettings = { 
        ...content.interactionSettings, 
        ...interactionSettings 
      };
    }
    if (metadata) {
      content.metadata = { ...content.metadata, ...metadata };
    }
    if (status) content.status = status;

    // Procesar archivos multimedia adicionales
    if (req.files && req.files.length > 0) {
      const mediaFiles = [...content.media];
      
      for (const file of req.files) {
        mediaFiles.push({
          url: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          size: file.size,
          originalName: file.originalname,
          isPreview: mediaFiles.length === 0
        });
      }
      
      content.media = mediaFiles;
    }

    await content.save();

    res.status(200).json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error al actualizar contenido:', error);
    
    // Eliminar archivos subidos si hay un error
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const filePath = path.join(__dirname, '../public/uploads', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al actualizar el contenido' 
    });
  }
};

// @desc    Eliminar contenido
// @route   DELETE /api/contents/:id
// @access  Private
exports.deleteContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar que el usuario es el creador o un administrador
    if (content.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar este contenido'
      });
    }

    // Eliminar archivos multimedia asociados
    for (const media of content.media) {
      const filePath = path.join(__dirname, '../public', media.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await content.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar contenido:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar el contenido' 
    });
  }
};

// @desc    Dar like a un contenido
// @route   PUT /api/contents/:id/like
// @access  Private
exports.likeContent = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar si el usuario ya dio like
    const likeIndex = content.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex !== -1) {
      // Quitar like
      content.likes.splice(likeIndex, 1);
      content.stats.likes = Math.max(0, content.stats.likes - 1);
      await content.save();

      return res.status(200).json({
        success: true,
        data: { liked: false, likes: content.stats.likes }
      });
    }

    // Agregar like
    content.likes.unshift({ user: req.user.id });
    content.stats.likes += 1;
    await content.save();

    // Aquí podrías agregar notificaciones, etc.

    res.status(200).json({
      success: true,
      data: { liked: true, likes: content.stats.likes }
    });
  } catch (error) {
    console.error('Error al dar like al contenido:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al dar like al contenido' 
    });
  }
};

// @desc    Añadir comentario a un contenido
// @route   POST /api/contents/:id/comments
// @access  Private
exports.addComment = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar permisos para comentar
    if (!content.interactionSettings.allowComments) {
      return res.status(403).json({
        success: false,
        error: 'Los comentarios están deshabilitados para este contenido'
      });
    }

    // Crear comentario
    const newComment = {
      user: req.user.id,
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar
    };

    content.comments.unshift(newComment);
    content.stats.comments += 1;
    
    await content.save();

    // Poblar información del usuario para la respuesta
    await content.populate('comments.user', 'name email');
    const addedComment = content.comments[0];

    // Aquí podrías agregar notificaciones, etc.

    res.status(201).json({
      success: true,
      data: addedComment
    });
  } catch (error) {
    console.error('Error al agregar comentario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al agregar el comentario' 
    });
  }
};

// @desc    Eliminar comentario
// @route   DELETE /api/contents/:id/comments/:comment_id
// @access  Private
exports.deleteComment = async (req, res, next) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }

    // Encontrar el comentario
    const commentIndex = content.comments.findIndex(
      comment => comment._id.toString() === req.params.comment_id
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Comentario no encontrado'
      });
    }

    // Verificar que el usuario es el autor del comentario o un administrador
    if (
      content.comments[commentIndex].user.toString() !== req.user.id && 
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para eliminar este comentario'
      });
    }

    // Eliminar comentario
    content.comments.splice(commentIndex, 1);
    content.stats.comments = Math.max(0, content.stats.comments - 1);
    
    await content.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: 'Contenido o comentario no encontrado'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al eliminar el comentario' 
    });
  }
};

// @desc    Reportar contenido
// @route   POST /api/contents/:id/report
// @access  Private
exports.reportContent = async (req, res, next) => {
  try {
    // Validar campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }

    // Verificar si el usuario ya reportó este contenido
    const reportIndex = content.reports.findIndex(
      report => report.user.toString() === req.user.id
    );

    if (reportIndex !== -1) {
      return res.status(400).json({
        success: false,
        error: 'Ya has reportado este contenido'
      });
    }

    // Agregar reporte
    content.reports.unshift({
      user: req.user.id,
      reason: req.body.reason,
      details: req.body.details || ''
    });
    
    content.stats.reports += 1;
    
    // Si el contenido tiene muchos reportes, marcarlo para revisión
    if (content.reports.length >= 5) {
      content.status = 'under_review';
      // Aquí podrías notificar a los administradores
    }
    
    await content.save();

    res.status(200).json({
      success: true,
      message: 'Contenido reportado correctamente',
      reports: content.reports.length
    });
  } catch (error) {
    console.error('Error al reportar contenido:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        error: `Contenido no encontrado con el id ${req.params.id}`
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: 'Error al reportar el contenido' 
    });
  }
};
