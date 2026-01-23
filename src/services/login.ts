import { API } from '@/constants/endpoints';
import { fetcher } from '@/lib/fetcher';
import { LoginRequest, LoginResponse } from '@/types/api';

/** 로그인 */
export const login = (data: LoginRequest): Promise<LoginResponse> => {
  return fetcher(`${API.AUTH.LOGIN}`, {
    method: 'POST',
    body: data,
  });
};
