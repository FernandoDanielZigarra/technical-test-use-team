import type { Route } from "./+types/home";
import { useState, useEffect } from "react";
import { LoginForm, RegisterForm } from "~/components/auth";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "react-router";

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

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/projects");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-100/30 to-transparent"></div>
      </div>
      <div className="absolute top-10 left-5 w-16 h-16 bg-blue-200 rounded-full opacity-15 animate-pulse pointer-events-none"></div>
      <div className="absolute top-20 right-10 w-12 h-12 bg-indigo-200 rounded-full opacity-20 animate-pulse delay-1000 pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-10 h-10 bg-purple-200 rounded-full opacity-15 animate-pulse delay-500 pointer-events-none"></div>
      <div className="absolute bottom-20 right-5 w-14 h-14 bg-blue-300 rounded-full opacity-10 animate-pulse delay-2000 pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto px-6 py-12 sm:px-8 sm:py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl mb-8 shadow-xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6 leading-tight">
            Tablero
          </h1>
          <p className="text-gray-700 text-xl sm:text-2xl font-medium mx-auto">
            Organiza tus proyectos y colabora con tu equipo
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 overflow-hidden max-w-md mx-auto relative z-10">
          <div className="flex border-b border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-blue-50/40">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-6 px-8 text-center font-bold text-lg transition-all duration-300 relative z-20 cursor-pointer ${activeTab === 'login'
                  ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transform text-xl'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-white/60 hover:shadow-md'
                }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 py-6 px-8 text-center font-bold text-lg transition-all duration-300 relative z-20 cursor-pointer ${activeTab === 'register'
                  ? 'text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg transform text-xl'
                  : 'text-gray-700 hover:text-blue-700 hover:bg-white/60 hover:shadow-md'
                }`}
            >
              Registrarse
            </button>
          </div>

          <div className="p-10 max-w-md mx-auto sm:p-12">
            {activeTab === 'login' && (
              <div className="space-y-8">
                <LoginForm />
              </div>
            )}

            {activeTab === 'register' && (
              <div className="space-y-8">
                <RegisterForm />
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-base font-medium">
            Al continuar, aceptas nuestros términos de servicio
          </p>
        </div>
      </div>
    </div>
  );
}
