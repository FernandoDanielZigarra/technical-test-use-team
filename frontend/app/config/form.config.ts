import { validators } from "../utils/validators";
import type { FormField, FormConfig } from "~/interfaces/forms";

export const registerFields: FormField[] = [
    {
        id: "name",
        label: "Nombre completo",
        type: "text",
        placeholder: "ej: Juan Pérez",
        validation: validators.compose(
            validators.required("Nombre"),
            validators.minLength(2, "Nombre")
        ),
        autoComplete: "name",
    },
    {
        id: "email",
        label: "Correo electrónico",
        type: "email",
        placeholder: "ej: usuario@ejemplo.com",
        validation: validators.compose(
            validators.required("Correo electrónico"),
            validators.email
        ),
        autoComplete: "email",
    },
    {
        id: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "********",
        validation: validators.compose(
            validators.required("Contraseña"),
            validators.password
        ),
        autoComplete: "new-password",
    },
];

export const registerConfig: FormConfig = {
    fields: registerFields,
    submitText: "Crear cuenta",
    title: "Crea tu cuenta",
};

export const loginFields: FormField[] = [
    {
        id: "email",
        label: "Correo electrónico",
        type: "email",
        placeholder: "ej: usuario@ejemplo.com",
        validation: validators.compose(
            validators.required("Correo electrónico"),
            validators.email
        ),
        autoComplete: "email",
    },
    {
        id: "password",
        label: "Contraseña",
        type: "password",
        placeholder: "********",
        validation: validators.required("Contraseña"),
        autoComplete: "current-password",
    },
];

export const loginConfig: FormConfig = {
    fields: loginFields,
    submitText: "Iniciar sesión",
    title: "Bienvenido de nuevo",
};
