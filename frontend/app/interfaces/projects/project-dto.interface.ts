import type { ParticipantRole } from './participant-role.enum';

export interface CreateProjectDto {
  readonly name: string;
  readonly description?: string;
}

export interface UpdateProjectDto {
  readonly name?: string;
  readonly description?: string;
}

export interface CreateColumnDto {
  readonly title: string;
  readonly projectId: string;
}

export interface UpdateColumnDto {
  readonly title?: string;
  readonly order?: number;
}

export interface CreateTaskDto {
  readonly title: string;
  readonly description?: string;
  readonly assigneeId?: number;
}

export interface UpdateTaskDto {
  readonly title?: string;
  readonly description?: string;
  readonly assigneeId?: number;
}

export interface MoveTaskDto {
  readonly targetColumnId: string;
  readonly newOrder: number;
}

export interface AddParticipantDto {
  readonly email: string;
  readonly role?: ParticipantRole;
}
