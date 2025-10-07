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
    const hasError = error && touched;

    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <div className="relative">
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
            className={`w-full text-gray-500 px-4 py-3 border-2 rounded-xl shadow-sm focus:outline-none transition-all border-gray-400 hover:border-blue-500 duration-300 ease-in-out ${
              hasError
                ? "border-red-300 focus:border-red-500 bg-red-50/50"
                : "border-gray-200 focus:border-blue-500 focus:ring-blue-200 bg-white/80"
            } ${disabled ? "bg-gray-100 cursor-not-allowed opacity-60" : "hover:border-blue-500 "} backdrop-blur-sm`}
          />
          {hasError && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {hasError && (
          <p id={`${name}-error`} className="text-sm text-red-600 flex items-center gap-1" role="alert">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";
