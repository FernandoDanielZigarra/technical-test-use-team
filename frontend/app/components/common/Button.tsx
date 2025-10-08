import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly children: ReactNode;
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly fullWidth?: boolean;
  readonly isLoading?: boolean;
}

const variantClasses = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-400 dark:active:bg-blue-300',
  secondary:
    'bg-slate-200 text-slate-800 hover:bg-slate-300 active:bg-slate-400 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 dark:active:bg-slate-500',
  danger:
    'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400 dark:active:bg-red-300',
  success:
    'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 dark:bg-green-500 dark:hover:bg-green-400 dark:active:bg-green-300',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 dark:focus-visible:ring-offset-slate-900';
  const widthClass = fullWidth ? 'w-full' : '';
  const variantClass = variantClasses[variant];
  const sizeClass = sizeClasses[size];

  return (
    <button
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
