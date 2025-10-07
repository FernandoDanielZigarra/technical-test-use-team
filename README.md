# Technical Test - UseTeam

Aplicación full-stack de gestión de proyectos con tableros Kanban, autenticación y colaboración en tiempo real.

## 🚀 Inicio Rápido

### Con Docker (Recomendado)

```bash
# Clonar repositorio
git clone <repository-url>
cd technical-test-useTeam

# Iniciar todos los servicios
docker-compose up --build
```

### Sin Docker

**Backend:**
```bash
cd backend
pnpm install
pnpm prisma migrate dev
pnpm run start:dev
```

**Frontend:**
```bash
cd frontend
pnpm install
pnpm run dev
```

## 🌐 Acceso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Database**: PostgreSQL en puerto 5432

## 📚 Documentación

- [Arquitectura del Frontend](./frontend/ARCHITECTURE.md)
- [Resumen de Refactorización](./frontend/REFACTORING_SUMMARY.md)

## 🛠️ Stack Tecnológico

**Backend:**
- NestJS + Prisma ORM
- PostgreSQL
- JWT Authentication
- WebSockets

**Frontend:**
- React 18 + TypeScript
- React Router 7
- Redux Toolkit + RTK Query
- Tailwind CSS
- Vite