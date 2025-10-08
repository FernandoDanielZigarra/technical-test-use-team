import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, AUTH_EVENTS } from '~/config/constants';
import { getAuthToken } from '~/middleware/auth';

/**
 * rawBaseQuery - Configuración base de fetch para RTK Query
 *
 * Responsabilidades:
 * 1. Establecer la baseUrl del API (desde constants)
 * 2. Agregar automáticamente el token JWT a todas las requests
 *
 * prepareHeaders:
 * - Se ejecuta antes de cada request
 * - Obtiene el token del localStorage
 * - Lo agrega al header Authorization en formato "Bearer {token}"
 * - El backend lo extrae con ExtractJwt.fromAuthHeaderAsBearerToken()
 */
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_CONFIG.BASE_URL,
  prepareHeaders: (headers) => {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * baseQueryWithTokenHandling - Wrapper de baseQuery que maneja expiración de tokens
 *
 * Este es un higher-order function que intercepta todas las respuestas de RTK Query.
 *
 * Flujo:
 * 1. Ejecuta la query/mutation original (rawBaseQuery)
 * 2. Inspecciona el resultado
 * 3. Si hay un error 401 Unauthorized:
 *    - Despacha un evento global TOKEN_EXPIRED
 *    - useAuth está escuchando este evento
 *    - useAuth ejecuta clearSession() y muestra el modal de expiración
 * 4. Retorna el resultado original (success o error)
 *
 * ¿Por qué un evento global en lugar de dispatch de Redux?
 * - RTK Query no tiene acceso directo al dispatch del store
 * - Los eventos del DOM son una forma simple de comunicación cross-cutting
 * - useAuth puede estar en cualquier parte del árbol de componentes
 * - Evita acoplamiento con el store de Redux
 *
 * Interceptor pattern:
 * - Todas las APIs (projectsApi, userApi, etc.) usan este baseQuery
 * - Centraliza el manejo de 401 en un solo lugar
 * - Si el backend cambia la forma de señalizar expiración, solo se modifica aquí
 *
 * @param args - Argumentos de la query (url, method, body, etc.)
 * @param api - API de RTK Query (dispatch, getState, extra, etc.)
 * @param extraOptions - Opciones adicionales
 * @returns Resultado de la query con el mismo formato que fetchBaseQuery
 */
export const baseQueryWithTokenHandling: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  // Ejecuta la query original
  const result = await rawBaseQuery(args, api, extraOptions);

  // Interceptor: Verifica si hay un error 401 (Unauthorized)
  if (result.error?.status === 401) {
    // Despacha evento global para notificar la expiración
    // SSR safety check: Verifica que window existe (no estamos en servidor)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_EVENTS.TOKEN_EXPIRED));
    }
  }

  // Retorna el resultado original (con o sin error)
  return result;
};
