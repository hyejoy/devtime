import { PROXY_BASE } from '@/config/env';

const PROXY = PROXY_BASE;

export const API = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    SESSION: '/api/auth/session',
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
  TASK: {
    UPDATE: (studyLogId: string) => `${PROXY}/${studyLogId}/tasks`, //  PUT
  },
  STUDYLOGS: {
    GET_STUDY_LOGS: ({
      page,
      limit,
      date,
    }: { page?: number; limit?: number; date?: string } = {}) => {
      // 1. 기본값 설정 (값이 안 들어올 경우 대비)
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      if (date) params.append('date', date);
      // 2. 파라미터가 하나라도 있으면 '?'와 함께 리턴, 없으면 기본 경로만 리턴
      const queryString = params.toString();
      return `/api/study-logs${queryString ? `?${queryString}` : ''}`;
    },
    GET_STUDY_LOG: (studyLogId: string) => `${PROXY}/study-logs/${studyLogId}`,
    DELETE_STUDY_LOG: (studyLogId: string) =>
      `${PROXY}/study-logs/${studyLogId}`,
  },
  STATS: {
    STATS: `${PROXY}/stats`,
  },
  HEATMAP: {
    HEATMAP: `${PROXY}/heatmap`,
  },
} as const;
