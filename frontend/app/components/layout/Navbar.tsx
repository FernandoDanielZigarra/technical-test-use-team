import { Link } from "react-router";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "~/hooks/useAuth";
import { useTheme } from "~/hooks/useTheme";
import { UserMenu } from "./UserMenu";

export function Navbar() {
    const { isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <header className="w-full bg-transparent top-0 z-50 transition-colors duration-300 absolute">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    useTeam
                </Link>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                        aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
                    >
                        <span className="sr-only">Alternar tema</span>
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {isAuthenticated && (
                        <UserMenu />
                    )}
                </div>
            </nav>
        </header>
    );
}
