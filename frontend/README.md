# 🎨 Frontend - Kanban Board Application

## 📝 Descripción del Proyecto

Aplicación web moderna tipo **Trello** construida con **React Router** y **Vite** que permite gestionar proyectos mediante un tablero Kanban colaborativo. Ofrece actualización en tiempo real mediante WebSockets, drag & drop fluido, y gestión completa de tareas, columnas y proyectos.

### Características Principales

- 🎯 **Tablero Kanban Interactivo** - Gestión visual de tareas con drag & drop
- ⚡ **Tiempo Real** - Sincronización instantánea entre usuarios vía WebSockets
- 🔐 **Autenticación Completa** - Login, registro y gestión de sesiones
- 🎨 **Interfaz Moderna** - Diseño responsive con TailwindCSS
- 🌓 **Modo Oscuro** - Theme switcher claro/oscuro
- 📊 **Redux Toolkit** - Estado global optimizado con RTK Query
- 🔄 **Colaboración** - Múltiples usuarios trabajando en el mismo proyecto
- 📤 **Exportación** - Descarga de tareas en formato CSV

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.x | Librería UI |
| **React Router** | 7.x | Enrutamiento y SSR |
| **Vite** | 6.x | Build tool ultrarrápido |
| **Redux Toolkit** | 2.x | Estado global |
| **RTK Query** | - | Caché y fetching de datos |
| **Socket.io Client** | 4.x | WebSockets en tiempo real |
| **TailwindCSS** | 3.x | Estilos utility-first |
| **@hello-pangea/dnd** | 17.x | Drag and drop |
| **TypeScript** | 5.x | Type safety |

## 📁 Estructura del Proyecto

```
app/
├── api/                      # Servicios API (RTK Query)
│   ├── authApi.ts           # Auth endpoints
│   ├── projectsApi.ts       # Projects endpoints
│   └── userApi.ts           # User endpoints
├── components/              # Componentes React
│   ├── auth/               # Login, Register
│   ├── common/             # Button, Input, Modal, etc.
│   ├── layout/             # Navbar, UserMenu
│   └── project-board/      # Componentes del tablero Kanban
├── hooks/                   # Custom hooks
│   ├── useAuth.tsx         # Autenticación
│   ├── useSocket.ts        # WebSocket connection
│   ├── useProjectBoard.ts  # Lógica del tablero
│   └── useTheme.tsx        # Theme switcher
├── routes/                  # Páginas de la app
│   ├── home.tsx            # Pantalla de bienvenida
│   ├── projects.tsx        # Lista de proyectos
│   ├── project.$id.tsx     # Tablero Kanban
│   └── 404.tsx             # Página not found
├── store/                   # Redux store
│   ├── index.ts            # Store configuration
│   └── slices/             # Redux slices
├── services/                # Servicios adicionales
│   └── socket.service.ts   # Socket.io service
├── interfaces/              # TypeScript interfaces
├── utils/                   # Utilidades
└── middleware/              # Middlewares (auth, etc.)
```

## ⚙️ Datos a Considerar

### � Variables de Entorno Requeridas

Crea un archivo `.env` en la raíz del frontend (usa `.env.example` como template):

```bash
# Backend API URL
VITE_API_URL=http://localhost:3000

# WebSocket URL (opcional - usa VITE_API_URL por defecto)
VITE_SOCKET_URL=http://localhost:3000
```

> ⚠️ **Importante**: 
> - Todas las variables deben tener el prefijo `VITE_` para ser accesibles en el cliente
> - Para producción, cambia `localhost` por la URL de tu servidor
> - El frontend necesita que el backend esté corriendo para funcionar

### 🎨 Temas y Estilos

El proyecto incluye:
- **TailwindCSS** para estilos utility-first
- **Modo Oscuro** implementado con hook `useTheme`
- **Componentes reutilizables** en `components/common/`
- **Diseño responsive** para móvil, tablet y desktop

### 🔄 Flujo de Autenticación

1. Usuario se registra o inicia sesión
2. Backend genera JWT token
3. Token se guarda en localStorage
4. Token se incluye en todas las peticiones API
5. Redux mantiene el estado de autenticación
6. Middleware protege rutas privadas

### 🎯 Funcionalidades del Tablero

**Gestión de Proyectos:**
- ✅ Crear, editar, eliminar proyectos
- ✅ Agregar/remover participantes
- ✅ Ver lista de proyectos del usuario

**Gestión de Columnas:**
- ✅ Crear columnas personalizadas
- ✅ Editar nombres de columnas
- ✅ Eliminar columnas (con confirmación)

**Gestión de Tareas:**
- ✅ Crear tareas con título y descripción
- ✅ Mover tareas entre columnas (drag & drop)
- ✅ Editar tareas existentes
- ✅ Eliminar tareas
- ✅ Ver detalles de cada tarea

**Colaboración en Tiempo Real:**
- ✅ Ver cambios de otros usuarios al instante
- ✅ Notificaciones cuando se crean/editan/eliminan tareas
- ✅ Sincronización automática del tablero

## 🚀 Instalación y Ejecución

### Opción 1: Con Docker (Recomendado)

```bash
# Desde la raíz del proyecto
docker-compose up -d

# El frontend estará disponible en http://localhost:5173
```

### Opción 2: Desarrollo Local

#### Prerequisitos

- Node.js 18+ y pnpm
- Backend corriendo en http://localhost:3000

#### Pasos

1. **Instalar dependencias**

```bash
pnpm install
```

2. **Configurar variables de entorno**

```bash
cp .env.example .env
# Edita .env si necesitas cambiar VITE_API_URL
```

3. **Iniciar servidor de desarrollo**

```bash
pnpm run dev
```

La aplicación estará disponible en **http://localhost:5173**

## 📜 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev                # Servidor con HMR en puerto 5173
pnpm run build              # Build para producción

# Producción
pnpm run start              # Servidor de producción

# Type checking
pnpm run typecheck          # Verificar tipos TypeScript

# Linting y formato
pnpm run lint               # ESLint (si está configurado)
```

## 🏗️ Build para Producción

```bash
# Compilar aplicación
pnpm run build

# La salida estará en:
build/
├── client/    # Assets estáticos (HTML, CSS, JS, imágenes)
└── server/    # Código server-side (SSR)
```

## 🎨 Personalización

### Cambiar Colores del Theme

Edita `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#your-color',
      secondary: '#your-color',
    }
  }
}
```

### Agregar Nuevas Rutas

1. Crea un archivo en `app/routes/`
2. El nombre del archivo define la ruta:
   - `about.tsx` → `/about`
   - `blog.$slug.tsx` → `/blog/:slug`
3. Exporta un componente por defecto

```tsx
export default function About() {
  return <div>About Page</div>;
}
```

## 📚 Recursos y Documentación

- [React Router Documentation](https://reactrouter.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Socket.io Client Documentation](https://socket.io/docs/v4/client-api/)

## 🔧 Troubleshooting

### Error: "Failed to fetch" o "Network Error"

**Causa:** Backend no está corriendo o URL incorrecta.

**Solución:**
1. Verifica que el backend esté corriendo: `curl http://localhost:3000`
2. Revisa `VITE_API_URL` en `.env`
3. Asegúrate de que no haya problemas de CORS

### WebSocket no conecta

**Causa:** Socket.io no puede conectar con el backend.

**Solución:**
1. Verifica que el backend esté corriendo
2. Revisa la URL de WebSocket en `VITE_SOCKET_URL`
3. Abre DevTools → Network → WS para ver intentos de conexión

### Estilos no se aplican

**Causa:** TailwindCSS no está compilando.

**Solución:**
1. Reinicia el servidor de desarrollo
2. Verifica que `tailwind.config.js` esté configurado correctamente
3. Asegúrate de que el CSS incluya las directivas de Tailwind:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

### Hot Module Replacement no funciona

**Causa:** Vite no detecta cambios en archivos.

**Solución:**
1. Reinicia el servidor: `Ctrl+C` y `pnpm run dev`
2. Limpia caché de Vite: `rm -rf node_modules/.vite`
3. Verifica que el archivo esté dentro de `app/`

---

**Built with ❤️ using React Router + Vite**

