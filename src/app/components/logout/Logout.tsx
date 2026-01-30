'use client';

import { API } from '@/constants/endpoints';

export default function Logout() {
  const handleLogout = async () => {
    try {
      // 우리가 만든 Next.js API Route (/api/auth/logout)를 호출합니다.
      const res = await fetch(`${API.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // 브라우저의 쿠키를 Next.js 서버로 전달하기 위해 필수
        credentials: 'include',
      });

      if (res.ok) {
        console.log('로그아웃 성공! 로그인 페이지로 이동합니다.');
        // 쿠키 삭제와 미들웨어 동기화를 위해 href를 사용
        window.location.href = '/login';
      } else {
        // 백엔드 에러가 있더라도 프론트에서 로그아웃 처리를 강제할 수 있음
        const errorData = await res.json().catch(() => ({}));
        console.error('로그아웃 실패 응답:', errorData);

        // 백엔드 세션이 만료되었을 수도 있으니까 실패해도 로그인으로 이동
        window.location.href = '/login';
      }
    } catch (err) {
      console.error('로그아웃 도중 네트워크 에러 발생:', err);
    }
  };

  return (
    <button type="button" onClick={handleLogout} style={{ cursor: 'pointer' }}>
      로그아웃
    </button>
  );
}
