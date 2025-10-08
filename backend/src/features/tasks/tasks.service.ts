import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(
    columnId: string,
    userId: string,
    title: string,
    description?: string,
    assigneeId?: string | null,
  ) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { project: true },
    });

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    const hasAccess = await this.projectsService.isUserParticipant(
      column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    if (assigneeId) {
      const assigneeHasAccess = await this.projectsService.isUserParticipant(
        column.projectId,
        assigneeId,
      );
      if (!assigneeHasAccess) {
        throw new ForbiddenException(
          'El usuario asignado no es participante del proyecto',
        );
      }
    }

    const lastTask = await this.prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
    });

    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await this.prisma.task.create({
      data: {
        title,
        description,
        order,
        columnId,
        assigneeId,
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    this.socketGateway.emitTaskCreated(column.projectId, task);
    return task;
  }

  async findAll(columnId: string, userId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
      include: { project: true },
    });

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    const hasAccess = await this.projectsService.isUserParticipant(
      column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return this.prisma.task.findMany({
      where: { columnId },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        column: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const hasAccess = await this.projectsService.isUserParticipant(
      task.column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return task;
  }

  /**
   * update - Actualiza los campos de una tarea existente
   *
   * Validaciones realizadas:
   * 1. La tarea existe
   * 2. El usuario tiene acceso al proyecto (es participante)
   * 3. Si se cambia el assignee:
   *    - Si assigneeId es null: Se desasigna la tarea (válido)
   *    - Si assigneeId es un userId: Verifica que ese usuario sea participante del proyecto
   *
   * Campos actualizables:
   * - title: Título de la tarea
   * - description: Descripción (puede ser null para limpiarla)
   * - assigneeId: Usuario asignado (puede ser null para desasignar)
   *
   * Patrón de actualización condicional:
   * - Usa spread operator con condiciones
   * - Solo incluye campos que realmente cambiaron
   * - Prisma ignora propiedades undefined en el objeto data
   *
   * Ejemplo de uso del pattern:
   * ```typescript
   * {
   *   ...(title && { title }),           // Solo si title está definido y no es vacío
   *   ...(description !== undefined && { description }), // Solo si description fue enviado (puede ser null)
   *   ...(assigneeId !== undefined && { assigneeId })    // Solo si assigneeId fue enviado (puede ser null)
   * }
   * ```
   *
   * Broadcasting:
   * - Después de actualizar, emite evento WebSocket taskUpdated
   * - Todos los usuarios viendo este proyecto reciben la actualización en tiempo real
   *
   * @param id - ID de la tarea
   * @param userId - ID del usuario que hace la actualización
   * @param title - Nuevo título (opcional)
   * @param description - Nueva descripción (opcional, puede ser null)
   * @param assigneeId - ID del usuario a asignar (opcional, puede ser null para desasignar)
   * @returns Tarea actualizada con datos del assignee
   * @throws NotFoundException si la tarea no existe
   * @throws ForbiddenException si el usuario no tiene acceso o el assignee no es participante
   */
  async update(
    id: string,
    userId: string,
    title?: string,
    description?: string,
    assigneeId?: string | null,
  ) {
    // Obtener la tarea con su columna y proyecto para verificar permisos
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Verificar que el usuario tiene acceso al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      task.column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    // Si se está cambiando el assignee (asignado)
    if (assigneeId !== undefined) {
      // Si assigneeId es null: Se está desasignando (válido, no validar)
      // Si assigneeId es un string: Verificar que el usuario sea participante
      if (assigneeId !== null) {
        const assigneeHasAccess = await this.projectsService.isUserParticipant(
          task.column.projectId,
          assigneeId,
        );
        if (!assigneeHasAccess) {
          throw new ForbiddenException(
            'El usuario asignado no es participante del proyecto',
          );
        }
      }
    }

    // Actualizar solo los campos que fueron proporcionados
    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        // Spread condicional: Solo incluye propiedades definidas
        ...(title && { title }), // title es truthy (no vacío)
        ...(description !== undefined && { description }), // description fue enviado (puede ser null)
        ...(assigneeId !== undefined && { assigneeId }), // assigneeId fue enviado (puede ser null)
      },
      include: {
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Emitir evento WebSocket para sincronización en tiempo real
    this.socketGateway.emitTaskUpdated(task.column.projectId, updatedTask);
    return updatedTask;
  }

  async remove(id: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    const hasAccess = await this.projectsService.isUserParticipant(
      task.column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    const deletedTask = await this.prisma.task.delete({
      where: { id },
    });

    this.socketGateway.emitTaskDeleted(task.column.projectId, id);
    return deletedTask;
  }

  /**
   * moveTask - Mueve una tarea a una nueva columna y/o posición
   *
   * Esta es la función más compleja del servicio porque debe mantener la consistencia
   * del campo 'order' en TODAS las tareas afectadas por el movimiento.
   *
   * El campo 'order' funciona así:
   * - Cada tarea tiene un número de orden dentro de su columna
   * - Los números deben ser secuenciales y empezar en 0: [0, 1, 2, 3, ...]
   * - Cuando se mueve una tarea, otras tareas deben ajustar su 'order'
   *
   * Escenarios manejados:
   *
   * 1. MOVIMIENTO DENTRO DE LA MISMA COLUMNA:
   *    a) Mover hacia arriba (newOrder < oldOrder):
   *       - Todas las tareas entre newOrder y oldOrder se incrementan en 1
   *       - Ejemplo: Mover tarea de posición 5 a posición 2
   *         * Tareas en [2,3,4] pasan a [3,4,5]
   *         * Tarea movida pasa de 5 a 2
   *
   *    b) Mover hacia abajo (newOrder > oldOrder):
   *       - Todas las tareas entre oldOrder y newOrder se decrementan en 1
   *       - Ejemplo: Mover tarea de posición 2 a posición 5
   *         * Tareas en [3,4,5] pasan a [2,3,4]
   *         * Tarea movida pasa de 2 a 5
   *
   * 2. MOVIMIENTO ENTRE COLUMNAS DIFERENTES:
   *    a) En la columna origen:
   *       - Todas las tareas después de oldOrder se decrementan en 1
   *       - Ejemplo: Remover tarea en posición 2
   *         * Tareas en [3,4,5] pasan a [2,3,4]
   *
   *    b) En la columna destino:
   *       - Todas las tareas desde newOrder en adelante se incrementan en 1
   *       - Ejemplo: Insertar tarea en posición 2
   *         * Tareas en [2,3,4] pasan a [3,4,5]
   *         * Tarea movida se inserta en 2
   *
   * ¿Por qué usar transacciones?
   * - Si falla cualquier actualización de 'order', se revierte TODA la operación
   * - Garantiza que nunca habrá órdenes duplicados o huecos
   * - COMPLETED: ACID properties - Atomicidad garantizada
   *
   * Validaciones:
   * 1. Tarea existe
   * 2. Columna destino existe
   * 3. Ambas columnas pertenecen al mismo proyecto (no se pueden mover entre proyectos)
   * 4. Usuario tiene acceso al proyecto
   *
   * Broadcasting:
   * - Después del movimiento exitoso, emite evento WebSocket taskMoved
   * - Todos los usuarios viendo el proyecto ven el cambio en tiempo real
   *
   * @param id - ID de la tarea a mover
   * @param userId - ID del usuario que hace el movimiento
   * @param newColumnId - ID de la columna destino
   * @param newOrder - Nueva posición dentro de la columna destino
   * @returns Tarea actualizada con sus relaciones
   * @throws NotFoundException si la tarea o columna no existe
   * @throws ForbiddenException si el usuario no tiene acceso o intenta mover entre proyectos
   */
  async moveTask(
    id: string,
    userId: string,
    newColumnId: string,
    newOrder: number,
  ): Promise<any> {
    // Obtener la tarea actual con sus relaciones
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Obtener la columna destino
    const newColumn = await this.prisma.column.findUnique({
      where: { id: newColumnId },
      include: { project: true },
    });

    if (!newColumn) {
      throw new NotFoundException('Columna destino no encontrada');
    }

    // Validar que ambas columnas pertenecen al mismo proyecto
    if (task.column.projectId !== newColumn.projectId) {
      throw new ForbiddenException(
        'No se puede mover la tarea a un proyecto diferente',
      );
    }

    // Verificar acceso del usuario al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      task.column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    // ========== TRANSACCIÓN PRINCIPAL ==========
    // Todas las actualizaciones de 'order' deben ser atómicas
    const result = await this.prisma.$transaction(async (tx) => {
      const oldColumnId = task.columnId;
      const oldOrder = task.order;

      // CASO 1: Movimiento dentro de la misma columna
      if (oldColumnId === newColumnId) {
        // CASO 1A: Mover hacia arriba (hacia posiciones menores)
        if (newOrder < oldOrder) {
          // Incrementar el order de todas las tareas entre newOrder y oldOrder
          // Ejemplo: Mover de 5 a 2 → [2,3,4] pasan a [3,4,5]
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              order: {
                gte: newOrder, // Mayor o igual que la nueva posición
                lt: oldOrder, // Menor que la posición vieja
              },
            },
            data: {
              order: {
                increment: 1, // Aumentar en 1
              },
            },
          });
        }
        // CASO 1B: Mover hacia abajo (hacia posiciones mayores)
        else if (newOrder > oldOrder) {
          // Decrementar el order de todas las tareas entre oldOrder y newOrder
          // Ejemplo: Mover de 2 a 5 → [3,4,5] pasan a [2,3,4]
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              order: {
                gt: oldOrder, // Mayor que la posición vieja
                lte: newOrder, // Menor o igual que la nueva posición
              },
            },
            data: {
              order: {
                decrement: 1, // Disminuir en 1
              },
            },
          });
        }
        // Si newOrder === oldOrder, no hacer nada (no cambió la posición)
      }
      // CASO 2: Movimiento entre columnas diferentes
      else {
        // PASO 2A: Ajustar la columna ORIGEN (remover la tarea)
        // Decrementar el order de todas las tareas después de la removida
        await tx.task.updateMany({
          where: {
            columnId: oldColumnId,
            order: {
              gt: oldOrder, // Mayor que la posición vieja
            },
          },
          data: {
            order: {
              decrement: 1, // Cerrar el hueco dejado
            },
          },
        });

        // PASO 2B: Ajustar la columna DESTINO (insertar la tarea)
        // Incrementar el order de todas las tareas desde la posición de inserción
        await tx.task.updateMany({
          where: {
            columnId: newColumnId,
            order: {
              gte: newOrder, // Mayor o igual que la nueva posición
            },
          },
          data: {
            order: {
              increment: 1, // Hacer espacio para la nueva tarea
            },
          },
        });
      }

      // PASO FINAL: Actualizar la tarea movida con su nueva columna y orden
      return tx.task.update({
        where: { id },
        data: {
          columnId: newColumnId,
          order: newOrder,
        },
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          column: {
            include: {
              project: true,
            },
          },
        },
      });
    });
    // ========== FIN DE TRANSACCIÓN ==========

    // Emitir evento WebSocket para sincronización en tiempo real
    this.socketGateway.emitTaskMoved(task.column.projectId, {
      taskId: id,
      sourceColumnId: task.columnId,
      targetColumnId: newColumnId,
      newOrder,
    });

    return result;
  }
}
