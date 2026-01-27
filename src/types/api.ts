import { checkEmail, checkNickname } from '@/services/signup';
import { DuplicateField } from './signup';
import { BasicStructure } from './common';
import { SplitTime } from './timer';

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
  nickName: checkNickname,
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

// {
//     "message": "타이머가 시작되었습니다.",
//     "studyLogId": "d6043963-aebd-4069-8c9f-b0d61452c348",
//     "timerId": "82ca1967-ce23-4511-a00e-0876c0d899c5",
//     "startTime": "2026-01-26T09:26:39.891Z"
// }

//   "success": false,
//   "error": {
//     "message": "로그인이 필요합니다.",
//     "statusCode": 401
//   }
