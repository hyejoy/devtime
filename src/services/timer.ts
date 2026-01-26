import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { fetcher } from '@/lib/fetcher';

export const fetchActiveTimer = () => {
  return fetcher(`${API_BASE_URL}${API.TIMER.GET_ACTIVE_TIMER}`, {
    method: 'GET',
    credentials: 'include', // 인증 쿠키 포함
  });
};
