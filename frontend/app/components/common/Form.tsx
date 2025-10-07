import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
  type FormEvent,
} from "react";

interface FormContextType {
  readonly values: Record<string, string>;
  readonly errors: Record<string, string>;
  readonly isLoading: boolean;
  readonly setValue: (name: string, value: string) => void;
  readonly setError: (name: string, error: string) => void;
  readonly clearError: (name: string) => void;
  readonly setLoading: (loading: boolean) => void;
  readonly handleSubmit: (e: FormEvent) => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProps {
  readonly children: ReactNode;
  readonly onSubmit: (values: Record<string, string>) => void;
  readonly initialValues?: Record<string, string>;
}

export function Form({ children, onSubmit, initialValues = {} }: FormProps) {
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const setValue = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const setError = (name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const clearError = (name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const contextValue = useMemo<FormContextType>(
    () => ({
      values,
      errors,
      isLoading,
      setValue,
      setError,
      clearError,
      setLoading,
      handleSubmit,
    }),
    [values, errors, isLoading],
  );

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit}>{children}</form>
    </FormContext.Provider>
  );
}

interface FieldProps {
  readonly name: string;
  readonly type?: string;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly autoComplete?: string;
  readonly className?: string;
  readonly label?: string;
}

export function Field({
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
  className =
    "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm",
  label,
}: FieldProps) {
  const context = useContext(FormContext);
  if (!context) throw new Error("Field must be used within Form");

  const { values, errors, isLoading, setValue, clearError } = context;
  const error = errors[name];

  return (
    <div>
      {label && (
        <label htmlFor={name} className="sr-only">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className={`${className} ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
        value={values[name] || ""}
        onChange={(e) => {
          setValue(name, e.target.value);
          if (error) clearError(name);
        }}
        disabled={isLoading}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface ButtonProps {
  readonly children: ReactNode;
  readonly type?: "submit" | "button";
  readonly className?: string;
  readonly disabled?: boolean;
}

export function Button({
  children,
  type = "submit",
  className =
    "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed",
  disabled,
}: ButtonProps) {
  const context = useContext(FormContext);
  if (!context) throw new Error("Button must be used within Form");

  const { isLoading } = context;

  return (
    <button type={type} disabled={disabled || isLoading} className={className}>
      {isLoading ? "Loading..." : children}
    </button>
  );
}

interface ErrorProps {
  readonly children: ReactNode;
  readonly className?: string;
}

export function ErrorDisplay({
  children,
  className = "rounded-md bg-red-50 p-4",
}: ErrorProps) {
  return (
    <div className={className}>
      <div className="text-sm text-red-700">{children}</div>
    </div>
  );
}

export function useForm() {
  const context = useContext(FormContext);
  if (!context) throw new Error("useForm must be used within Form");
  return context;
}
