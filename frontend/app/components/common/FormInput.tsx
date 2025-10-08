import { forwardRef } from "react";

interface FormInputProps {
  readonly name: string;
  readonly label: string;
  readonly type: string;
  readonly placeholder: string;
  readonly value: string;
  readonly error?: string;
  readonly touched?: boolean;
  readonly onChange: (value: string) => void;
  readonly onBlur: () => void;
  readonly autoComplete?: string;
  readonly disabled?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      name,
      label,
      type,
      placeholder,
      value,
      error,
      touched,
      onChange,
      onBlur,
      autoComplete,
      disabled,
    },
    ref,
  ) => {
    
    const hasError = !!error;

    return (
      <div className="relative">
        <label
          htmlFor={name}
          className="block text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors mb-2"
        >
          {label}
        </label>
        <div className="relative group">
          <input
            ref={ref}
            id={name}
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={hasError ? "true" : "false"}
            aria-describedby={hasError ? `${name}-error` : undefined}
            className={`w-full px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${
              hasError
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-500/20"
                : "border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/20"
            } ${disabled ? "cursor-not-allowed opacity-60" : ""} placeholder:text-slate-400 dark:placeholder:text-slate-500`}
          />
          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          
          {}
          {hasError && (
            <div 
              id={`${name}-error`}
              role="alert"
              className="absolute left-0 top-full mt-1.5 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 pointer-events-none"
            >
              <div className="relative bg-red-600 dark:bg-red-700 text-white text-xs font-medium px-3 py-2 rounded-lg shadow-lg max-w-xs">
                {}
                <div className="absolute -top-1 left-4 w-2 h-2 bg-red-600 dark:bg-red-700 transform rotate-45"></div>
                <div className="flex items-start gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="leading-snug">{error}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
