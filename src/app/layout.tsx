import AuthSesseionProvider from '@/context/AuthContext';
import '@/styles/tokens/colors.css';
import { ReactNode } from 'react';
import { pretendard } from '../../public/fonts/font';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body
        style={{ fontFamily: 'var(--font-pretendard)', position: 'relative' }}
      >
        <AuthSesseionProvider>{children}</AuthSesseionProvider>
      </body>
    </html>
  );
}
