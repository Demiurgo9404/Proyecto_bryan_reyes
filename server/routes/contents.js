const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const contentController = require('../controllers/contentController');
const { protect } = require('../middleware/auth'); // Cambiado a la importación nombrada
const admin = require('../middleware/admin');
const model = require('../middleware/model');

// Verificar que los controladores son funciones antes de usarlos
const verifyController = (controller, method) => {
  // Verificar que el controlador existe
  if (!controller) {
    console.error('Error: El controlador no está definido');
    process.exit(1);
  }
  
  // Verificar que el método existe en el controlador
  if (typeof controller[method] !== 'function') {
    console.error(`Error: ${method} no es una función en el controlador`);
    console.error('Métodos disponibles:', Object.keys(controller));
    process.exit(1);
  }
  
  // Devolver el manejador del controlador
  return (req, res, next) => {
    try {
      return controller[method](req, res, next);
    } catch (error) {
      console.error(`Error en el controlador ${method}:`, error);
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  };
};

// Rutas públicas
router.get('/', contentController.getContents);
router.get('/featured', contentController.getFeaturedContents);
router.get('/trending', contentController.getTrendingContents);
router.get('/latest', contentController.getLatestContents);
router.get('/category/:category', contentController.getContentsByCategory);
router.get('/user/:userId', contentController.getUserContents);
router.get('/search', contentController.searchContents);
router.get('/:id', contentController.getContentById);

// Rutas protegidas
router.post(
  '/',
  [
    protect,
    [
      check('title', 'El título es obligatorio').not().isEmpty(),
      check('description').optional().isLength({ max: 2000 }),
      check('type').isIn(['image', 'video', 'audio', 'text', 'album']),
      check('category').not().isEmpty(),
      check('tags').optional().isArray()
    ]
  ],
  verifyController(contentController, 'createContent')
);

router.put(
  '/:id',
  [
    protect,
    [
      check('title').optional().notEmpty(),
      check('description').optional().isLength({ max: 2000 }),
      check('tags').optional().isArray()
    ]
  ],
  verifyController(contentController, 'updateContent')
);

router.delete('/:id', protect, verifyController(contentController, 'deleteContent'));
router.post('/:id/like', protect, verifyController(contentController, 'likeContent'));
router.post('/:id/comment', protect, verifyController(contentController, 'addComment'));
router.delete('/:id/comment/:commentId', protect, verifyController(contentController, 'deleteComment'));
router.post('/:id/report', protect, verifyController(contentController, 'reportContent'));

// Rutas de administrador
router.put('/:id/feature', [auth, admin], contentController.featureContent);
router.put('/:id/status', [auth, admin], contentController.updateContentStatus);

module.exports = router;
