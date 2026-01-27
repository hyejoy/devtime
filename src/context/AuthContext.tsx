'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export default function AuthSesseionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          console.log('세션 연결 성공');
        } else {
          console.warn('⚠️ 세션이 만료되었습니다. 로그아웃 처리합니다.');
          // 1. ⭐ TODO 서버 쿠키 삭제 요청
          //   await fetch('/api/auth/logout', { method: 'POST' });
          // 2. 로그인 페이지로 튕기기 (필요한 경우)
          router.push('/login');
        }
      } catch (err) {
        console.log('세션체크 중 에러 발생', err);
      }
    };

    initSession();
  }, []);

  return <>{children}</>;
}
