import { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { clearAuthTokenStorage, getAuthToken, persistAuthToken, decodeJWT } from "~/middleware/auth";
import { projectsApi } from "~/api/projectsApi";
import { authApi } from "~/api/authApi";
import { socketService } from "~/services/socket.service";
import { AUTH_EVENTS } from "~/config/constants";

interface AuthContextType {
  readonly isAuthenticated: boolean;
  readonly token: string | null;
  readonly login: (token: string) => Promise<void>;
  readonly logout: () => void;
  readonly tokenExpired: boolean;
  readonly acknowledgeTokenExpiration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const dispatch = useDispatch();

  const clearSession = useCallback(() => {
    clearAuthTokenStorage();
    setToken(null);
    socketService.disconnect();
    dispatch(projectsApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
  }, [dispatch]);

  const handleTokenExpired = useCallback(() => {
    setTokenExpired((prev) => {
      if (prev) {
        return prev;
      }
      clearSession();
      return true;
    });
  }, [clearSession]);

  const login = useCallback(async (newToken: string): Promise<void> => {
    persistAuthToken(newToken);
    setTokenExpired(false);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setTokenExpired(false);
  }, [clearSession]);

  const acknowledgeTokenExpiration = useCallback(() => {
    setTokenExpired(false);
  }, []);

  useEffect(() => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      return;
    }

    const payload = decodeJWT(storedToken);
    const expiresAt = payload?.exp ? payload.exp * 1000 : null;

    if (expiresAt && expiresAt <= Date.now()) {
      handleTokenExpired();
      return;
    }

    setToken(storedToken);
  }, [handleTokenExpired]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const payload = decodeJWT(token);
    const expiresAt = payload?.exp ? payload.exp * 1000 : null;

    if (!expiresAt) {
      return;
    }

    const timeout = window.setTimeout(() => {
      handleTokenExpired();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_EXPIRED));
      }
    }, Math.max(expiresAt - Date.now(), 0));

    return () => window.clearTimeout(timeout);
  }, [token, handleTokenExpired]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const listener = () => handleTokenExpired();
    window.addEventListener(AUTH_EVENTS.TOKEN_EXPIRED, listener);
    return () => window.removeEventListener(AUTH_EVENTS.TOKEN_EXPIRED, listener);
  }, [handleTokenExpired]);

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated: !!token,
    token,
    login,
    logout,
    tokenExpired,
    acknowledgeTokenExpiration,
  }), [token, login, logout, tokenExpired, acknowledgeTokenExpiration]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}