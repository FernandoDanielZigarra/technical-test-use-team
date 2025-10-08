import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PasswordUtils } from '../../shared/utils';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // MÉTODOS DE ACCESO A DATOS (Data Access)
  // ============================================================================

  /**
   * findByEmail - Busca un usuario por su email
   * @param email - Email del usuario a buscar
   * @returns Usuario encontrado o null
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * findById - Busca un usuario por su ID
   * @param id - ID del usuario a buscar
   * @returns Usuario encontrado o null
   */
  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * emailExists - Verifica si un email ya está registrado
   * @param email - Email a verificar
   * @returns true si el email existe, false en caso contrario
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return !!user;
  }

  // ============================================================================
  // MÉTODOS DE LÓGICA DE NEGOCIO (Business Logic)
  // ============================================================================

  /**
   * createUser - Crea un nuevo usuario en el sistema
   *
   * Validaciones:
   * - Verifica que el email no esté ya registrado
   * - Hashea la contraseña antes de guardarla
   *
   * @param userData - Datos del usuario (email, password, name)
   * @returns Usuario creado
   * @throws ConflictException si el email ya existe
   */
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    const { email, password, name } = userData;

    if (await this.emailExists(email)) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    const hashedPassword = await PasswordUtils.hashPassword(password, 10);

    return await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
  }

  /**
   * validateUserCredentials - Valida las credenciales de un usuario
   *
   * Proceso:
   * 1. Busca el usuario por email
   * 2. Compara la contraseña proporcionada con el hash almacenado
   *
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns Usuario si las credenciales son válidas, null en caso contrario
   */
  async validateUserCredentials(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.password,
    );

    return isPasswordValid ? user : null;
  }

  /**
   * findUserByEmail - Wrapper para findByEmail (compatibilidad)
   * @param email - Email del usuario
   * @returns Usuario encontrado o null
   */
  async findUserByEmail(email: string) {
    return await this.findByEmail(email);
  }

  /**
   * findUserById - Wrapper para findById (compatibilidad)
   * @param userId - ID del usuario
   * @returns Usuario encontrado o null
   */
  async findUserById(userId: string) {
    return await this.findById(userId);
  }

  /**
   * deleteAccount - Elimina completamente una cuenta de usuario y todos sus datos relacionados
   *
   * Esta es una operación crítica que debe ser atómica (COMPLETED) por lo que usa
   * una transacción de Prisma ($transaction) para garantizar la consistencia de datos.
   *
   * Flujo de eliminación:
   * 1. Verificar que el usuario existe
   * 2. Dentro de una transacción:
   *    a. Eliminar todas las tareas asignadas al usuario
   *    b. Para cada proyecto donde participa:
   *       - Si es el único participante: Eliminar proyecto completo (tareas, columnas, proyecto)
   *       - Si hay más participantes: Solo desconectar al usuario del proyecto
   *    c. Finalmente eliminar el registro del usuario
   *
   * ¿Por qué usar transacciones?
   * - Si falla alguna operación (ej: error al eliminar columnas), TODA la transacción se revierte
   * - Esto previene estados inconsistentes como: usuario eliminado pero sus tareas aún existen
   * - MongoDB requiere Replica Set para soportar transacciones (por eso está configurado en Docker)
   *
   * @param userId - ID del usuario a eliminar
   * @returns Mensaje de confirmación
   * @throws NotFoundException si el usuario no existe
   */
  async deleteAccount(userId: string) {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Transacción Prisma: COMPLETED - ACID properties garantizados
    await this.prisma.$transaction(async (tx) => {
      // Paso 1: Eliminar todas las tareas donde este usuario es el assignee
      await tx.task.deleteMany({
        where: { assigneeId: userId },
      });

      // Paso 2: Encontrar todos los proyectos donde el usuario participa
      const userProjects = await tx.project.findMany({
        where: {
          participants: {
            some: { id: userId }, // MongoDB: busca en el array participants
          },
        },
        include: {
          participants: true, // Incluir la lista completa para contar participantes
        },
      });

      // Paso 3: Decidir qué hacer con cada proyecto según el número de participantes
      for (const project of userProjects) {
        if (project.participants.length === 1) {
          // Caso A: Usuario es el único participante → Eliminar proyecto completo

          // 3.1: Eliminar todas las tareas del proyecto (cascada desde columnas)
          await tx.task.deleteMany({
            where: {
              column: {
                projectId: project.id,
              },
            },
          });

          // 3.2: Eliminar todas las columnas del proyecto
          await tx.column.deleteMany({
            where: { projectId: project.id },
          });

          // 3.3: Eliminar el proyecto
          await tx.project.delete({
            where: { id: project.id },
          });
        } else {
          // Caso B: Hay más participantes → Solo remover a este usuario
          await tx.project.update({
            where: { id: project.id },
            data: {
              participants: {
                disconnect: { id: userId }, // MongoDB: remueve del array participants
              },
            },
          });
        }
      }

      // Paso 4: Finalmente, eliminar el registro del usuario
      // Esto va al final para mantener la integridad referencial durante la transacción
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return { message: 'Cuenta eliminada exitosamente' };
  }
}
