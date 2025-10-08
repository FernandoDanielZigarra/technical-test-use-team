import { useState, useEffect, createContext, useContext, useMemo } from "react";
import { useDispatch } from "react-redux";
import { clearAuthTokenStorage, getAuthToken, persistAuthToken } from "~/middleware/auth";
import { projectsApi } from "~/api/projectsApi";
import { authApi } from "~/api/authApi";

interface AuthContextType {
  readonly isAuthenticated: boolean;
  readonly token: string | null;
  readonly login: (token: string) => Promise<void>;
  readonly logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const storedToken = getAuthToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = async (token: string): Promise<void> => {
    persistAuthToken(token);
    setToken(token);
  };

  const logout = () => {
    clearAuthTokenStorage();
    setToken(null);
    
    dispatch(projectsApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
  };

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated: !!token,
    token,
    login,
    logout,
  }), [token, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}