import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import type { Project, Column, Task, ProjectParticipant } from '~/interfaces/projects';

class SocketService {
  private socket: Socket | null = null;
  private currentProjectId: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: {
        token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentProjectId = null;
    }
  }

  joinProject(projectId: string) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    if (this.currentProjectId === projectId) {
      return;
    }

    if (this.currentProjectId !== null) {
      this.leaveProject(this.currentProjectId);
    }

  this.socket.emit('join:project', { projectId });
    this.currentProjectId = projectId;
    console.log(`📌 Joined project room: ${projectId}`);
  }

  leaveProject(projectId: string) {
    if (!this.socket) {
      return;
    }

  this.socket.emit('leave:project', { projectId });
    console.log(`👋 Left project room: ${projectId}`);
    
    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
    }
  }

  onProjectUpdated(callback: (project: Partial<Project>) => void) {
    this.socket?.on('project:updated', callback);
  }

  onColumnCreated(callback: (column: Column) => void) {
    this.socket?.on('column:created', callback);
  }

  onColumnUpdated(callback: (column: Column) => void) {
    this.socket?.on('column:updated', callback);
  }

  onColumnDeleted(callback: (columnId: string) => void) {
    this.socket?.on('column:deleted', callback);
  }

  onTaskCreated(callback: (task: Task) => void) {
    this.socket?.on('task:created', callback);
  }

  onTaskUpdated(callback: (task: Task) => void) {
    this.socket?.on('task:updated', callback);
  }

  onTaskMoved(callback: (data: { taskId: string; sourceColumnId: string; targetColumnId: string; newOrder: number }) => void) {
    this.socket?.on('task:moved', callback);
  }

  onTaskDeleted(callback: (taskId: string) => void) {
    this.socket?.on('task:deleted', callback);
  }

  onParticipantAdded(callback: (participant: ProjectParticipant) => void) {
    this.socket?.on('participant:added', callback);
  }

  onParticipantRemoved(callback: (participantId: string) => void) {
    this.socket?.on('participant:removed', callback);
  }

  // Remove event listeners
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getCurrentProjectId(): string | null {
    return this.currentProjectId;
  }
}

export const socketService = new SocketService();
