import type { Validator } from '~/utils/validators';

export interface FormField {
  readonly id: string;
  readonly label: string;
  readonly type: 'text' | 'email' | 'password' | 'number' | 'tel';
  readonly placeholder: string;
  readonly validation: Validator;
  readonly autoComplete?: string;
}
