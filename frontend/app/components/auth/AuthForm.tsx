// 🎯 Nivel 1: Generic AuthForm Component
// Componente 100% reutilizable para CUALQUIER formulario de autenticación

import { forwardRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { AuthFormProvider, useAuthFormContext } from "./AuthFormContext";
import { FormInput, ErrorAlert } from "~/components/common";
import { Loader2 } from "lucide-react";
import type { FormField } from "~/interfaces/forms";

interface AuthFormProps {
  readonly children: ReactNode;
  readonly fields: FormField[];
  readonly onSubmit: (values: Record<string, string>) => Promise<void>;
  readonly className?: string;
}

interface AuthFormComponent
  extends React.ForwardRefExoticComponent<
    AuthFormProps & React.RefAttributes<HTMLDivElement>
  > {
  Header: typeof AuthFormHeader;
  Error: typeof AuthFormError;
  Fields: typeof AuthFormFields;
  Submit: typeof AuthFormSubmit;
}

export const AuthForm = forwardRef<HTMLDivElement, AuthFormProps>(
  ({ children, fields, onSubmit, className = "" }, ref) => {
    return (
      <AuthFormProvider fields={fields} onSubmit={onSubmit}>
        <div
          ref={ref}
          className={`lex items-center justify-center bg-gray-50 ${className}`}
        >
          <div className="max-w-md w-full space-y-8">{children}</div>
        </div>
      </AuthFormProvider>
    );
  },
) as AuthFormComponent;

AuthForm.displayName = "AuthForm";

interface AuthFormHeaderProps {
  readonly title: string;
  readonly subtitle?: ReactNode;
  readonly linkText?: string;
  readonly linkHref?: string;
}

export const AuthFormHeader = ({ title, subtitle, linkText, linkHref }: AuthFormHeaderProps) => {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
        {title}
      </h2>
      {(subtitle || linkText) && (
        <p className="text-gray-600 text-sm">
          {subtitle}{" "}
          {linkText && linkHref && (
            <Link
              to={linkHref}
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              {linkText}
            </Link>
          )}
        </p>
      )}
    </div>
  );
};

export const AuthFormError = () => {
  const { generalError } = useAuthFormContext();

  if (!generalError) return null;

  return <ErrorAlert message={generalError} type="error" />;
};

interface AuthFormFieldsProps {
  readonly fields: FormField[];
}

export const AuthFormFields = ({ fields }: AuthFormFieldsProps) => {
  const { values, errors, touched, setValue, setTouched, isSubmitting } =
    useAuthFormContext();

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormInput
          key={field.id}
          name={field.id}
          label={field.label}
          type={field.type}
          placeholder={field.placeholder}
          value={values[field.id] || ""}
          error={errors[field.id]}
          touched={touched[field.id]}
          onChange={(value) => setValue(field.id, value)}
          onBlur={() => setTouched(field.id)}
          autoComplete={field.autoComplete}
          disabled={isSubmitting}
        />
      ))}
    </div>
  );
};

interface AuthFormSubmitProps {
  readonly text: string;
  readonly loadingText?: string;
  readonly className?: string;
}

export const AuthFormSubmit = ({
  text,
  loadingText = "Procesando...",
  className = "",
}: AuthFormSubmitProps) => {
  const { handleSubmit, isSubmitting, isValid } = useAuthFormContext();

  return (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={isSubmitting || !isValid}
      className={`group relative w-full flex justify-center py-3 px-6 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
        isSubmitting || !isValid
          ? 'bg-gray-400 cursor-not-allowed transform-none shadow-none'
          : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
      } ${className}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
          {loadingText}
        </>
      ) : (
        text
      )}
    </button>
  );
};

AuthForm.Header = AuthFormHeader;
AuthForm.Error = AuthFormError;
AuthForm.Fields = AuthFormFields;
AuthForm.Submit = AuthFormSubmit;
