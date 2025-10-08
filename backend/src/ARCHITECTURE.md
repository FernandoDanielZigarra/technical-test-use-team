# Arquitectura del Backend

## 📁 Estructura de Carpetas

Este proyecto sigue una arquitectura **Feature-based** que organiza el código por funcionalidades de dominio, manteniendo una separación clara de responsabilidades.

```
backend/src/
├── features/              # Módulos de funcionalidades
│   ├── auth/             # Autenticación y autorización
│   ├── tasks/            # Gestión de tareas
│   ├── columns/          # Gestión de columnas del tablero
│   ├── projects/         # Gestión de proyectos
│   ├── users/            # Gestión de usuarios
│   └── socket/           # WebSocket para actualizaciones en tiempo real
├── core/                 # Servicios core del sistema
│   └── prisma/          # Cliente Prisma y configuración de BD
├── shared/               # Código compartido entre features
│   ├── utils/           # Utilidades (JWT, password, etc.)
│   └── export/          # Servicio de exportación
├── common/               # Tipos, interfaces y decorators comunes
│   └── types/           # Tipos TypeScript compartidos
├── app.module.ts         # Módulo principal de la aplicación
├── app.controller.ts     # Controlador raíz
├── app.service.ts        # Servicio raíz
└── main.ts              # Punto de entrada de la aplicación
```

## 🎯 Principios de Organización

### 1. **Features (Funcionalidades)**
Cada feature es un módulo independiente que contiene:
- **Controllers**: Manejo de rutas HTTP
- **Services**: Lógica de negocio
- **DTOs**: Objetos de transferencia de datos
- **Interfaces**: Tipos específicos del dominio
- **Guards**: Guardias personalizadas (si aplica)
- **Tests**: Tests unitarios y de integración

**Ejemplo de estructura de un feature:**
```
features/tasks/
├── tasks.controller.ts      # @Controller('tasks')
├── tasks.service.ts          # Lógica de negocio
├── tasks.module.ts           # Módulo NestJS
├── dto/                      # DTOs para validación
├── tasks.controller.spec.ts  # Tests del controlador
└── tasks.service.spec.ts     # Tests del servicio
```

### 2. **Core (Núcleo)**
Contiene servicios fundamentales del sistema que son utilizados por múltiples features:
- **Prisma**: Cliente ORM para acceso a la base de datos
- Configuración de base de datos
- Servicios de infraestructura

### 3. **Shared (Compartido)**
Código reutilizable entre diferentes features:
- **Utils**: Utilidades generales (JWT, encriptación, etc.)
- **Export**: Servicios compartidos de exportación
- Helpers y funciones auxiliares

### 4. **Common (Común)**
Elementos comunes de TypeScript:
- **Types**: Interfaces y tipos TypeScript
- **Decorators**: Decoradores personalizados
- **Filters**: Filtros de excepciones
- **Interceptors**: Interceptores HTTP
- **Pipes**: Pipes de validación

## 🔄 Rutas de la API

Las rutas **NO dependen** de la ubicación física de los archivos. Se definen mediante decoradores:

```typescript
// En features/tasks/tasks.controller.ts
@Controller('tasks')  // Define la ruta /tasks
export class TasksController {
  @Get()              // GET /tasks
  @Post()             // POST /tasks
  @Get(':id')         // GET /tasks/:id
}
```

## 📦 Importaciones

### Reglas de Importación

1. **Desde un feature a otro feature**: Usar rutas relativas
   ```typescript
   import { ProjectsService } from '../projects/projects.service';
   ```

2. **Desde un feature a core**: Usar ruta relativa hacia arriba
   ```typescript
   import { PrismaService } from '../../core/prisma/prisma.service';
   ```

3. **Desde un feature a shared**: Usar ruta relativa hacia arriba
   ```typescript
   import { JwtUtils } from '../../shared/utils';
   ```

4. **Desde un feature a common**: Usar ruta relativa hacia arriba
   ```typescript
   import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';
   ```

## ✅ Ventajas de esta Arquitectura

1. **Modularidad**: Cada feature es independiente y puede ser desarrollado/testeado por separado
2. **Escalabilidad**: Fácil agregar nuevas features sin afectar las existentes
3. **Mantenibilidad**: El código está organizado por dominio, no por tipo de archivo
4. **Claridad**: Es fácil encontrar dónde está la lógica de cada funcionalidad
5. **Testing**: Los tests están junto al código que prueban
6. **Separación de Responsabilidades**: Clara distinción entre features, core, shared y common

## 🚀 Agregar una Nueva Feature

1. Crear carpeta en `features/`
2. Crear archivos base: `[feature].module.ts`, `[feature].controller.ts`, `[feature].service.ts`
3. Importar el módulo en `app.module.ts`
4. Las rutas se configuran automáticamente mediante el decorador `@Controller()`

```typescript
// features/nueva-feature/nueva-feature.module.ts
import { Module } from '@nestjs/common';
import { NuevaFeatureController } from './nueva-feature.controller';
import { NuevaFeatureService } from './nueva-feature.service';
import { PrismaModule } from '../../core/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [NuevaFeatureController],
  providers: [NuevaFeatureService],
  exports: [NuevaFeatureService],
})
export class NuevaFeatureModule {}
```

## 🔧 Mantenimiento

- Los features deben ser lo más independientes posible
- Evitar dependencias circulares entre features
- Usar `forwardRef()` solo cuando sea absolutamente necesario
- Mantener el código shared verdaderamente genérico y reutilizable
