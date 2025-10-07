// 🎯 Nivel 3: High-Level LoginForm (Convenience Component)
// Wrapper conveniente que usa AuthForm internamente

import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { useLoginMutation } from "~/api/authApi";
import { AuthForm } from "./AuthForm";
import { loginConfig, loginFields } from "~/config/form.config";

interface LoginFormProps {
  readonly onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loginMutation] = useLoginMutation();

  const handleSubmit = async (values: Record<string, string>) => {
    const result = await loginMutation({
      email: values.email,
      password: values.password,
    }).unwrap();

    await login(result.access_token);
    onSuccess?.();
    navigate("/projects");
  };

  return (
    <AuthForm fields={loginFields} onSubmit={handleSubmit}>
      <AuthForm.Header
        title={loginConfig.title}
        linkText={loginConfig.subtitle?.link?.text}
        linkHref={loginConfig.subtitle?.link?.href}
      />
      <AuthForm.Error />
      <AuthForm.Fields fields={loginFields} />
      <AuthForm.Submit text={loginConfig.submitText} loadingText="Iniciando sesión..." />
    </AuthForm>
  );
}
