#!/bin/bash
# Script para instalar dependencias del proyecto

echo "Instalando dependencias..."

# Instalar dependencias principales
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material

# Instalar dependencias de desarrollo
npm install -D @types/react @types/react-dom @types/node @types/jest @types/react-router-dom

# Instalar herramientas de testing
npm install -D @testing-library/jest-dom @testing-library/react @testing-library/user-event

# Instalar herramientas de TypeScript y ESLint
npm install -D typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin

# Instalar Vite y plugins
npm install -D vite @vitejs/plugin-react vite-tsconfig-paths

# Instalar herramientas de pruebas
npm install -D vitest @vitest/coverage-v8 @vitest/ui

echo "Instalación completada."
