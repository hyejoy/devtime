import { cookies } from 'next/headers';
import { ReactNode, memo } from 'react';
import Header from './Header';

export default async function Layout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('accessToken'); // 서버에서 바로 확인

  return (
    <div className="hide-scrollbar mx-auto flex min-h-screen w-[1200px] flex-col overflow-y-auto">
      <Header isLoggedIn={isLoggedIn} />
      <main className="mx-auto mt-3.5 flex w-full items-center justify-center">{children}</main>
    </div>
  );
}
