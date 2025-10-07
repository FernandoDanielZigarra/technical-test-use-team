import type { FormField } from './form-field.interface';

export interface FormConfig {
  readonly fields: FormField[];
  readonly submitText: string;
  readonly title: string;
  readonly subtitle?: {
    text: string;
    link?: {
      text: string;
      href: string;
    };
  };
}
