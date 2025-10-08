import { useState, useCallback } from "react";
import type { FormField } from "~/interfaces/forms";

interface UseAuthFormOptions {
  readonly fields: FormField[];
  readonly onSubmit: (values: Record<string, string>) => Promise<void>;
}

interface FormState {
  values: Record<string, string>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  generalError: string | null;
}

export function useAuthForm({ fields, onSubmit }: UseAuthFormOptions) {
  const [state, setState] = useState<FormState>({
    values: {},
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    generalError: null,
  });

  const validateField = useCallback((field: FormField, value: string): string | null => {
    return field.validation(value);
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach((field) => {
      const error = validateField(field, state.values[field.id] || "");
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setState((prev) => ({ ...prev, errors: newErrors, isValid }));
    return isValid;
  }, [fields, state.values, validateField]);

  const setValue = useCallback(
    (fieldId: string, value: string) => {
      setState((prev) => {
        const newValues = { ...prev.values, [fieldId]: value };
        const field = fields.find((f) => f.id === fieldId);
        const error = field ? validateField(field, value) : null;
        const newErrors = { ...prev.errors };

        if (error) {
          newErrors[fieldId] = error;
        } else {
          delete newErrors[fieldId];
        }

        const isValid =
          Object.keys(newErrors).length === 0 &&
          fields.every((f) => newValues[f.id]?.trim());

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          isValid,
          generalError: null, 
        };
      });
    },
    [fields, validateField]
  );

  const setTouched = useCallback((fieldId: string) => {
    setState((prev) => ({
      ...prev,
      touched: { ...prev.touched, [fieldId]: true },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setState((prev) => ({ ...prev, isSubmitting: true, generalError: null }));

    try {
      await onSubmit(state.values);
    } catch (error) {
      const apiError = error as any;
      if (apiError?.data?.errors) {
        setState((prev) => ({
          ...prev,
          errors: Object.fromEntries(
            Object.entries(apiError.data.errors).map(([key, messages]: [string, any]) => [
              key,
              messages[0],
            ])
          ),
        }));
      } else {
        setState((prev) => ({
          ...prev,
          generalError: apiError?.data?.message || "An error occurred. Please try again.",
        }));
      }
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, onSubmit, state.values]);

  return {
    ...state,
    setValue,
    setTouched,
    handleSubmit,
  };
}
