import { checkEmail, checkNickname } from '@/services/signup';
import { DuplicateField } from './signup';
import { BasicStructure } from './common';
import { SplitTime } from './timer';
import { ApiRequest, ApiResponse } from '@/types/api/helpers';

export interface RefreshToken {
  success: boolean;
  accessToken: string;
}

/** 회원가입 이메일 닉네임 중복확인 */
export interface SignUpCheckResponse {
  success: boolean;
  available: boolean;
  message: string;
}
// request
export type DuplicateCheckApi = (value: string) => Promise<SignUpCheckResponse>;

export const duplicateCheckApiMap: Record<DuplicateField, DuplicateCheckApi> = {
  id: checkEmail,
  nickname: checkNickname,
};

export interface SignupResponse {
  /** 회원가입 */
  success: boolean;
  message?: string;
  error?: {
    message: string;
    statusCode: number;
  };
}

export interface SignupRequest {
  email: string;
  nickname: string;
  password: string;
  confirmPassword: string;
}

/** 로그인 */
export interface LoginResponse extends SignupResponse {
  accessToken?: string;
  refreshToken?: string;
  isFirstLogin?: true;
  isDuplicateLogin?: true;
}
export type LoginRequest = {
  email: string;
  password: string;
};

/** 타이머 */
// export interface ActiveTimmerResponse extends BasicStructure {}

export interface StartTimeRequest {
  todayGoal: string;
  tasks: string[];
}
export interface StartTimerResponse extends BasicStructure {
  message: string;
  studyLogId: string;
  timerId: string;
  startTime: string;
}

export interface ActiveTimerResponse {
  timerId: string;
  studyLogId: string;
  splitTimes: SplitTime[];
  startTime: string;
  lastUpdateTime: string;
  error?: {
    message: string;
  };
}

export interface WeekdayStudyTime {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
}

export interface StatsResponse {
  consecutiveDays: number; // 연속 공부 일수
  totalStudyTime: number; // 총 공부시간(초)
  averageDailyStudyTime: number; // 일 평균 공부시간(초)
  taskCompletionRate: number; // 목표 달성률(%)
  weekdayStudyTime: WeekdayStudyTime;
}

export interface StudyLogsDetailResponse {
  id: string;
  date: string;
  todayGoal: string;
  studyTime: number;
  tasks: {
    id: string;
    content: string;
    isCompleted: boolean;
  }[];
  review: string;
  completionRate: number;
}

export type ProfileGetResponse = ApiResponse<'/api/profile', 'get'>;

export type ProfilePostRequest = ApiRequest<'/api/profile', 'post'>;

export type TechStackGetResponse = ApiResponse<'/api/tech-stacks', 'get'>['results'];
