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

export async function requireAuth(options?: AuthOptions) {
  const token = getToken(options);

  if (!token) {
    throw redirect('/');
  }

  return { token };
}

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

export function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

export function getCurrentUserId(): string | null {
  const token = getAuthToken();
  if (!token) return null;
  
  const payload = decodeJWT(token);
  return payload?.sub || payload?.id || null;
}

export function getCurrentUser(): { id: string; email: string; name: string } | null {
  const token = getAuthToken();
  if (!token) return null;
  
  const payload = decodeJWT(token);
  const userId = payload?.sub || payload?.id;
  
  if (!userId || !payload?.email || !payload?.name) return null;
  
  return {
    id: userId,
    email: payload.email,
    name: payload.name,
  };
}
