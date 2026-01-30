import AuthSesseionProvider from '@/context/AuthContext';
import '@/styles/tokens/colors.css';
import { ReactNode } from 'react';
import { pretendard } from '../../public/fonts/font';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* 1. suppressHydrationWarning 추가: 브라우저 익스텐션으로 인한 HTML 속성 불일치 에러를 방지합니다. */
    <html lang="ko" className={pretendard.variable} suppressHydrationWarning>
      <body
        style={{
          fontFamily: 'var(--font-pretendard)',
          position: 'relative',
        }}
      >
        {/* 2. Provider 이름에 오타(Sesseion -> Session)가 있다면 context 파일과 함께 확인해 보세요. */}
        <AuthSesseionProvider>{children}</AuthSesseionProvider>
      </body>
    </html>
  );
}
