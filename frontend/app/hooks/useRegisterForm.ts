import { useState, useCallback } from "react";
import { useRegisterMutation } from "../api/authApi";
import { useAuth } from "../hooks/useAuth";

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

interface FieldConfig {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  validation: ValidationRules;
  autoComplete?: string;
}

interface RegisterFormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

interface ApiError {
  status: number;
  data: {
    message: string;
    errors?: Record<string, string[]>;
  };
}

export const registerFields: FieldConfig[] = [
  {
    name: "name",
    label: "Full Name",
    type: "text",
    placeholder: "Enter your full name",
    validation: { required: true, minLength: 2 },
    autoComplete: "name",
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email",
    validation: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    autoComplete: "email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Create a password",
    validation: {
      required: true,
      minLength: 8,
      custom: (value: string) => {
        if (!/(?=.*[a-z])/.test(value)) return "Must contain at least one lowercase letter";
        if (!/(?=.*[A-Z])/.test(value)) return "Must contain at least one uppercase letter";
        if (!/(?=.*\d)/.test(value)) return "Must contain at least one number";
        return null;
      },
    },
    autoComplete: "new-password",
  },
];

export function useRegisterForm(onSuccess?: () => void) {
  const [registerMutation] = useRegisterMutation();
  const { login } = useAuth();

  const [state, setState] = useState<RegisterFormState>({
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
  });

  const validateField = useCallback((name: string, value: string): string | null => {
    const field = registerFields.find(f => f.name === name);
    if (!field) return null;

    const { validation } = field;

    if (validation.required && !value.trim()) {
      return `${field.label} is required`;
    }

    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    if (validation.pattern && !validation.pattern.test(value)) {
      return `Please enter a valid ${field.label.toLowerCase()}`;
    }

    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    registerFields.forEach(field => {
      const error = validateField(field.name, state.values[field.name] || "");
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setState(prev => ({ ...prev, errors: newErrors, isValid }));
    return isValid;
  }, [state.values, validateField]);

  const setValue = useCallback((name: string, value: string) => {
    setState(prev => {
      const newValues = { ...prev.values, [name]: value };
      const error = validateField(name, value);
      const newErrors = { ...prev.errors };
      if (error) {
        newErrors[name] = error;
      } else {
        delete newErrors[name];
      }

      const isValid = Object.keys(newErrors).length === 0 && registerFields.every(f => newValues[f.name]?.trim());

      return {
        ...prev,
        values: newValues,
        errors: newErrors,
        isValid,
      };
    });
  }, [validateField]);

  const setTouched = useCallback((name: string) => {
    setState(prev => ({ ...prev, touched: { ...prev.touched, [name]: true } }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const result = await registerMutation({
        name: state.values.name,
        email: state.values.email,
        password: state.values.password,
      }).unwrap();

      await login(result.access_token);
      onSuccess?.();
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError?.data?.errors) {
        setState(prev => ({
          ...prev,
          errors: Object.fromEntries(
            Object.entries(apiError.data.errors!).map(([key, messages]) => [key, messages[0]])
          ),
        }));
      } else {
        setState(prev => ({
          ...prev,
          errors: { general: apiError?.data?.message || "Registration failed" },
        }));
      }
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, registerMutation, state.values, login, onSuccess]);

  return {
    ...state,
    setValue,
    setTouched,
    handleSubmit,
    fields: registerFields,
  };
}