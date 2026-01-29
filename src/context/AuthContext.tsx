'use client';

import { API } from '@/constants/endpoints';
import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // 경로 확인을 위해 추가

export default function AuthSesseionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    // 로그인 페이지에서는 세션 체크를 하지 않음
    if (pathname === '/login') return;

    const initSession = async () => {
      try {
        const res = await fetch('/api/auth/session');

        if (res.ok) {
          console.log('세션 연결 성공');
        } else {
          console.warn('⚠️ 세션이 만료되었습니다. 로그아웃 처리합니다.');

          // 로그아웃 API 호출
          const logoutRes = await fetch(`${API.AUTH.LOGOUT}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          // 결과와 상관없이 클라이언트 쿠키 정리 및 이동
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('세션체크 중 에러 발생', err);
      }
    };

    initSession();
  }, [pathname]); // 경로가 바뀔 때마다 체크하되, /login은 제외됨

  return <>{children}</>;
}
