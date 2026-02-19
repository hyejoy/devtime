// services/signup.ts
import { API } from '@/constants/endpoints';
import { SignUpCheckResponse } from '@/types/api';
import { ApiRequest, ApiResponse } from '@/types/api/helpers';

export const signupService = {
  /** 이메일 중복확인 */
  checkEmail: async (email: string): Promise<ApiResponse<'/api/signup/check-email', 'get'>> => {
    const response = await fetch(`${API.SIGNUP.CHECK_EMAIL_DUPLICATE(email)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('이메일 중복 확인 실패');

    const data = await response.json();
    // console.log('아이디 중복 확인 조회 res : ', data);
    return data;
  },

  /** 닉네임 중복확인 */
  checkNickname: async (
    nickname: string
  ): Promise<ApiResponse<'/api/signup/check-nickname', 'get'>> => {
    const response = await fetch(`${API.SIGNUP.CHECK_NICKNAME_DUPLICATE(nickname)}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) throw new Error('닉네임 중복 확인 실패');
    const data = await response.json();
    // console.log('닉네임 중복 확인 조회 res :', data);
    return data;
  },

  /** 회원가입 */

  signup: async (body: ApiRequest<'/api/signup', 'post'>): Promise<SignUpCheckResponse> => {
    const response = await fetch(`${API.SIGNUP.SIGNUP}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) throw new Error('회원가입 실패 ');
    const data = await response.json();
    return data;
  },
};
