import type { LabelHTMLAttributes, ReactNode } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  readonly children: ReactNode;
  readonly required?: boolean;
}

export function Label({ children, required = false, className = '', ...props }: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 ${className}`}
      {...props}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}
