// services/signup.ts
import { API } from '@/constants/endpoints';
import { fetcher } from '@/lib/fetcher';
import {
  SignUpCheckResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/api';

/** 이메일 중복확인 */
export const checkEmail = (email: string): Promise<SignUpCheckResponse> => {
  return fetcher(
    `${API.SIGNUP.CHECK_EMAIL_DUPLICATE}${encodeURIComponent(email)}`
  );
};

/** 닉네임 중복확인 */
export const checkNickname = (
  nickname: string
): Promise<SignUpCheckResponse> => {
  return fetcher(
    `${API.SIGNUP.CHECK_NICKNAME_DUPLICATE}${encodeURIComponent(nickname)}`
  );
};

/** 회원가입 */
export const signup = (data: SignupRequest): Promise<SignupResponse> => {
  return fetcher(`${API.SIGNUP.SIGNUP}`, {
    method: 'POST',
    body: data,
  });
};
