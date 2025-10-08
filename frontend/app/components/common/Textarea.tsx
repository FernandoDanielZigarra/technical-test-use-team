import type { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label?: string;
  readonly error?: string;
  readonly helperText?: string;
  readonly fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  helperText,
  fullWidth = false,
  className = '',
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;
  const hasError = !!error;

  let ariaDescribedBy: string | undefined;
  if (error) {
    ariaDescribedBy = `${textareaId}-error`;
  } else if (helperText) {
    ariaDescribedBy = `${textareaId}-helper`;
  }

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`
          px-3 py-2 
          border rounded-md 
          bg-white dark:bg-slate-700 
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-vertical
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
      />
      {error && (
        <p id={`${textareaId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${textareaId}-helper`} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
