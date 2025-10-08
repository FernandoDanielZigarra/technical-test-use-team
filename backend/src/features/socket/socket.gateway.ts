/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Inject, forwardRef } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';
import type { JwtPayload } from '../../shared/utils/jwt.utils';

/**
 * SocketGateway - Gateway de WebSockets para comunicación en tiempo real
 *
 * Responsabilidades:
 * 1. Autenticar conexiones WebSocket mediante JWT tokens
 * 2. Gestionar rooms (salas) por proyecto para broadcasting eficiente
 * 3. Trackear qué usuarios están conectados (puede haber múltiples tabs/dispositivos)
 * 4. Emitir eventos a usuarios específicos o a todos los participantes de un proyecto
 *
 * Arquitectura:
 * - Usa Socket.io sobre WebSockets para compatibilidad cross-browser
 * - CORS habilitado para permitir conexiones desde el frontend
 * - Autenticación en el handshake (primera conexión) para seguridad
 * - Map de userSockets para trackear múltiples conexiones del mismo usuario
 */
@WebSocketGateway({
  cors: {
    origin: '*', // En producción, especificar dominio exacto
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server; // Instancia del servidor Socket.io para emitir eventos

  /**
   * userSockets - Mapeo de usuarios a sus sockets activos
   *
   * Estructura: Map<userId, Set<socketId>>
   * - Clave: userId (string)
   * - Valor: Set de socketIds (el usuario puede tener múltiples tabs abiertas)
   *
   * Ejemplo:
   * {
   *   "user123": Set { "socket_abc", "socket_def" }, // Usuario con 2 tabs
   *   "user456": Set { "socket_xyz" }                 // Usuario con 1 tab
   * }
   *
   * ¿Por qué un Set?
   * - Evita duplicados automáticamente
   * - Operaciones O(1) para add/delete/has
   * - Fácil saber si un usuario tiene conexiones activas (size > 0)
   */
  private readonly userSockets: Map<string, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
  ) {}

  /**
   * handleConnection - Maneja nuevas conexiones WebSocket
   *
   * Flujo de autenticación:
   * 1. Extrae el JWT token del handshake (puede venir en auth.token o Authorization header)
   * 2. Verifica el token con jwtService (lanza error si es inválido/expirado)
   * 3. Extrae el userId del payload del JWT (campo 'sub')
   * 4. Guarda userId en client.data para acceso rápido en otros handlers
   * 5. Agrega el socketId al Set de sockets del usuario
   * 6. Si falla la autenticación: Desconecta al cliente inmediatamente
   *
   * Seguridad:
   * - Sin token válido = conexión rechazada
   * - Token expirado = conexión rechazada
   * - Token manipulado = verificación falla, conexión rechazada
   *
   * @param client - Socket del cliente que se está conectando
   */
  handleConnection(client: Socket) {
    try {
      // Intenta obtener token de dos posibles ubicaciones:
      // 1. client.handshake.auth.token (forma recomendada)
      // 2. Authorization header (formato: "Bearer <token>")
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      // Verifica y decodifica el JWT (lanza error si es inválido)
      const payload = this.jwtService.verify<JwtPayload>(token);
      const userId = payload.sub; // 'sub' (subject) contiene el userId

      // Almacena userId en el socket para no tener que decodificar el token en cada mensaje
      client.data.userId = userId;

      // Trackea este socket para el usuario
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set()); // Primera conexión de este usuario
      }
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.add(client.id); // Agrega este socketId al Set del usuario
      }

      console.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      console.error('Authentication error:', error);
      client.disconnect(); // Desconecta si la autenticación falla
    }
  }

  /**
   * handleDisconnect - Maneja desconexiones de clientes
   *
   * Limpieza:
   * 1. Obtiene userId del socket que se está desconectando
   * 2. Remueve este socketId del Set de sockets del usuario
   * 3. Si el usuario no tiene más sockets activos: Elimina la entrada del Map
   *
   * Esto permite saber si un usuario está completamente offline (size === 0)
   * vs solo cerró una tab pero sigue con otras abiertas (size > 0)
   *
   * @param client - Socket del cliente que se está desconectando
   */
  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id); // Remueve este socket específico

        // Si el usuario no tiene más sockets, eliminar la entrada del Map
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  /**
   * handleJoinProject - Handler para que un cliente se una a una room de proyecto
   *
   * Socket.io Rooms:
   * - Son canales de broadcasting dentro del mismo servidor
   * - Formato: "project:{projectId}" (ej: "project:abc123")
   * - Un socket puede estar en múltiples rooms simultáneamente
   *
   * Flujo:
   * 1. Verifica que el usuario tiene acceso al proyecto (es participante)
   * 2. Si tiene acceso: Une el socket a la room del proyecto
   * 3. Emite confirmación al cliente
   * 4. Si no tiene acceso: Emite error
   *
   * Ventajas de rooms:
   * - Broadcasting eficiente: server.to('project:abc123').emit(...) llega solo a participantes
   * - No necesita iterar manualmente sobre todos los sockets
   * - Socket.io maneja la gestión automática
   *
   * @param client - Socket del cliente
   * @param data - Objeto con projectId al que quiere unirse
   */
  @SubscribeMessage('join:project')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const userId = client.data.userId;
    const { projectId } = data;

    try {
      // Verificación de autorización: ¿Es el usuario participante de este proyecto?
      const hasAccess = await this.projectsService.isUserParticipant(
        projectId,
        userId,
      );

      if (!hasAccess) {
        client.emit('error', { message: 'No tienes acceso a este proyecto' });
        return;
      }

      // Une este socket específico a la room del proyecto
      await client.join(`project:${projectId}`);
      console.log(`User ${userId} joined project ${projectId}`);

      // Confirma al cliente que se unió exitosamente
      client.emit('joined:project', { projectId });
    } catch (error) {
      console.error('Error al unirse al proyecto:', error);
      client.emit('error', { message: 'Error al unirse al proyecto' });
    }
  }

  /**
   * handleLeaveProject - Handler para que un cliente abandone una room de proyecto
   *
   * Uso típico:
   * - Usuario navega fuera del proyecto
   * - Usuario cierra el tab del proyecto
   * - Usuario se desconecta manualmente
   *
   * @param client - Socket del cliente
   * @param data - Objeto con projectId del que quiere salir
   */
  @SubscribeMessage('leave:project')
  async handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const { projectId } = data;
    await client.leave(`project:${projectId}`); // Remueve el socket de la room
    console.log(`User ${client.data.userId} left project ${projectId}`);
  }

  emitProjectUpdated(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('project:updated', data);
  }

  emitColumnCreated(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('column:created', data);
  }

  emitColumnUpdated(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('column:updated', data);
  }

  emitColumnDeleted(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('column:deleted', data);
  }

  emitTaskCreated(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('task:created', data);
  }

  emitTaskUpdated(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('task:updated', data);
  }

  emitTaskMoved(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('task:moved', data);
  }

  emitTaskDeleted(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('task:deleted', data);
  }

  emitParticipantAdded(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('participant:added', data);
  }

  emitParticipantRemoved(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('participant:removed', data);
  }

  emitUserRemovedFromProject(
    userId: string,
    projectId: string,
    projectName: string,
  ) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.server.to(socketId).emit('user:removed-from-project', {
          projectId,
          projectName,
        });
      });
    }
  }
}
