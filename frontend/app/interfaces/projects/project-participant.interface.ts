import type { ParticipantRole } from './participant-role.enum';
import type { User } from './user.interface';

export interface ProjectParticipant {
  readonly id: string;
  readonly role: ParticipantRole;
  readonly user: User;
  readonly userId: number;
  readonly projectId: string;
}
