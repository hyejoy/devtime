const PROXY = '/api/proxy';

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
    TIMERS: `${PROXY}/timers`, // GET, POST용
    ITEM: (id: string) => `${PROXY}/timers/${id}`, // PUT, DELETE용
    STOP: (id: string) => `${PROXY}/timers/${id}/stop`, // STOP용
  },
} as const;
