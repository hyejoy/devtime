import '@/styles/tokens/colors.css';
import { ReactNode } from 'react';
import { pretendard } from '../../public/fonts/font';
import { DialogProvider } from './components/dialog/dialogContext';
import './globals.css';
import { TimerProvider } from './(header)/timer/context/TimerContext';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body
        style={{ fontFamily: 'var(--font-pretendard)', position: 'relative' }}
      >
        <TimerProvider>
          <DialogProvider>{children}</DialogProvider>
        </TimerProvider>
      </body>
    </html>
  );
}
