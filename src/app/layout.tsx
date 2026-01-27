import AuthSesseionProvider from '@/context/AuthContext';
import '@/styles/tokens/colors.css';
import { ReactNode } from 'react';
import { pretendard } from '../../public/fonts/font';
import { TimerProvider } from './(header)/timer/context/TimerContext';
import { DialogProvider } from './components/dialog/dialogContext';
import './globals.css';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body
        style={{ fontFamily: 'var(--font-pretendard)', position: 'relative' }}
      >
        <AuthSesseionProvider>
          <TimerProvider>
            <DialogProvider>{children}</DialogProvider>
          </TimerProvider>
        </AuthSesseionProvider>
      </body>
    </html>
  );
}
