#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando construcción para producción...${NC}"

# Verificar si estamos en el directorio raíz
if [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    echo -e "${YELLOW}⚠️  Error: No se encontraron los directorios frontend y backend. Ejecuta este script desde la raíz del proyecto.${NC}"
    exit 1
fi

# 1. Instalar dependencias del frontend
echo -e "${BLUE}📦 Instalando dependencias del frontend...${NC}"
cd frontend
npm install --production=false

# 2. Construir el frontend
echo -e "${BLUE}🔨 Construyendo el frontend...${NC}"
npm run build

# Verificar si la construcción fue exitosa
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}❌ Error al construir el frontend. Abortando...${NC}"
    exit 1
fi

# 3. Volver al directorio raíz
cd ..

# 4. Instalar dependencias del backend
echo -e "${BLUE}📦 Instalando dependencias del backend...${NC}"
cd backend
npm install --production

# 5. Crear directorio de distribución si no existe
mkdir -p dist

# 6. Copiar archivos necesarios para producción
cp -r src/* dist/
cp package*.json dist/
cp .env* dist/ 2>/dev/null || echo -e "${YELLOW}⚠️  No se encontró archivo .env${NC}"

# 7. Crear archivo de inicio
cat > dist/start.sh << 'EOL'
#!/bin/bash
# Este archivo se genera automáticamente. No editar.

# Iniciar el servidor
NODE_ENV=production node dist/server.js
EOL

# Hacer ejecutable el script de inicio
chmod +x dist/start.sh

# 8. Crear archivo de configuración para PM2
cat > dist/ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: 'love-rose-backend',
    script: 'dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: 'logs/error.log',
    out_file: 'logs/out.log',
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
EOL

# 9. Crear directorio de logs
mkdir -p dist/logs

# 10. Volver al directorio raíz
cd ..

echo -e "${GREEN}✅ Construcción completada exitosamente!${NC}"
echo -e "${BLUE}📂 La aplicación está lista en los directorios frontend/dist y backend/dist${NC}"
echo -e "\nPara iniciar el servidor en producción, ejecuta:"
echo -e "  cd backend && npm start\n"
