import { API } from '@/constants/endpoints';
import { ApiRequest, ApiResponse } from '@/types/api/helpers';
import { ProfilePostRes, UpdateProfileResType } from '@/types/profile';

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
  create: async (body: ProfilePostRes): Promise<ApiResponse<'/api/profile', 'post'>> => {
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
  update: async (body: {
    nickname: string;
    career: string;
    purpose:
      | string
      | {
          type: '기타';
          detail: string;
        };
    techStacks: string[];
    profileImage: string;
    password: string;
  }): Promise<UpdateProfileResType> => {
    const res = await fetch(`${API.PROFILE.UPDATE}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('회원 정보 수정 실패');
    const data = await res.json();
    return data;
  },

  /** 이미지 업로드 */
  imageUpload: async (file: File) => {
    const res = await fetch(`${API.FILE.UPLOAD}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('이미지 업로드 실패');
    const { presignedUrl, key } = await res.json();
    // 발급받은 URL로 S3에 직접 업로드 (PUT 메서드 사용)

    const uploadRes = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
    });

    if (uploadRes.ok) {
      // 성공 시 스토어의 ProfileImage 상태를 key값으로 업데이트
      // 나중에 /api/profile 요청 보낼 때 key값 사용
      return key;
    }
  },
};
