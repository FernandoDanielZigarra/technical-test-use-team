import { Link, useNavigate } from "react-router";
import { useCallback } from "react";
import { useAuth } from "~/hooks/useAuth";

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  return (
    <header className="bg-white/90 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-slate-900">
          useTeam
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <Link
              to="/projects"
              className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition"
            >
              Proyectos
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md transition"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
