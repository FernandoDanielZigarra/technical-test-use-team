import type { HTMLAttributes, ReactNode } from 'react';

interface TitleProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly children: ReactNode;
  readonly level?: 1 | 2 | 3 | 4 | 5 | 6;
  readonly variant?: 'default' | 'gradient';
  readonly size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'auto';
}

export function Title({
  children,
  level = 1,
  variant = 'default',
  size = 'auto',
  className = '',
  ...props
}: TitleProps) {
  
  const sizeClasses = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
    '2xl': 'text-3xl',
    '3xl': 'text-4xl sm:text-5xl',
    auto: '', 
  };

  const autoSizeClasses = {
    1: 'text-3xl sm:text-4xl lg:text-5xl',
    2: 'text-2xl sm:text-3xl lg:text-4xl',
    3: 'text-xl sm:text-2xl lg:text-3xl',
    4: 'text-lg sm:text-xl lg:text-2xl',
    5: 'text-base sm:text-lg lg:text-xl',
    6: 'text-sm sm:text-base lg:text-lg',
  };

  const variantClasses = {
    default: 'text-slate-900 dark:text-slate-100',
    gradient:
      'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400',
  };

  const finalSizeClass = size === 'auto' ? autoSizeClasses[level] : sizeClasses[size];
  const baseClasses = `font-bold ${finalSizeClass} ${variantClasses[variant]} ${className}`.trim();

  switch (level) {
    case 1:
      return <h1 className={baseClasses} {...props}>{children}</h1>;
    case 2:
      return <h2 className={baseClasses} {...props}>{children}</h2>;
    case 3:
      return <h3 className={baseClasses} {...props}>{children}</h3>;
    case 4:
      return <h4 className={baseClasses} {...props}>{children}</h4>;
    case 5:
      return <h5 className={baseClasses} {...props}>{children}</h5>;
    case 6:
      return <h6 className={baseClasses} {...props}>{children}</h6>;
    default:
      return <h1 className={baseClasses} {...props}>{children}</h1>;
  }
}
