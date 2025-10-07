// 🎯 Ejemplo: Reset Password Form
// Demuestra lo fácil que es agregar un nuevo formulario con la arquitectura de abstracción

import { validators } from "../utils/validators";
import type { FormField, FormConfig } from "~/interfaces/forms";

// Solo necesitas definir los campos - NO duplicar componentes
export const resetPasswordFields: FormField[] = [
  {
    id: "email",
    label: "Correo electrónico",
    type: "email",
    placeholder: "Ingresa tu correo electrónico",
    validation: validators.compose(validators.required("Correo electrónico"), validators.email),
    autoComplete: "email",
  },
];

export const resetPasswordConfig: FormConfig = {
  fields: resetPasswordFields,
  submitText: "Enviar enlace de restablecimiento",
  title: "Restablece tu contraseña",
  subtitle: {
    text: "¿Recuerdas tu contraseña?",
    link: {
      text: "Inicia sesión",
      href: "/",
    },
  },
};

// Ejemplo de uso:
// <AuthForm fields={resetPasswordFields} onSubmit={handleReset}>
//   <AuthForm.Header
//     title={resetPasswordConfig.title}
//     subtitle={resetPasswordConfig.subtitle?.text}
//     linkText={resetPasswordConfig.subtitle?.link?.text}
//     linkHref={resetPasswordConfig.subtitle?.link?.href}
//   />
//   <AuthForm.Error />
//   <AuthForm.Fields fields={resetPasswordFields} />
//   <AuthForm.Submit text={resetPasswordConfig.submitText} />
// </AuthForm>
