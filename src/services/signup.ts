// services/signup.ts
import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { fetcher } from '@/lib/fetcher';
import {
  SignUpCheckResponse,
  SignupRequest,
  SignupResponse,
} from '@/types/api';

/** 이메일 중복확인 */
export const checkEmail = (email: string): Promise<SignUpCheckResponse> => {
  console.log(email);

  return fetcher(
    `${API_BASE_URL}${API.SIGNUP.CHECK_EMAIL_DUPLICATE}${encodeURIComponent(email)}`
  );
};

/** 닉네임 중복확인 */
export const checkNickname = (
  nickname: string
): Promise<SignUpCheckResponse> => {
  return fetcher(
    `${API_BASE_URL}${API.SIGNUP.CHECK_NICKNAME_DUPLICATE}${encodeURIComponent(nickname)}`
  );
};

/** 회원가입 */
export const signup = (data: SignupRequest): Promise<SignupResponse> => {
  return fetcher(`${API_BASE_URL}${API.SIGNUP.SIGNUP}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
