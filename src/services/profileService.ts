import { API } from '@/constants/endpoints';
import { ApiRequest, ApiResponse } from '@/types/api/helpers';

export const profileService = {
  /**--- 회원 정보 조회 ---- */
  get: async (): Promise<ApiResponse<'/api/profile', 'get'>> => {
    const res = await fetch(`${API.PROFILE.GET}`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('회원 정보 조회 실패');
    const data = await res.json();
    console.log('👏 회원 정보 조회 : ', data);
    return data;
  },

  /**--- 프로필 생성 ---- */
  create: async (
    body: ApiRequest<'/api/profile', 'post'>
  ): Promise<ApiResponse<'/api/profile', 'post'>> => {
    const res = await fetch(`${API.PROFILE.CREATE}`, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('프로필 생성 실패');
    const data = await res.json();
    console.log('👏 프로필 생성  :', data);
    return data;
  },

  /**--- 회원 정보 수정 ---- */
  update: async (
    body: ApiRequest<'/api/profile', 'put'>
  ): Promise<ApiResponse<'/api/profile', 'put'>> => {
    const res = await fetch(`${API.PROFILE.UPDATE}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('회원 정보 수정 실패');
    const data = await res.json();
    return data;
  },
};
