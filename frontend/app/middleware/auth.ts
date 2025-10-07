import { redirect } from 'react-router';

const TOKEN_KEY = 'token';

type AuthOptions = {
  readonly request?: Request;
};

function getTokenFromCookies(cookieHeader: string | undefined | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const tokens = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .filter((cookie) => cookie.startsWith(`${TOKEN_KEY}=`));

  if (!tokens.length) {
    return null;
  }

  const [, value] = tokens[0].split('=');
  return value ? decodeURIComponent(value) : null;
}

function getToken(options?: AuthOptions): string | null {
  const { request } = options ?? {};

  if (request) {
    const cookieToken = getTokenFromCookies(request.headers.get('cookie'));
    if (cookieToken) {
      return cookieToken;
    }

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
  }

  if (typeof document !== 'undefined') {
    const cookieToken = getTokenFromCookies(document.cookie);
    if (cookieToken) {
      return cookieToken;
    }
  }

  if (typeof window !== 'undefined') {
    const storageToken = window.localStorage.getItem(TOKEN_KEY);
    if (storageToken) {
      return storageToken;
    }
  }

  return null;
}

function setTokenCookie(token: string | null): void {
  if (typeof document === 'undefined') {
    return;
  }

  if (token) {
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
  } else {
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

export function persistAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
  setTokenCookie(token);
}

export function clearAuthTokenStorage(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
  }
  setTokenCookie(null);
}

/**
 * Middleware de autenticación para proteger rutas
 */
export async function requireAuth(options?: AuthOptions) {
  const token = getToken(options);

  if (!token) {
    throw redirect('/');
  }

  return { token };
}

/**
 * Middleware para rutas públicas (login/register)
 */
export async function redirectIfAuthenticated(options?: AuthOptions) {
  const token = getToken(options);

  if (token) {
    throw redirect('/projects');
  }

  return null;
}

export function getAuthToken(options?: AuthOptions): string | null {
  return getToken(options);
}
