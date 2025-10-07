// 🎯 Composable Validators Pattern
// Validadores reutilizables y componibles

export type ValidationResult = string | null;
export type Validator = (value: string) => ValidationResult;

// Base validators
export const validators = {
  // Required validator
  required: (fieldName = "Este campo"): Validator => (value: string) => {
    return value.trim() ? null : `${fieldName} es obligatorio`;
  },

  // Min length validator
  minLength: (min: number, fieldName = "Este campo"): Validator => (value: string) => {
    return value.length >= min ? null : `${fieldName} debe tener al menos ${min} caracteres`;
  },

  // Email validator
  email: (value: string): ValidationResult => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Por favor ingresa un correo electrónico válido";
  },

  // Password validator (8+ chars, uppercase, lowercase, number)
  password: (value: string): ValidationResult => {
    if (value.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return "La contraseña debe contener al menos una letra minúscula";
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return "La contraseña debe contener al menos una letra mayúscula";
    }
    if (!/(?=.*\d)/.test(value)) {
      return "La contraseña debe contener al menos un número";
    }
    return null;
  },

  // Pattern validator
  pattern: (regex: RegExp, message: string): Validator => (value: string) => {
    return regex.test(value) ? null : message;
  },

  // Max length validator
  maxLength: (max: number, fieldName = "Este campo"): Validator => (value: string) => {
    return value.length <= max ? null : `${fieldName} debe tener como máximo ${max} caracteres`;
  },

  // Compose multiple validators
  compose: (...validators: Validator[]): Validator => (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  },
};
