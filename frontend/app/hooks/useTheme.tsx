import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  readonly theme: Theme;
  readonly systemTheme: Theme;
  readonly toggleTheme: () => void;
  readonly setTheme: (theme: Theme) => void;
  readonly resetToSystem: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "useTeam-theme";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { readonly children: React.ReactNode }) {
  const [systemTheme, setSystemTheme] = useState<Theme>(() => getSystemTheme());
  const [userPreference, setUserPreference] = useState<Theme | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
    return null;
  });

  const resolvedTheme: Theme = userPreference ?? systemTheme;

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      const newSystemTheme: Theme = event.matches ? "dark" : "light";
      setSystemTheme(newSystemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((theme: Theme) => {
    setUserPreference(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const resetToSystem = useCallback(() => {
    setUserPreference(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: resolvedTheme,
      systemTheme,
      toggleTheme,
      setTheme,
      resetToSystem,
    }),
    [resolvedTheme, systemTheme, toggleTheme, setTheme, resetToSystem],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}
