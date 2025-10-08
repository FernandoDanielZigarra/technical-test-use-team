import type { User } from './user.interface';

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly order: number;
  readonly columnId: string;
  readonly assigneeId?: string | null;
  readonly assignee?: User;
  readonly createdAt: string;
  readonly updatedAt: string;
}
