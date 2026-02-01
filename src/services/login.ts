import { API } from '@/constants/endpoints';
import { LoginRequest } from '@/types/api';

/** 로그인 – Next.js route 호출 */
export const login = (data: LoginRequest) => {
  return fetch(`${API.AUTH.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
    credentials: 'include', // 브라우저가 인증 쿠키(HttpOnly)를 함께 전송하도록 설정⭐
  });
};

/** 엑세스 토큰 갱신 */
export const requestRefreshToken = (refreshToken: string) => {
  return fetch(`${API.AUTH.REFRESH}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(refreshToken),
    credentials: 'include', // 브라우저가 인증 쿠키(HttpOnly)를 함께 전송하도록 설정⭐
  });
};
