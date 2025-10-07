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
import { ProjectsService } from '../projects/projects.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<number, Set<string>> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    private readonly projectsService: ProjectsService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      client.data.userId = userId;

      // Guardar referencia del socket del usuario
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.add(client.id);
      }

      console.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      console.error('Authentication error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId && this.userSockets.has(userId)) {
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);

        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
        }
      }
    }

    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:project')
  async handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const userId = client.data.userId;
    const { projectId } = data;

    try {
      // Verificar que el usuario sea participante del proyecto
      const hasAccess = await this.projectsService.isUserParticipant(
        projectId,
        userId,
      );

      if (!hasAccess) {
        client.emit('error', { message: 'No tienes acceso a este proyecto' });
        return;
      }

      // Unirse a la sala del proyecto
      client.join(`project:${projectId}`);
      console.log(`User ${userId} joined project ${projectId}`);

      client.emit('joined:project', { projectId });
    } catch (error) {
      console.error('Error al unirse al proyecto:', error);
      client.emit('error', { message: 'Error al unirse al proyecto' });
    }
  }

  @SubscribeMessage('leave:project')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { projectId: string },
  ) {
    const { projectId } = data;
    client.leave(`project:${projectId}`);
    console.log(`User ${client.data.userId} left project ${projectId}`);
  }

  // Métodos para emitir eventos desde servicios
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
}
