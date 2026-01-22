// services/signup.ts
import { fetcher } from '@/lib/fetcher';
import { SignUpCheckResponse } from '@/types/api';

export const checkEmail = (email: string): Promise<SignUpCheckResponse> => {
  return fetcher(`/api/signup/check-email?email=${encodeURIComponent(email)}`, {
    method: 'GET',
  });
};

export const checkNickname = (
  nickname: string
): Promise<SignUpCheckResponse> => {
  return fetcher(
    `/api/signup/check-nickname?nickname=${encodeURIComponent(nickname)}`,
    {
      method: 'GET',
    }
  );
};
