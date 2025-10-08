import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AuthForm } from "~/components/auth";
import { Title } from "~/components/common";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";
import { loginConfig, loginFields, registerConfig, registerFields } from "~/config/form.config";
import { useLoginMutation, useRegisterMutation } from "~/api/authApi";

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Tablero - React Router App" },
    { name: "description", content: "Bienvenido a tu tablero de trabajo" },
  ];
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loginMutation] = useLoginMutation();
  const [registerMutation] = useRegisterMutation();
  const { login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/projects");
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSubmit = async (values: Record<string, string>) => {
    try {
      const result = await loginMutation({
        email: values.email,
        password: values.password,
      }).unwrap();
      await login(result.access_token);
      toast.success('¡Bienvenido de vuelta!');
      navigate("/projects");
    } catch (error: any) {
      console.error('Error en login:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.status === 401) {
        toast.error('Email o contraseña incorrectos');
      } else {
        toast.error('Error al iniciar sesión. Intenta nuevamente.');
      }
    }
  };

  const handleRegisterSubmit = async (values: Record<string, string>) => {
    try {
      const result = await registerMutation({
        name: values.name,
        email: values.email,
        password: values.password,
      }).unwrap();
      await login(result.access_token);
      toast.success('¡Cuenta creada exitosamente!');
      navigate("/projects");
    } catch (error: any) {
      console.error('Error en registro:', error);
      if (error?.data?.message) {
        toast.error(error.data.message);
      } else if (error?.status === 409) {
        toast.error('Este email ya está registrado');
      } else {
        toast.error('Error al crear la cuenta. Intenta nuevamente.');
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="h-full w-full flex flex-col justify-between items-center px-6 py-8 sm:px-8 sm:py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400 rounded-3xl mb-8 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <Title level={1} variant="gradient" size="3xl" className="mb-6 leading-tight">
            Tablero
          </Title>
        </div>

        <div className="h-full w-full max-w-lg bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 dark:border-slate-800/70 overflow-hidden relative z-10 transition-colors">
          <div className="flex border-b border-gray-200/60 dark:border-slate-800 bg-gradient-to-r from-gray-50/80 to-blue-50/40 dark:from-slate-900/80 dark:to-slate-900/40 flex-shrink-0">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-6 px-8 text-center font-bold text-lg transition-all duration-300 ${activeTab === 'login'
                ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 shadow-lg'
                : 'text-gray-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:shadow-md'
                }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-6 px-8 text-center font-bold text-lg transition-all duration-300 ${activeTab === 'register'
                ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 shadow-lg'
                : 'text-gray-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-white/60 dark:hover:bg-slate-800/70 hover:shadow-md'
                }`}
            >
              Registrarse
            </button>
          </div>

          <div className="h-full max-w-md mx-auto p-8 sm:p-12-">
            {activeTab === 'login' && (
              <div className="space-y-8">
                <AuthForm.Header
                  title={loginConfig.title}
                  subtitle={loginConfig.subtitle?.text}
                  linkText={loginConfig.subtitle?.link?.text}
                  linkHref={loginConfig.subtitle?.link?.href}
                />
                <AuthForm fields={loginFields} onSubmit={handleLoginSubmit} showBackground={false} showContainer={false}>
                  <AuthForm.Fields fields={loginFields} />
                  <AuthForm.Submit text={loginConfig.submitText} loadingText="Iniciando sesión..." />
                </AuthForm>
              </div>
            )}

            {activeTab === 'register' && (
              <div className="space-y-8">
                <AuthForm.Header
                  title={registerConfig.title}
                  subtitle={registerConfig.subtitle?.text}
                  linkText={registerConfig.subtitle?.link?.text}
                  linkHref={registerConfig.subtitle?.link?.href}
                />
                  <AuthForm fields={registerFields} onSubmit={handleRegisterSubmit} showBackground={false} showContainer={false}>
                    <AuthForm.Fields fields={registerFields} />
                    <AuthForm.Submit text={registerConfig.submitText} loadingText="Creando cuenta..." />
                  </AuthForm>
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-slate-400 text-base font-medium">
            Al continuar, aceptas nuestros términos de servicio
          </p>
        </div>
      </div>
    </div>
  );
}
