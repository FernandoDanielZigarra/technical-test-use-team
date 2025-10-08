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

  async update(
    id: string,
    userId: string,
    title?: string,
    description?: string,
    assigneeId?: string | null,
  ) {
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

    if (assigneeId !== undefined) {
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

    const updatedTask = await this.prisma.task.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(assigneeId !== undefined && { assigneeId }),
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

  async moveTask(
    id: string,
    userId: string,
    newColumnId: string,
    newOrder: number,
  ): Promise<any> {
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

    const newColumn = await this.prisma.column.findUnique({
      where: { id: newColumnId },
      include: { project: true },
    });

    if (!newColumn) {
      throw new NotFoundException('Columna destino no encontrada');
    }

    if (task.column.projectId !== newColumn.projectId) {
      throw new ForbiddenException(
        'No se puede mover la tarea a un proyecto diferente',
      );
    }

    const hasAccess = await this.projectsService.isUserParticipant(
      task.column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const oldColumnId = task.columnId;
      const oldOrder = task.order;

      if (oldColumnId === newColumnId) {
        if (newOrder < oldOrder) {
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            data: {
              order: {
                increment: 1,
              },
            },
          });
        } else if (newOrder > oldOrder) {
          await tx.task.updateMany({
            where: {
              columnId: oldColumnId,
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            data: {
              order: {
                decrement: 1,
              },
            },
          });
        }
      } else {
        await tx.task.updateMany({
          where: {
            columnId: oldColumnId,
            order: {
              gt: oldOrder,
            },
          },
          data: {
            order: {
              decrement: 1,
            },
          },
        });

        await tx.task.updateMany({
          where: {
            columnId: newColumnId,
            order: {
              gte: newOrder,
            },
          },
          data: {
            order: {
              increment: 1,
            },
          },
        });
      }

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
    this.socketGateway.emitTaskMoved(task.column.projectId, {
      taskId: id,
      sourceColumnId: task.columnId,
      targetColumnId: newColumnId,
      newOrder,
    });

    return result;
  }
}
