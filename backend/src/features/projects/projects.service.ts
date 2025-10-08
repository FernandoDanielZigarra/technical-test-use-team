import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
  ServiceUnavailableException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
import { SocketGateway } from '../socket/socket.gateway';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    @Inject(forwardRef(() => SocketGateway))
    private readonly socketGateway: SocketGateway,
  ) {}

  async create(userId: string, name: string, description?: string) {
    return this.prisma.project.create({
      data: {
        name,
        description,
        ownerId: userId,
        participants: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.project.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            columns: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        columns: {
          include: {
            tasks: {
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
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const isParticipant = project.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return project;
  }

  async update(
    id: string,
    userId: string,
    name?: string,
    description?: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Solo el propietario puede actualizar el proyecto',
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Solo el propietario puede eliminar el proyecto',
      );
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async addParticipant(
    projectId: string,
    userId: string,
    participantEmail: string,
    role?: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        participants: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const isProjectOwner = project.ownerId === userId;
    const isParticipantOwner = project.participants.some(
      (p) => p.userId === userId && p.role === 'OWNER',
    );

    if (!isProjectOwner && !isParticipantOwner) {
      throw new ForbiddenException(
        'Solo los propietarios pueden agregar participantes',
      );
    }

    const participantUser = await this.prisma.user.findUnique({
      where: { email: participantEmail },
    });

    if (!participantUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const existingParticipant = await this.prisma.projectParticipant.findUnique(
      {
        where: {
          userId_projectId: {
            userId: participantUser.id,
            projectId,
          },
        },
      },
    );

    if (existingParticipant) {
      throw new BadRequestException(
        'El usuario ya es participante del proyecto',
      );
    }

    const participantRole =
      role && (role === 'OWNER' || role === 'MEMBER') ? role : 'MEMBER';

    return this.prisma.projectParticipant.create({
      data: {
        userId: participantUser.id,
        projectId,
        role: participantRole,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  async removeParticipant(
    projectId: string,
    userId: string,
    participantId: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        participants: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const isProjectOwner = project.ownerId === userId;
    const isParticipantOwner = project.participants.some(
      (p) => p.userId === userId && p.role === 'OWNER',
    );

    if (!isProjectOwner && !isParticipantOwner) {
      throw new ForbiddenException(
        'Solo los propietarios pueden remover participantes',
      );
    }

    if (participantId === project.ownerId) {
      throw new BadRequestException(
        'No se puede remover al propietario del proyecto',
      );
    }

    const participant = await this.prisma.projectParticipant.findUnique({
      where: {
        userId_projectId: {
          userId: participantId,
          projectId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participante no encontrado');
    }

    const deletedParticipant = await this.prisma.projectParticipant.delete({
      where: {
        userId_projectId: {
          userId: participantId,
          projectId,
        },
      },
    });

    this.socketGateway.emitUserRemovedFromProject(
      participantId,
      projectId,
      project.name,
    );

    return deletedParticipant;
  }

  async leaveProject(projectId: string, userId: string, newOwnerId?: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const isProjectOwner = project.ownerId === userId;
    const isParticipant = project.participants.some((p) => p.userId === userId);

    if (!isProjectOwner && !isParticipant) {
      throw new ForbiddenException('No eres parte de este proyecto');
    }

    const ownerCount = project.participants.filter(
      (p) => p.role === 'OWNER',
    ).length;
    const totalOwners = isProjectOwner ? ownerCount + 1 : ownerCount;

    if (isProjectOwner) {
      if (project.participants.length === 0) {
        await this.prisma.project.delete({
          where: { id: projectId },
        });
        return { message: 'Proyecto eliminado exitosamente' };
      }

      if (!newOwnerId) {
        const ownerParticipant = project.participants.find(
          (p) => p.role === 'OWNER',
        );

        if (ownerParticipant) {
          newOwnerId = ownerParticipant.userId;
        } else {
          await this.prisma.project.delete({
            where: { id: projectId },
          });
          return { message: 'Proyecto eliminado exitosamente' };
        }
      }

      const newOwnerParticipant = project.participants.find(
        (p) => p.userId === newOwnerId,
      );

      if (!newOwnerParticipant) {
        throw new BadRequestException(
          'El nuevo propietario debe ser un participante del proyecto',
        );
      }

      await this.prisma.project.update({
        where: { id: projectId },
        data: { ownerId: newOwnerId },
      });

      await this.prisma.projectParticipant.delete({
        where: {
          userId_projectId: {
            userId: newOwnerId,
            projectId,
          },
        },
      });

      return { message: 'Has salido del proyecto exitosamente' };
    }

    const participant = project.participants.find((p) => p.userId === userId);
    if (participant?.role === 'OWNER' && totalOwners === 1) {
      throw new BadRequestException(
        'No puedes salir siendo el único propietario. Asigna otro propietario primero.',
      );
    }

    await this.prisma.projectParticipant.delete({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return { message: 'Has salido del proyecto exitosamente' };
  }

  async updateParticipantRole(
    projectId: string,
    userId: string,
    participantId: string,
    role: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        participants: true,
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const isProjectOwner = project.ownerId === userId;
    const isParticipantOwner = project.participants.some(
      (p) => p.userId === userId && p.role === 'OWNER',
    );

    if (!isProjectOwner && !isParticipantOwner) {
      throw new ForbiddenException(
        'Solo los propietarios pueden cambiar roles',
      );
    }

    if (role !== 'OWNER' && role !== 'MEMBER') {
      throw new BadRequestException('Rol inválido');
    }

    const participant = await this.prisma.projectParticipant.findUnique({
      where: {
        userId_projectId: {
          userId: participantId,
          projectId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Participante no encontrado');
    }

    return this.prisma.projectParticipant.update({
      where: {
        userId_projectId: {
          userId: participantId,
          projectId,
        },
      },
      data: { role },
    });
  }

  async isUserParticipant(projectId: string, userId: string): Promise<boolean> {
    const participant = await this.prisma.projectParticipant.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    return !!participant;
  }

  async exportBacklog(projectId: string, userId: string, email: string) {
    const project = await this.findOne(projectId, userId);

    const tasks = project.columns.flatMap((column) =>
      column.tasks.map((task) => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        column: column.title,
        assignee: task.assignee?.name || task.assignee?.email || 'Sin asignar',
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    );

    const payload = {
      projectId: project.id,
      projectName: project.name,
      email: email,
      tasks: tasks,
      exportedBy: userId,
      exportedAt: new Date().toISOString(),
    };

    const webhookUrls = this.resolveWebhookUrls();
    const errors: string[] = [];

    for (const url of webhookUrls) {
      try {
        await firstValueFrom(this.httpService.post(url, payload));

        this.logger.log(
          `Backlog exportado exitosamente para proyecto ${projectId} usando ${url}`,
        );

        return {
          success: true,
          message: 'Exportación iniciada correctamente',
          tasksCount: tasks.length,
          email: email,
        };
      } catch (error) {
        const details = this.formatHttpError(error);
        errors.push(`${url} → ${details}`);
        this.logger.warn(
          `Intento fallido al llamar al webhook ${url}: ${details}`,
        );
      }
    }

    this.logger.error(
      `Error al exportar backlog del proyecto ${projectId}. Intentos fallidos: ${errors.join(' | ')}`,
    );

    throw new ServiceUnavailableException({
      message:
        'Error al iniciar la exportación. Verifica que N8N esté disponible.',
      attempts: errors,
      hint: 'Asegúrate de que el workflow "Kanban Backlog Export" esté activo y que el webhook responda en /webhook/kanban-export.',
    });
  }

  private resolveWebhookUrls(): string[] {
    const webhookPath = process.env.N8N_WEBHOOK_PATH || 'kanban-export';
    const explicit = [
      process.env.N8N_WEBHOOK_URL,
      process.env.N8N_DEV_WEBHOOK_URL,
    ].filter((url): url is string => Boolean(url));

    const baseHosts = [
      process.env.N8N_WEBHOOK_BASE_URL,
      'http://n8n:5678',
      'http://localhost:5678',
    ].filter((url): url is string => Boolean(url));

    const urls: string[] = [];

    const addUrl = (value: string) => {
      const normalized = value.replace(/\/+$/, '');
      if (!urls.includes(normalized)) {
        urls.push(normalized);
      }
    };

    explicit.forEach((value) => {
      if (value.includes('/webhook/')) {
        addUrl(value.replace('/webhook/', '/webhook-test/'));
        addUrl(value);
      } else if (value.includes('/webhook-test/')) {
        addUrl(value);
        addUrl(value.replace('/webhook-test/', '/webhook/'));
      } else {
        addUrl(value);
      }
    });

    baseHosts.forEach((host) => {
      const trimmedHost = host.replace(/\/+$/, '');
      addUrl(`${trimmedHost}/webhook-test/${webhookPath}`);
      addUrl(`${trimmedHost}/webhook/${webhookPath}`);
    });

    return urls;
  }

  private formatHttpError(error: unknown): string {
    const fallback = 'Error desconocido';

    if (!error) {
      return fallback;
    }

    if (isAxiosError(error)) {
      return this.formatAxiosError(error, fallback);
    }

    if (error instanceof Error) {
      return error.message || fallback;
    }

    if (typeof error === 'string') {
      return error;
    }

    return this.safeStringify(error, fallback) ?? fallback;
  }

  private formatAxiosError(error: AxiosError, fallback: string): string {
    if (error.response) {
      const { status, statusText, data } = error.response;

      if (status === 404) {
        return '404 Not Found – activa el workflow en n8n o verifica que el webhook se llame kanban-export';
      }

      const messageFromData = this.extractResponseMessage(data);
      if (messageFromData) {
        if (status) {
          return `${this.formatStatus(status, statusText)} – ${messageFromData}`;
        }
        return messageFromData;
      }

      if (status) {
        return this.formatStatus(status, statusText);
      }
    }

    if (error.code) {
      const description =
        error.message && error.message !== error.code
          ? ` – ${error.message}`
          : '';
      return `${error.code}${description}`;
    }

    return error.message || fallback;
  }

  private extractResponseMessage(data: unknown): string | undefined {
    if (!data) {
      return undefined;
    }

    if (typeof data === 'string') {
      return data;
    }

    if (Array.isArray(data)) {
      const joined = data
        .map((item) => this.extractResponseMessage(item))
        .filter((value): value is string => Boolean(value))
        .join(', ');
      return joined || undefined;
    }

    if (typeof data === 'object') {
      const record = data as Record<string, unknown>;
      if ('message' in record) {
        return this.extractResponseMessage(record.message);
      }

      return this.safeStringify(record) ?? undefined;
    }

    return this.safeStringify(data) ?? undefined;
  }

  private formatStatus(status: number, statusText?: string): string {
    return statusText ? `${status} ${statusText}` : `${status}`;
  }

  private safeStringify(value: unknown, fallback?: string): string | undefined {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }

    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }
}
