# Estructura de la AplicaciÃ³n LoveRose

## Arquitectura

### Frontend (React + TypeScript)

`
frontend/
â”œâ”€â”€ public/                 # Assets estÃ¡ticos
â””â”€â”€ src/
    â”œâ”€â”€ api/               # Clientes y configuraciones de API
    â”œâ”€â”€ application/        # LÃ³gica de aplicaciÃ³n
    â”‚   â”œâ”€â”€ dtos/          # Objetos de transferencia de datos
    â”‚   â”œâ”€â”€ interfaces/     # Interfaces de servicios
    â”‚   â”œâ”€â”€ services/      # ImplementaciÃ³n de servicios
    â”‚   â””â”€â”€ useCases/      # Casos de uso de la aplicaciÃ³n
    â”œâ”€â”€ components/         # Componentes de UI reutilizables
    â”œâ”€â”€ config/             # Configuraciones
    â”œâ”€â”€ contexts/           # Contextos de React
    â”œâ”€â”€ domain/             # LÃ³gica de dominio
    â”‚   â”œâ”€â”€ entities/       # Entidades de dominio
    â”‚   â”œâ”€â”€ interfaces/     # Interfaces de dominio
    â”‚   â”œâ”€â”€ repositories/   # Interfaces de repositorios
    â”‚   â”œâ”€â”€ services/       # Servicios de dominio
    â”‚   â””â”€â”€ valueObjects/   # Objetos de valor
    â”œâ”€â”€ hooks/              # Custom hooks
    â”œâ”€â”€ infrastructure/     # Implementaciones de infraestructura
    â”‚   â”œâ”€â”€ api/           # Clientes HTTP
    â”‚   â”œâ”€â”€ repositories/   # ImplementaciÃ³n de repositorios
    â”‚   â””â”€â”€ services/      # Servicios externos
    â”œâ”€â”€ pages/              # Componentes de pÃ¡gina
    â”œâ”€â”€ presentation/       # Componentes de presentaciÃ³n
    â””â”€â”€ utils/              # Utilidades
`

### Backend (Node.js + Express + Sequelize)

`
backend/
â”œâ”€â”€ src/
    â”œâ”€â”€ application/        # Casos de uso
    â”‚   â”œâ”€â”€ use-cases/     # Casos de uso especÃ­ficos
    â”‚   â””â”€â”€ services/      # Servicios de aplicaciÃ³n
    â”œâ”€â”€ config/            # Configuraciones
    â”œâ”€â”€ domain/            # LÃ³gica de negocio
    â”‚   â”œâ”€â”€ entities/      # Entidades de dominio
    â”‚   â”œâ”€â”€ repositories/  # Interfaces de repositorios
    â”‚   â”œâ”€â”€ value-objects/ # Objetos de valor
    â”‚   â””â”€â”€ exceptions/    # Excepciones de dominio
    â”œâ”€â”€ infrastructure/    # Implementaciones concretas
    â”‚   â”œâ”€â”€ persistence/   # ORM y bases de datos
    â”‚   â”œâ”€â”€ auth/         # AutenticaciÃ³n y autorizaciÃ³n
    â”‚   â””â”€â”€ external-services/ # Servicios externos
    â”œâ”€â”€ interfaces/        # Controladores y rutas
    â”‚   â”œâ”€â”€ http/         # API REST
    â”‚   â””â”€â”€ websockets/   # WebSockets
    â””â”€â”€ tests/             # Pruebas
        â”œâ”€â”€ unit/         # Pruebas unitarias
        â””â”€â”€ integration/  # Pruebas de integraciÃ³n
`

## ConfiguraciÃ³n Inicial

1. Copiar el archivo .env.example a .env y configurar las variables necesarias
2. Instalar dependencias:
   `ash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   `

3. Iniciar la aplicaciÃ³n:
   `ash
   # Frontend
   cd frontend
   npm run dev
   
   # Backend (en otra terminal)
   cd backend
   npm run dev
   `

## Convenciones de CÃ³digo

- **Nombres de archivos**: Usar kebab-case para archivos y carpetas
- **Componentes**: Usar PascalCase para nombres de componentes
- **Hooks**: Prefijo 'use' (ej: useAuth, useForm)
- **Tipos/Interfaces**: Prefijo 'I' (ej: IUser, IRepository)
- **Constantes**: UPPER_SNAKE_CASE

## Pruebas

Ejecutar pruebas:

`ash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
`

## Despliegue

Ver la documentaciÃ³n de despliegue en DEPLOYMENT.md
