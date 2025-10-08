import type { User } from './user.interface';
import type { ProjectParticipant } from './project-participant.interface';
import type { Column } from './column.interface';

export interface Project {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly ownerId: string;
  readonly owner: User;
  readonly participants: ProjectParticipant[];
  readonly columns: Column[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
