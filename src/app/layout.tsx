import './globals.css';
import { ReactNode } from 'react';
import localFont from 'next/font/local';
import '@/styles/tokens/colors.css';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={pretendard.variable}>
      <body style={{ fontFamily: 'var(--font-pretendard)' }}>{children}</body>
    </html>
  );
}
