import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class ColumnsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projectsService: ProjectsService,
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(projectId: string, userId: number, title: string) {
    // Verificar que el usuario tenga acceso al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    // Obtener el orden más alto actual
    const lastColumn = await this.prisma.column.findFirst({
      where: { projectId },
      orderBy: { order: 'desc' },
    });

    const order = lastColumn ? lastColumn.order + 1 : 0;

    const column = await this.prisma.column.create({
      data: {
        title,
        order,
        projectId,
      },
      include: {
        tasks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    this.socketGateway.emitColumnCreated(projectId, column);
    return column;
  }

  async findAll(projectId: string, userId: number) {
    // Verificar que el usuario tenga acceso al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return this.prisma.column.findMany({
      where: { projectId },
      include: {
        tasks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  async findOne(id: string, userId: number) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: {
            order: 'asc',
          },
        },
        project: true,
      },
    });

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    // Verificar que el usuario tenga acceso al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return column;
  }

  async update(id: string, userId: number, title: string) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    // Verificar que el usuario tenga acceso al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    const updatedColumn = await this.prisma.column.update({
      where: { id },
      data: { title },
      include: {
        tasks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    this.socketGateway.emitColumnUpdated(column.projectId, updatedColumn);
    return updatedColumn;
  }

  async remove(id: string, userId: number) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    // Verificar que el usuario tenga acceso al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    const deletedColumn = await this.prisma.column.delete({
      where: { id },
    });

    this.socketGateway.emitColumnDeleted(column.projectId, id);
    return deletedColumn;
  }

  async updateOrder(id: string, userId: number, newOrder: number) {
    const column = await this.prisma.column.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!column) {
      throw new NotFoundException('Columna no encontrada');
    }

    // Verificar que el usuario tenga acceso al proyecto
    const hasAccess = await this.projectsService.isUserParticipant(
      column.projectId,
      userId,
    );
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    // Actualizar el orden de las columnas afectadas
    const transaction = await this.prisma.$transaction(async (tx) => {
      if (newOrder < column.order) {
        // Mover hacia arriba: incrementar orden de columnas intermedias
        await tx.column.updateMany({
          where: {
            projectId: column.projectId,
            order: {
              gte: newOrder,
              lt: column.order,
            },
          },
          data: {
            order: {
              increment: 1,
            },
          },
        });
      } else {
        // Mover hacia abajo: decrementar orden de columnas intermedias
        await tx.column.updateMany({
          where: {
            projectId: column.projectId,
            order: {
              gt: column.order,
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

      // Actualizar el orden de la columna actual
      return tx.column.update({
        where: { id },
        data: { order: newOrder },
        include: {
          tasks: {
            orderBy: {
              order: 'asc',
            },
          },
        },
      });
    });

    const updatedColumns = await this.prisma.column.findMany({
      where: { projectId: column.projectId },
      include: {
        tasks: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    this.socketGateway.emitProjectUpdated(column.projectId, {
      columns: updatedColumns,
    });

    return transaction;
  }
}
