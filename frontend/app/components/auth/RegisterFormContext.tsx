import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useRegisterForm } from "~/hooks/useRegisterForm";

interface RegisterFormContextType {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  setValue: (name: string, value: string) => void;
  setTouched: (name: string) => void;
  handleSubmit: () => Promise<void>;
  fields: Array<{
    name: string;
    label: string;
    type: string;
    placeholder: string;
    validation: any;
    autoComplete?: string;
  }>;
}

const RegisterFormContext = createContext<RegisterFormContextType | null>(null);

interface RegisterFormProviderProps {
  readonly children: ReactNode;
  readonly onSuccess?: () => void;
}

export function RegisterFormProvider({ children, onSuccess }: RegisterFormProviderProps) {
  const formData = useRegisterForm(onSuccess);

  return (
    <RegisterFormContext.Provider value={formData}>
      {children}
    </RegisterFormContext.Provider>
  );
}

export function useRegisterFormContext() {
  const context = useContext(RegisterFormContext);
  if (!context) {
    throw new Error("useRegisterFormContext must be used within RegisterFormProvider");
  }
  return context;
}
