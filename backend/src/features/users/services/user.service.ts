import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { PasswordUtils } from '../../../shared/utils';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    const { email, password, name } = userData;

    if (await this.userRepository.emailExists(email)) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    const hashedPassword = await PasswordUtils.hashPassword(password, 10);

    return await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.password,
    );

    return isPasswordValid ? user : null;
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async findUserById(userId: string) {
    return await this.userRepository.findById(userId);
  }

  async deleteAccount(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Eliminar todos los datos relacionados con el usuario en una transacción
    await this.prisma.$transaction(async (tx) => {
      // Eliminar tareas asignadas al usuario
      await tx.task.deleteMany({
        where: { assigneeId: userId },
      });

      // Eliminar proyectos donde el usuario es el único participante
      const userProjects = await tx.project.findMany({
        where: {
          participants: {
            some: { id: userId },
          },
        },
        include: {
          participants: true,
        },
      });

      for (const project of userProjects) {
        if (project.participants.length === 1) {
          // Si es el único participante, eliminar el proyecto completo
          await tx.task.deleteMany({
            where: {
              column: {
                projectId: project.id,
              },
            },
          });

          await tx.column.deleteMany({
            where: { projectId: project.id },
          });

          await tx.project.delete({
            where: { id: project.id },
          });
        } else {
          // Si hay más participantes, solo remover al usuario
          await tx.project.update({
            where: { id: project.id },
            data: {
              participants: {
                disconnect: { id: userId },
              },
            },
          });
        }
      }

      // Finalmente, eliminar el usuario
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { message: 'Cuenta eliminada exitosamente' };
  }
}
