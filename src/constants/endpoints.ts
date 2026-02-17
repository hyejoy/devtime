import { PROXY_BASE } from '@/config/env';
import { ApiRequest } from '@/types/api/helpers';

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
    GETLIST: `${PROXY}/timers`,
    START: `${PROXY}/timers`,
    UPDATE: (id: string) => `${PROXY}/timers/${id}`,
    DELETE: (id: string) => `${PROXY}/timers/${id}`,
    STOP: (id: string) => `${PROXY}/timers/${id}/stop`, // STOP용
  },
  TASK: {
    UPDATE: (studyLogId: string) => `${PROXY}/${studyLogId}/tasks`, //  PUT
  },
  STUDYLOGS: {
    GET: ({ page, limit, date }: { page?: number; limit?: number; date?: string } = {}) => {
      // 1. 기본값 설정 (값이 안 들어올 경우 대비)
      const params = new URLSearchParams();
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      if (date) params.append('date', date);
      // 2. 파라미터가 하나라도 있면 '?'와 함께 리턴, 없으면 기본 경로만 리턴
      const queryString = params.toString();
      return `${PROXY}/study-logs${queryString ? `?${queryString}` : ''}`;
    },
    DETAIL: (studyLogId: string) => `${PROXY}/study-logs/${studyLogId}`,
    DELETE: (studyLogId: string) => `${PROXY}/study-logs/${studyLogId}`,
  },
  STATS: {
    STATS: `${PROXY}/stats`,
  },
  HEATMAP: {
    HEATMAP: `${PROXY}/heatmap`,
  },
  RANKING: {
    GET: ({
      sortBy,
      page = 1,
      limit = 10,
    }: {
      sortBy?: 'total' | 'avg';
      page?: number;
      limit?: number;
    }) => {
      const params = new URLSearchParams();
      if (sortBy) params.append('sortBy', sortBy);
      if (page) params.append('page', String(page));
      if (limit) params.append('limit', String(limit));
      const queryString = params.toString();
      return `${PROXY}/rankings${queryString ? `?${queryString}` : ''}`;
    },
  },
  PROFILE: {
    CREATE: `${PROXY}/profile`, //POST
    GET: `${PROXY}/profile`, //GET
    UPDATE: `${PROXY}/profile`, // PUT
  },
  TECHSTACK: {
    GET: (keyword: string) => {
      const params = new URLSearchParams();
      params.append('keyword', keyword);
      const queryString = params.toString();
      return `${PROXY}/tech-stacks${queryString ? `?keyword=${keyword}` : ''}`;
    }, // GET
    UPDATE: `${PROXY}/tech-stacks`, // POST
  },
  FILE: {
    UPLOAD: `${PROXY}/file/presigned-url`, // POST
  },
} as const;
