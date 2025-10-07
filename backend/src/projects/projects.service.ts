import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, name: string, description?: string) {
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

  async findAll(userId: number) {
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

  async findOne(id: string, userId: number) {
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

    // Verificar que el usuario sea participante
    const isParticipant = project.participants.some((p) => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return project;
  }

  async update(
    id: string,
    userId: number,
    name?: string,
    description?: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Solo el owner puede actualizar el proyecto
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

  async remove(id: string, userId: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Solo el owner puede eliminar el proyecto
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
    userId: number,
    participantEmail: string,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Solo el owner puede agregar participantes
    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Solo el propietario puede agregar participantes',
      );
    }

    // Buscar el usuario por email
    const participantUser = await this.prisma.user.findUnique({
      where: { email: participantEmail },
    });

    if (!participantUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si ya es participante
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

    return this.prisma.projectParticipant.create({
      data: {
        userId: participantUser.id,
        projectId,
        role: 'MEMBER',
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
    userId: number,
    participantId: number,
  ) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Solo el owner puede remover participantes
    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Solo el propietario puede remover participantes',
      );
    }

    // No se puede remover al owner
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

    return this.prisma.projectParticipant.delete({
      where: {
        userId_projectId: {
          userId: participantId,
          projectId,
        },
      },
    });
  }

  // Método auxiliar para verificar si un usuario es participante
  async isUserParticipant(projectId: string, userId: number): Promise<boolean> {
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
}
