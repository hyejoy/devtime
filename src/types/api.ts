import { checkEmail, checkNickname } from '@/services/signup';
import { DuplicateField } from './signup';

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
