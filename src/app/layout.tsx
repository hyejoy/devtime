import AuthSessionProvider from '@/context/AuthContext';
import '@/styles/tokens/colors.css';
import { ReactNode } from 'react';
import { pretendard } from '../../public/fonts/font';
import './globals.css';

//   fontFamily: 'var(--font-pretendard)',
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* 1. suppressHydrationWarning 추가: 브라우저 익스텐션으로 인한 HTML 속성 불일치 에러를 방지합니다. */
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <body className="font-pretendard bg-main-layout relative min-h-screen">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
