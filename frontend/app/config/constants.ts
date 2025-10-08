
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
} as const;

export const UI_CONFIG = {
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 3000,
  MODAL_ANIMATION_DURATION: 200,
  MAX_FILE_SIZE: 5 * 1024 * 1024, 
} as const;

export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false,
  ENABLE_ANALYTICS: false,
} as const;

export const AUTH_EVENTS = {
  TOKEN_EXPIRED: 'auth:token-expired',
} as const;
