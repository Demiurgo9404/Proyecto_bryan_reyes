const http = require('http');
const app = require('./app');
const config = require('./config');
const logger = require('./infrastructure/logging/logger');
const { initializeDatabase } = require('./infrastructure/database');

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Consider whether to restart the process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Consider whether to restart the process in production
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Initialize the application
const startServer = async () => {
  try {
    // Initialize database connection and models
    await initializeDatabase();
    logger.info('Database initialized successfully');

    // Create HTTP server
    const server = http.createServer(app);

    // Start server
    server.listen(config.server.port, config.server.host, () => {
      logger.info(`Server running on http://${config.server.host}:${config.server.port}`);
      logger.info(`Environment: ${config.env}`);
      logger.info(`API Documentation: http://${config.server.host}:${config.server.port}${config.api.docsPath}`);
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          logger.error(`Port ${config.server.port} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          logger.error(`Port ${config.server.port} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      
      // Close the server
      server.close(async (err) => {
        if (err) {
          logger.error('Error during server shutdown:', err);
          process.exit(1);
        }

        // Close database connections
        try {
          await sequelize.close();
          logger.info('Database connection closed');
          process.exit(0);
        } catch (dbError) {
          logger.error('Error closing database connection:', dbError);
          process.exit(1);
        }
      });

      // Force shutdown if it takes too long
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();
