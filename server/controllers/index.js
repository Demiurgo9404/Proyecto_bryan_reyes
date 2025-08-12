// Archivo índice para exportar todos los controladores
const authController = require('./authController');
const userController = require('./userController');
const profileController = require('./profileController');
const sessionController = require('./sessionController');
const contentController = require('./contentController');
const transactionController = require('./transactionController');

module.exports = {
  authController,
  userController,
  profileController,
  sessionController,
  contentController,
  transactionController
};
