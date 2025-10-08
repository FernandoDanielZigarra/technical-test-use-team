

import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { useRegisterMutation } from "~/api/authApi";
import { AuthForm } from "./AuthForm";
import { registerConfig, registerFields } from "~/config/form.config";

interface RegisterFormProps {
  readonly onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [registerMutation] = useRegisterMutation();

  const handleSubmit = async (values: Record<string, string>) => {
    const result = await registerMutation({
      name: values.name,
      email: values.email,
      password: values.password,
    }).unwrap();

    await login(result.access_token);
    onSuccess?.();
    navigate("/projects");
  };

  return (
    <AuthForm fields={registerFields} onSubmit={handleSubmit}>
      <AuthForm.Header
        title={registerConfig.title}
        linkText={registerConfig.subtitle?.link?.text}
        linkHref={registerConfig.subtitle?.link?.href}
      />
      <AuthForm.Error />
      <AuthForm.Fields fields={registerFields} />
      <AuthForm.Submit text={registerConfig.submitText} loadingText="Creating account..." />
    </AuthForm>
  );
}
