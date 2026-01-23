// services/signup.ts
import { API } from '@/constants/endpoints';
import { fetcher } from '@/lib/fetcher';

import { LoginInput, LoginResponse } from '@/types/login';
import { NextApiResponse } from 'next';

/** 이메일 중복확인 */
export async function login(payload: LoginInput) {
  return fetcher<NextApiResponse<LoginResponse>>(API.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
