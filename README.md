# 🎯 Kanban Board - Tablero Colaborativo en Tiempo Real

## 📝 Descripción del Proyecto

Aplicación web full-stack tipo **Trello** para gestión de proyectos mediante tableros Kanban colaborativos. Permite a múltiples usuarios trabajar simultáneamente en el mismo proyecto con **sincronización en tiempo real**, drag & drop de tareas, y exportación automatizada a CSV mediante **N8N**.

### ✨ Características Principales

- 🎯 **Tablero Kanban** - Gestión visual de tareas con columnas personalizables
- ⚡ **Tiempo Real** - Sincronización instantánea entre usuarios via WebSockets
- 🔐 **Autenticación JWT** - Sistema seguro de registro y login
- 🎨 **Interfaz Moderna** - UI responsive con modo claro/oscuro
- 👥 **Colaboración** - Múltiples usuarios en el mismo proyecto
- 📤 **Exportación** - Generación automática de CSV enviado por email
- 🐳 **Docker Ready** - Despliegue con un solo comando
- 🔄 **Arquitectura Modular** - Backend feature-based, frontend component-based

**Estado:** ✅ **100% COMPLETADO**

---

## 🚀 Guía de Instalación Rápida

### Prerequisitos

- **Docker** y **Docker Compose** instalados
- **Git** para clonar el repositorio
- **OpenSSL** (incluido en Git Bash para Windows)

> 💡 **Tip:** Docker Desktop incluye Docker Compose. [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop)

### 📦 Instalación en 4 Pasos

#### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/FernandoDanielZigarra/technical-test-use-team.git
cd technical-test-use-team
```

#### 2️⃣ Configurar Variables de Entorno

```bash
# Backend - Copiar y configurar
cp backend/.env.example backend/.env

# Frontend - Copiar y configurar
cp frontend/.env.example frontend/.env
```

> 📘 **Nota:** Los valores por defecto en `.env.example` funcionan correctamente para desarrollo. Si deseas personalizarlos, edita los archivos `.env` creados.

**Variables importantes a considerar:**
- `JWT_SECRET` - Cámbialo en producción por una cadena aleatoria fuerte
- `MONGO_ROOT_PASSWORD` - Contraseña de MongoDB (ya configurada en docker-compose.yml)
- `N8N_BASIC_AUTH_PASSWORD` - Contraseña para acceder a N8N

#### 3️⃣ Generar Keyfile de MongoDB

MongoDB requiere un keyfile para el Replica Set (necesario para transacciones):

```bash
# Linux / Mac / Git Bash (Windows)
openssl rand -base64 756 > mongo-keyfile
chmod 400 mongo-keyfile

# PowerShell (Windows alternativo)
# openssl rand -base64 756 | Out-File -Encoding ASCII mongo-keyfile
```

> ⚠️ **Importante:** Sin este archivo, MongoDB no iniciará correctamente.

#### 4️⃣ Levantar los Contenedores
```bash
# Ejecutar el siguiente archivo en PowerShell o Git Bash
./build-and-run.sh
```

**Resultado esperado:**
```
NAME                    STATUS          PORTS
technical-test-mongo-1    Up 2 minutes    0.0.0.0:27017->27017/tcp
technical-test-mongo-init  Up 2 minutes    ---
technical-test-backend-1  Up 1 minute     0.0.0.0:3000->3000/tcp
technical-test-frontend-1 Up 1 minute     0.0.0.0:5173->5173/tcp
technical-test-n8n-1      Up 1 minute     0.0.0.0:5678->5678/tcp
```

### 🎉 ¡Listo! Accede a las Aplicaciones

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:5173 | Aplicación principal |
| **Backend API** | http://localhost:3000 | API RESTful + WebSockets |
| **N8N** | http://localhost:5678 | Automatización y workflows |
| **MongoDB** | mongodb://localhost:27017 | Base de datos |

**Credenciales por defecto:**
- **N8N:** Usuario: `admin` / Password: `admin_change_me`
- **MongoDB:** Usuario: `root` / Password: `example_change_me`

---

## 🛠️ Comandos Útiles de Docker

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart backend

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (⚠️ borra la base de datos)
docker-compose down -v

# Reconstruir imágenes (después de cambios en código)
docker-compose up -d --build

# Ver estado de los contenedores
docker-compose ps

# Ejecutar comandos dentro de un contenedor
docker-compose exec backend sh
docker-compose exec mongo mongosh
```