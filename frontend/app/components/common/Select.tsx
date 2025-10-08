import type { SelectHTMLAttributes } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly fullWidth?: boolean;
}

export function Select({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = !!error;

  let ariaDescribedBy: string | undefined;
  if (error) {
    ariaDescribedBy = `${selectId}-error`;
  } else if (helperText) {
    ariaDescribedBy = `${selectId}-helper`;
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`
          px-3 py-2 
          border rounded-md 
          bg-white dark:bg-slate-700 
          text-slate-900 dark:text-slate-100
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${fullWidth ? 'w-full' : ''}
          ${
            hasError
              ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
              : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500'
          }
          ${className}
        `}
        aria-invalid={hasError}
        aria-describedby={ariaDescribedBy}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p id={`${selectId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${selectId}-helper`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
