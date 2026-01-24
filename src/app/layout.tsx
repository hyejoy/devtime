import '@/styles/tokens/colors.css';
import localFont from 'next/font/local';
import { ReactNode } from 'react';
import { DialogProvider } from './components/dialog/dialogContext';
import './globals.css';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body
        style={{ fontFamily: 'var(--font-pretendard)', position: 'relative' }}
      >
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
