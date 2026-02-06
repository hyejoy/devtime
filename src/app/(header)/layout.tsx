import { cookies } from 'next/headers';
import { ReactNode } from 'react';
import Header from './Header';

export default async function Layout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken'); // 서버에서 바로 확인

  return (
    <div className="mx-auto flex min-h-[100dvh] w-[70vw] flex-col">
      {/* 클라이언트 컴포넌트에 로그인 상태 주입 */}
      <Header isLoggedIn={isLoggedIn} />

      <main className="mx-auto mt-3.5 flex items-center justify-center">
        <div className="min-w-[70vw]">{children}</div>
      </main>
    </div>
  );
}
