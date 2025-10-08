import { useState, useEffect, createContext, useContext, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { clearAuthTokenStorage, getAuthToken, persistAuthToken, decodeJWT } from "~/middleware/auth";
import { projectsApi } from "~/api/projectsApi";
import { authApi } from "~/api/authApi";
import { socketService } from "~/services/socket.service";
import { AUTH_EVENTS } from "~/config/constants";

/**
 * Interface que define el tipo del contexto de autenticación
 * Expone métodos para login, logout y gestión de expiración de tokens
 */
interface AuthContextType {
  readonly isAuthenticated: boolean;
  readonly token: string | null;
  readonly login: (token: string) => Promise<void>;
  readonly logout: () => void;
  readonly tokenExpired: boolean;
  readonly acknowledgeTokenExpiration: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider - Componente proveedor del contexto de autenticación
 * 
 * Gestiona el estado de autenticación del usuario de forma centralizada:
 * - Persiste el token JWT en localStorage
 * - Detecta automáticamente la expiración del token mediante el campo "exp" del JWT
 * - Escucha eventos globales de expiración (despachados desde baseQuery en API calls)
 * - Limpia el estado de la aplicación al cerrar sesión o expirar el token
 * 
 * Flujos principales:
 * 1. Al montar: Verifica si hay un token guardado y si es válido
 * 2. Al hacer login: Persiste el token y actualiza el estado
 * 3. Al expirar: Limpia sesión, desconecta WebSocket, y resetea caché de APIs
 */
export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [tokenExpired, setTokenExpired] = useState(false);
  const [isManualLogout, setIsManualLogout] = useState(false);
  const dispatch = useDispatch();

  /**
   * clearSession - Limpia completamente la sesión del usuario
   * 
   * Realiza las siguientes acciones:
   * 1. Elimina el token de localStorage
   * 2. Limpia el estado local del token
   * 3. Desconecta la conexión WebSocket
   * 4. Resetea el estado de RTK Query (projectsApi y authApi) para evitar datos cacheados
   */
  const clearSession = useCallback(() => {
    clearAuthTokenStorage();
    setToken(null);
    socketService.disconnect();
    dispatch(projectsApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
  }, [dispatch]);

  /**
   * handleTokenExpired - Maneja la expiración del token
   * 
   * Usa un patrón de "set con verificación previa" para evitar múltiples ejecuciones:
   * - Solo ejecuta clearSession si tokenExpired era false
   * - Esto previene llamadas duplicadas cuando múltiples componentes detectan la expiración
   * - Solo muestra el modal si NO es un logout manual
   */
  const handleTokenExpired = useCallback(() => {
    setTokenExpired((prev) => {
      // Si es un logout manual, no mostrar el modal de expiración
      if (isManualLogout) {
        return false;
      }
      if (prev) {
        return prev; // Ya estaba expirado, no hacer nada
      }
      clearSession(); // Primera vez que expira, limpiar sesión
      return true;
    });
  }, [clearSession, isManualLogout]);

  /**
   * login - Autentica al usuario con un nuevo token JWT
   * 
   * @param newToken - Token JWT recibido del backend después del login/registro
   * 
   * Proceso:
   * 1. Persiste el token en localStorage (para supervivir a recargas de página)
   * 2. Resetea el flag de expiración
   * 3. Actualiza el estado local con el nuevo token
   */
  const login = useCallback(async (newToken: string): Promise<void> => {
    persistAuthToken(newToken);
    setTokenExpired(false);
    setToken(newToken);
  }, []);

  /**
   * logout - Cierra la sesión del usuario manualmente
   * 
   * Diferencia con handleTokenExpired:
   * - logout es una acción voluntaria del usuario (no debe mostrar modal de expiración)
   * - handleTokenExpired es automático cuando el token caduca (debe mostrar modal)
   * 
   * Proceso:
   * 1. Marca como logout manual para prevenir modal de expiración
   * 2. Limpia la sesión (token, WebSocket, caché)
   * 3. Resetea los flags de expiración
   * 4. Después de un pequeño delay, resetea el flag de logout manual
   */
  const logout = useCallback(() => {
    setIsManualLogout(true); // Marca como logout manual
    clearSession();
    setTokenExpired(false);
    // Resetea el flag después de la limpieza
    setTimeout(() => setIsManualLogout(false), 100);
  }, [clearSession]);

  /**
   * acknowledgeTokenExpiration - Permite al usuario reconocer que vio el modal de expiración
   * 
   * Resetea el flag tokenExpired a false para que el modal no se muestre nuevamente
   * hasta la próxima expiración real
   */
  const acknowledgeTokenExpiration = useCallback(() => {
    setTokenExpired(false);
  }, []);

  /**
   * Effect 1: Verificación inicial del token al montar el componente
   * 
   * Al cargar la aplicación:
   * 1. Busca el token en localStorage
   * 2. Decodifica el JWT para extraer el campo "exp" (expiration time en segundos Unix)
   * 3. Verifica si ya expiró comparando con Date.now()
   * 4. Si ya expiró: Marca como expirado y limpia sesión
   * 5. Si es válido: Lo establece en el estado para mantener la sesión activa
   */
  useEffect(() => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      return;
    }

    const payload = decodeJWT(storedToken);
    const expiresAt = payload?.exp ? payload.exp * 1000 : null; // exp está en segundos, convertir a milisegundos

    if (expiresAt && expiresAt <= Date.now()) {
      handleTokenExpired(); // Token ya expiró
      return;
    }

    setToken(storedToken); // Token válido, establecerlo
  }, [handleTokenExpired]);

  /**
   * Effect 2: Temporizador automático para expiración del token
   * 
   * Una vez que tenemos un token activo:
   * 1. Decodifica el JWT para obtener el tiempo de expiración (exp claim)
   * 2. Calcula cuántos milisegundos faltan para que expire
   * 3. Establece un setTimeout para ejecutar handleTokenExpired en ese momento exacto
   * 4. También despacha un evento global TOKEN_EXPIRED para que otros componentes lo escuchen
   * 
   * Ventajas de este approach:
   * - Detección proactiva: No espera a un 401 del backend
   * - Experiencia de usuario mejorada: Muestra el modal de expiración antes de que fallen las requests
   * - Limpieza automática: El timeout se cancela si el token cambia o el componente se desmonta
   */
  useEffect(() => {
    if (!token) {
      return;
    }

    const payload = decodeJWT(token);
    const expiresAt = payload?.exp ? payload.exp * 1000 : null;

    if (!expiresAt) {
      return; // Token sin exp claim, no podemos predecir expiración
    }

    // Calcula el delay: diferencia entre expiresAt y ahora, mínimo 0
    const timeout = window.setTimeout(() => {
      handleTokenExpired();
      // Despacha evento global para que otros componentes (como baseQuery) lo escuchen
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_EXPIRED));
      }
    }, Math.max(expiresAt - Date.now(), 0));

    // Cleanup: Cancela el timeout si el token cambia o el componente se desmonta
    return () => window.clearTimeout(timeout);
  }, [token, handleTokenExpired]);

  /**
   * Effect 3: Listener de eventos globales de expiración
   * 
   * Escucha el evento AUTH_EVENTS.TOKEN_EXPIRED que puede ser despachado desde:
   * - baseQuery cuando recibe un 401 del backend
   * - El Effect 2 de arriba cuando el temporizador se completa
   * - Cualquier otra parte de la app que detecte un token inválido
   * 
   * Esto permite una arquitectura de eventos donde múltiples puntos pueden señalizar
   * la expiración sin acoplamiento directo
   */
  useEffect(() => {
    if (typeof window === 'undefined') {
      return; // SSR safety check
    }

    const listener = () => handleTokenExpired();
    window.addEventListener(AUTH_EVENTS.TOKEN_EXPIRED, listener);
    return () => window.removeEventListener(AUTH_EVENTS.TOKEN_EXPIRED, listener);
  }, [handleTokenExpired]);

  /**
   * Memoiza el valor del contexto para evitar re-renders innecesarios
   * Solo se actualiza cuando cambian las dependencias (token, login, logout, etc.)
   */
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