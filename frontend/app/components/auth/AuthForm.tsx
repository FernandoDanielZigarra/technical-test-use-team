

import { forwardRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { AuthFormProvider, useAuthFormContext } from "./AuthFormContext";
import { FormInput, ErrorAlert, Button, Title } from "~/components/common";
import type { FormField } from "~/interfaces/forms";

interface AuthFormProps {
    readonly children: ReactNode;
    readonly fields: FormField[];
    readonly onSubmit: (values: Record<string, string>) => Promise<void>;
    readonly className?: string;
    readonly showBackground?: boolean;
    readonly showContainer?: boolean;
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
    ({ children, fields, onSubmit, className = "", showBackground = true, showContainer = true }, ref) => {
        return (
            <AuthFormProvider fields={fields} onSubmit={onSubmit}>
                {children}
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
            <Title level={2} size="xl" className="mb-2">
                {title}
            </Title>
            {(subtitle || linkText) && (
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                    {subtitle}{" "}
                    {linkText && linkHref && (
                        <Link
                            to={linkHref}
                            className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
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
        <div className="space-y-5">
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
        <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            isLoading={isSubmitting}
            fullWidth
            variant="primary"
            size="lg"
            className={`group relative shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${isSubmitting || !isValid
                ? 'transform-none shadow-none'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900'
                } ${className}`}
        >
            {isSubmitting ? loadingText : text}
        </Button>
    );
};

AuthForm.Header = AuthFormHeader;
AuthForm.Error = AuthFormError;
AuthForm.Fields = AuthFormFields;
AuthForm.Submit = AuthFormSubmit;
