# 🎯 Backend - Kanban Board API

## 📝 Descripción del Proyecto

API RESTful construida con **NestJS** para gestionar un tablero Kanban colaborativo en tiempo real. Proporciona endpoints para autenticación, gestión de proyectos, columnas y tareas, además de comunicación en tiempo real mediante WebSockets.

### Características Principales

- 🔐 **Autenticación JWT** - Sistema seguro de login y registro
- 🗂️ **CRUD Completo** - Proyectos, columnas y tareas
- ⚡ **WebSockets** - Sincronización en tiempo real entre usuarios
- 📊 **Prisma ORM** - Abstracción elegante de base de datos
- 🏗️ **Arquitectura Modular** - Separación por features (auth, projects, tasks, etc.)
- 🔄 **MongoDB Replica Set** - Soporte para transacciones ACID
- 📤 **Integración N8N** - Webhooks para exportación automatizada

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **NestJS** | 11.x | Framework principal |
| **Prisma** | 6.x | ORM para MongoDB |
| **Socket.io** | 4.x | WebSockets en tiempo real |
| **MongoDB** | 7.0 | Base de datos NoSQL |
| **JWT** | - | Autenticación segura |
| **TypeScript** | 5.x | Type safety |

## 📁 Estructura del Proyecto

```
src/
├── features/          # Módulos por funcionalidad
│   ├── auth/         # Autenticación y autorización
│   ├── projects/     # Gestión de proyectos
│   ├── columns/      # Gestión de columnas
│   ├── tasks/        # Gestión de tareas
│   ├── users/        # Gestión de usuarios
│   └── socket/       # Gateway de WebSockets
├── core/             # Servicios centrales
│   └── prisma/       # Configuración de Prisma
├── shared/           # Utilidades compartidas
│   └── utils/        # Helpers (JWT, passwords, etc.)
└── common/           # Tipos y constantes
    └── types/        # Interfaces TypeScript
```

## ⚙️ Datos a Considerar

### 🔑 Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del backend (usa `.env.example` como template):

```bash
# Database
DATABASE_URL="mongodb://root:example@localhost:27017/kanban-board?authSource=admin&replicaSet=rs0"
MONGODB_URI="mongodb://root:example@localhost:27017/kanban-board?authSource=admin&replicaSet=rs0"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-me-in-production"

# Server
PORT=3000
NODE_ENV=development
```

> ⚠️ **Importante**: 
> - Para desarrollo con Docker, reemplaza `localhost` por `mongo` en las URLs de la base de datos
> - El JWT_SECRET debe ser una cadena aleatoria fuerte en producción
> - MongoDB debe estar configurado como Replica Set para que Prisma pueda usar transacciones

### 🗄️ Base de Datos

El backend utiliza **MongoDB con Replica Set** configurado. Esto es **obligatorio** porque:

1. Prisma requiere Replica Set para usar transacciones (`$transaction`)
2. Las operaciones en `tasks.service.ts` y `columns.service.ts` usan transacciones
3. Sin Replica Set, la aplicación fallará al intentar operaciones transaccionales

### 🔌 Endpoints Principales

```
POST   /auth/register          # Registrar nuevo usuario
POST   /auth/login             # Iniciar sesión
GET    /projects               # Listar proyectos del usuario
POST   /projects               # Crear nuevo proyecto
GET    /projects/:id           # Obtener proyecto específico
POST   /columns                # Crear columna
PATCH  /columns/:id            # Actualizar columna
DELETE /columns/:id            # Eliminar columna
POST   /tasks                  # Crear tarea
PATCH  /tasks/:id              # Actualizar tarea
DELETE /tasks/:id              # Eliminar tarea
POST   /tasks/export           # Exportar tareas a CSV (vía N8N)
```

### 🔄 WebSocket Events

```typescript
// Client → Server
'joinProject'          # Unirse a sala de proyecto
'leaveProject'         # Salir de sala de proyecto

// Server → Client
'taskCreated'          # Nueva tarea creada
'taskUpdated'          # Tarea actualizada
'taskDeleted'          # Tarea eliminada
'columnCreated'        # Nueva columna creada
'columnUpdated'        # Columna actualizada
'columnDeleted'        # Columna eliminada
```

## 🚀 Instalación y Ejecución

### Opción 1: Con Docker (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# El backend estará disponible en http://localhost:3000
```

### Opción 2: Desarrollo Local

#### Prerequisitos

- Node.js 18+ y pnpm
- MongoDB 7.0+ configurado como Replica Set
- OpenSSL (para generar keyfile de MongoDB)

#### Pasos

1. **Instalar dependencias**

```bash
pnpm install
```

2. **Configurar variables de entorno**

```bash
cp .env.example .env
# Edita .env con tus valores
```

3. **Generar Prisma Client**

```bash
pnpm prisma generate
```

4. **Ejecutar migraciones** (si es necesario)

```bash
pnpm prisma db push
```

5. **Iniciar en modo desarrollo**

```bash
pnpm run start:dev
```

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm run start:dev          # Modo watch con hot-reload
pnpm run start              # Modo normal
pnpm run start:prod         # Modo producción

# Build
pnpm run build              # Compilar TypeScript

# Testing
pnpm run test               # Unit tests
pnpm run test:e2e           # E2E tests
pnpm run test:cov           # Test coverage

# Prisma
pnpm prisma generate        # Generar Prisma Client
pnpm prisma db push         # Sincronizar schema con DB
pnpm prisma studio          # Abrir Prisma Studio (GUI)

# Linting
pnpm run lint               # Ejecutar ESLint
pnpm run format             # Formatear código con Prettier
```

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov
```

## 📚 Recursos y Documentación

- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [MongoDB Documentation](https://docs.mongodb.com)

## 🔧 Troubleshooting

### Error: "Transactions are not supported by this deployment"

**Causa:** MongoDB no está configurado como Replica Set.

**Solución:** Asegúrate de que MongoDB esté corriendo con Replica Set. Si usas Docker Compose (recomendado), esto ya está configurado.

### Error: "PrismaClient is unable to connect to the database"

**Causa:** URL de conexión incorrecta o MongoDB no está corriendo.

**Solución:**
1. Verifica que MongoDB esté corriendo: `docker ps` o `mongosh`
2. Revisa la variable `DATABASE_URL` en `.env`
3. Para Docker, usa `mongo` como host; para local, usa `localhost`

### Puerto 3000 ya en uso

**Solución:**
```bash
# Encuentra el proceso
lsof -ti:3000

# Mata el proceso
kill -9 <PID>

# O cambia el puerto en .env
PORT=3001
```

---

**Built with ❤️ using NestJS**
