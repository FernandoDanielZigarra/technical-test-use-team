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

> 📘 **Nota:** Los valores por defecto en `.env.example` funcionan correctamente para desarrollo con Docker. 

**⚠️ IMPORTANTE para Docker:** 
Después de copiar el archivo `backend/.env`, debes **modificar las URLs de MongoDB** para usar el nombre del servicio Docker en lugar de `localhost`:

Abre `backend/.env` y cambia:
```bash
# Cambia esto:
DATABASE_URL="mongodb://root:example@localhost:27017/kanban-board?authSource=admin&replicaSet=rs0"

# Por esto:
DATABASE_URL="mongodb://root:example@mongo:27017/kanban-board?authSource=admin&replicaSet=rs0"
```

**Variables importantes a configurar:**

**Backend (`backend/.env`):**
- `DATABASE_URL` - **Debe usar `mongo` en lugar de `localhost`** cuando uses Docker
- `JWT_SECRET` - Cámbialo en producción por una cadena aleatoria fuerte
- `PORT=3000` - Puerto del backend

**Frontend (`frontend/.env`):**
- `VITE_API_URL=http://localhost:3000` - URL del backend (correcto para desarrollo local)

**Docker Compose (ya configurado):**
- `MONGO_ROOT_PASSWORD=example` - Contraseña de MongoDB (definida en docker-compose.yml)
- `N8N_BASIC_AUTH_PASSWORD=admin_change_me` - Contraseña para acceder a N8N

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
# Opción 1: Usar el script automatizado (recomendado)
./build-and-up.sh

# Opción 2: Comandos manuales
docker-compose build --no-cache
docker-compose up -d
```

> 💡 **En Windows con Git Bash:** Ejecuta `bash build-and-up.sh` si el script no funciona directamente.

**¿Qué hace el script?**
1. Construye todas las imágenes Docker desde cero (sin caché)
2. Levanta todos los servicios en segundo plano (detached mode)
3. Inicializa MongoDB con Replica Set
4. Ejecuta migraciones de Prisma automáticamente

**Tiempo estimado:** 3-5 minutos en la primera ejecución.

**Resultado esperado:**
```
NAME                            STATUS          PORTS
technical-test-mongo-1          Up 2 minutes    0.0.0.0:27017->27017/tcp
technical-test-backend-1        Up 1 minute     0.0.0.0:3000->3000/tcp
technical-test-frontend-1       Up 1 minute     0.0.0.0:5173->5173/tcp
technical-test-n8n-1            Up 1 minute     0.0.0.0:5678->5678/tcp
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

---

## 🔧 Solución de Problemas Comunes

### ❌ Error: "mongo-keyfile not found"
**Causa:** El archivo keyfile de MongoDB no fue generado.
**Solución:**
```bash
openssl rand -base64 756 > mongo-keyfile
chmod 400 mongo-keyfile
```

### ❌ Error: "Cannot connect to MongoDB"
**Causa:** La URL de MongoDB en `backend/.env` usa `localhost` en lugar de `mongo`.
**Solución:** Edita `backend/.env` y cambia:
```bash
DATABASE_URL="mongodb://root:example@mongo:27017/kanban-board?authSource=admin&replicaSet=rs0"
```

### ❌ Error: "Prisma migration failed"
**Causa:** MongoDB no está listo o el Replica Set no está inicializado.
**Solución:**
```bash
# 1. Verifica que MongoDB esté corriendo
docker-compose ps

# 2. Verifica los logs de MongoDB
docker-compose logs mongo

# 3. Reinicia el backend
docker-compose restart backend
```

### ❌ Error: "Port already in use"
**Causa:** Otro servicio está usando el puerto.
**Solución:**
```bash
# Identifica qué proceso usa el puerto (Windows)
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Detén el proceso o cambia el puerto en docker-compose.yml
```

### ❌ Frontend no carga o muestra error 404
**Causa:** La variable `VITE_API_URL` no está configurada correctamente.
**Solución:** Verifica que `frontend/.env` tenga:
```bash
VITE_API_URL=http://localhost:3000
```

### ❌ WebSockets no funcionan (sin actualización en tiempo real)
**Causa:** El navegador bloquea la conexión WebSocket.
**Solución:**
- Verifica que el backend esté corriendo: `docker-compose logs backend`
- Abre la consola del navegador y busca errores de WebSocket
- Asegúrate de que el puerto 3000 esté accesible

### ❌ Error: "./build-and-up.sh: Permission denied"
**Causa:** El script no tiene permisos de ejecución.
**Solución:**
```bash
chmod +x build-and-up.sh
./build-and-up.sh
```

### 🔄 Resetear todo el proyecto
Si nada funciona, puedes resetear completamente:
```bash
# Detener y eliminar todo (⚠️ BORRA TODA LA DATA)
docker-compose down -v

# Eliminar imágenes Docker
docker-compose down --rmi all

# Regenerar keyfile
openssl rand -base64 756 > mongo-keyfile
chmod 400 mongo-keyfile

# Volver a levantar
./build-and-up.sh
```

---

## 📚 Documentación Adicional

- **[Backend README](backend/README.md)** - Arquitectura del API, endpoints, y estructura del backend
- **[Frontend README](frontend/README.md)** - Componentes, hooks, y estructura del frontend
- **[N8N Setup](n8n/setup-instructions.md)** - Configuración de workflows y automatización
- **[ENV Management Guide](ENV_MANAGEMENT_GUIDE.md)** - Guía completa de variables de entorno

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │◄────►│    Backend       │◄────►│   MongoDB       │
│   React Router  │ HTTP │    NestJS        │      │   Replica Set   │
│   Port: 5173    │ WS   │    Port: 3000    │      │   Port: 27017   │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                │
                                │ Webhook
                                ▼
                         ┌──────────────────┐
                         │       N8N        │
                         │   Port: 5678     │
                         │  (Automation)    │
                         └──────────────────┘
```

**Tecnologías principales:**
- **Frontend:** React Router 7 + Redux Toolkit + TailwindCSS + Socket.io Client
- **Backend:** NestJS 11 + Prisma 6 + Socket.io Server + JWT Auth
- **Database:** MongoDB 7.0 con Replica Set (requerido para transacciones)
- **Automation:** N8N 1.106.3 para workflows y envío de emails

---

## 👥 Funcionalidades Principales

### Autenticación y Usuarios
- ✅ Registro de usuarios con validación
- ✅ Login con JWT tokens
- ✅ Detección automática de expiración de token
- ✅ Modal de sesión expirada con redirección
- ✅ Perfil de usuario con opción de eliminar cuenta

### Gestión de Proyectos
- ✅ Crear proyectos colaborativos
- ✅ Invitar participantes por email
- ✅ Gestionar permisos de participantes
- ✅ Eliminar proyectos (solo creador)

### Tablero Kanban
- ✅ Crear columnas personalizadas
- ✅ Drag & drop de tareas entre columnas
- ✅ Asignar tareas a participantes
- ✅ Estados de tareas con colores
- ✅ Sincronización en tiempo real vía WebSockets
- ✅ Confirmación antes de eliminar columnas

### Exportación y Automatización
- ✅ Exportar proyecto a CSV
- ✅ Envío automático por email vía N8N
- ✅ Workflows configurables

---

## 🤝 Contribuciones

Este proyecto fue desarrollado como prueba técnica. Si deseas contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 📧 Contacto

**Desarrollador:** Fernando Daniel Zigarra  
**GitHub:** [@FernandoDanielZigarra](https://github.com/FernandoDanielZigarra)  
**Repository:** [technical-test-use-team](https://github.com/FernandoDanielZigarra/technical-test-use-team)

---

**¿Necesitas ayuda?** Revisa la sección de [Solución de Problemas](#-solución-de-problemas-comunes) o abre un issue en GitHub.