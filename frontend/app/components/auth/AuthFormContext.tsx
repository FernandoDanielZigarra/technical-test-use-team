import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useAuthForm } from "~/hooks/useAuthForm";
import type { FormField } from "~/interfaces/forms";

interface AuthFormContextType {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  generalError: string | null;
  setValue: (fieldId: string, value: string) => void;
  setTouched: (fieldId: string) => void;
  handleSubmit: () => Promise<void>;
}

const AuthFormContext = createContext<AuthFormContextType | null>(null);

interface AuthFormProviderProps {
  readonly children: ReactNode;
  readonly fields: FormField[];
  readonly onSubmit: (values: Record<string, string>) => Promise<void>;
}

export function AuthFormProvider({ children, fields, onSubmit }: AuthFormProviderProps) {
  const formData = useAuthForm({ fields, onSubmit });

  return <AuthFormContext.Provider value={formData}>{children}</AuthFormContext.Provider>;
}

export function useAuthFormContext() {
  const context = useContext(AuthFormContext);
  if (!context) {
    throw new Error("useAuthFormContext must be used within AuthFormProvider");
  }
  return context;
}
