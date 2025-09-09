/**
 * PM2 Configuration File
 * Configuración para el despliegue en producción de LoveRose
 */

module.exports = {
  apps: [
    // Aplicación backend
    {
      name: 'love-rose-backend',
      script: 'backend/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NODE_OPTIONS: '--max-old-space-size=1024'
      },
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      log_file: 'logs/combined.log',
      time: true,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
    // Tarea programada para limpieza de archivos temporales
    {
      name: 'cleanup-job',
      script: 'scripts/cleanup.js',
      instances: 1,
      autorestart: false,
      cron_restart: '0 3 * * *', // Ejecutar diariamente a las 3 AM
      env: {
        NODE_ENV: 'production'
      },
      error_file: 'logs/cleanup-error.log',
      out_file: 'logs/cleanup-out.log',
      time: true
    }
  ],

  // Configuración de despliegue
  deploy: {
    production: {
      user: 'tu_usuario',
      host: 'tudominio.com',
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/love_rose.git',
      path: '/var/www/love_rose',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=1024'
      }
    }
  }
};
