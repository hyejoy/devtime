// services/signup.ts
import { fetcher } from '@/lib/fetcher';
import {
  SignUpCheckResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/api';

/** 이메일 중복확인 */
export const checkEmail = (email: string): Promise<SignUpCheckResponse> => {
  return fetcher(`/api/signup/check-email?email=${encodeURIComponent(email)}`);
};

/** 닉네임 중복확인 */
export const checkNickname = (
  nickname: string
): Promise<SignUpCheckResponse> => {
  return fetcher(
    `/api/signup/check-nickname?nickname=${encodeURIComponent(nickname)}`
  );
};

/** 회원가입 */
export const signup = (data: SignupRequest): Promise<SignupResponse> => {
  return fetcher('/api/signup', {
    method: 'POST',
    body: data,
  });
};
