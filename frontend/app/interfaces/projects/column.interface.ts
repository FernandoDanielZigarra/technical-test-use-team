import type { Task } from './task.interface';

export interface Column {
  readonly id: string;
  readonly title: string;
  readonly order: number;
  readonly projectId: string;
  readonly tasks: Task[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
