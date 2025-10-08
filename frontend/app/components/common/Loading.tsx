interface SpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-4',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-blue-500 border-t-transparent dark:border-blue-400 ${sizeClasses[size]} ${className}`}
      aria-label="Cargando"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

interface LoadingProps {
  readonly message?: string;
  readonly fullScreen?: boolean;
}

export function Loading({ message = 'Cargando...', fullScreen = true }: LoadingProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-lg font-medium text-slate-700 dark:text-slate-300 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
