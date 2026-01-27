export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  SIGNUP: {
    CHECK_EMAIL_DUPLICATE: '/api/signup/check-email?email=',
    CHECK_NICKNAME_DUPLICATE: '/api/signup/check-nickname?nickname=',
    SIGNUP: '/api/signup',
  },
  TIMER: {
    TIMERS: '/api/timers',
    PUT_TIMERS: '/api/timers/',
  },
} as const;
