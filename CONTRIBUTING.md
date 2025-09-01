# Guía de Contribución

## 1. Configuración del Entorno

### Requisitos
- Node.js 16+
- npm 8+
- PostgreSQL 13+
- Git

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/loverose.git
cd loverose

# Instalar dependencias
cd frontend
npm install

cd ../backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales
```

## 2. Convenciones de Código

### Estilo de Código
- Usar ESLint y Prettier
- Siguen el estándar Airbnb JavaScript Style Guide
- Máximo 100 caracteres por línea

### Convención de Commits
Usamos Conventional Commits:
```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

## 3. Proceso de Desarrollo

1. Crear una rama desde `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/nueva-funcionalidad
   ```

2. Hacer commits atómicos con mensajes descriptivos

3. Hacer push de los cambios:
   ```bash
   git push -u origin feature/nueva-funcionalidad
   ```

4. Crear un Pull Request a `develop`

## 4. Pruebas
- Escribir pruebas unitarias para nueva funcionalidad
- Ejecutar pruebas antes de hacer push:
  ```bash
  npm test
  ```
- Cobertura mínima de pruebas: 80%

## 5. Revisión de Código
- Al menos una aprobación requerida para merge
- Comentar usando el formato:
  ```markdown
  **Sugerencia:** [descripción]
  
  **Pregunta:** [pregunta]
  
  **Bloqueante:** [razón]
  ```

## 6. Despliegue
- Los cambios en `main` se despliegan automáticamente a producción
- Usar etiquetas semánticas para releases:
  ```bash
  git tag -a v1.2.3 -m "Release 1.2.3"
  git push origin v1.2.3
  ```
