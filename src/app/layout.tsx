'use client';
import AuthSessionProvider from '@/context/AuthContext';
import '@/styles/tokens/colors.css';
import { ReactNode, useEffect } from 'react';
import { digitalNumber, pretendard } from '../../public/fonts/font';
import './globals.css';
import { useTimerStore } from '@/store/timer';

//   fontFamily: 'var(--font-pretendard)',
export default function RootLayout({ children }: { children: ReactNode }) {
  const { isRunning, actions } = useTimerStore();
  const { tick } = actions;
  /** 타이머 엔진 · tick */

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  return (
    /* 1. suppressHydrationWarning 추가: 브라우저 익스텐션으로 인한 HTML 속성 불일치 에러를 방지합니다. */
    <html
      lang="ko"
      className={`${pretendard.variable} ${digitalNumber.variable}`}
      suppressHydrationWarning
    >
      <body className="font-pretendard bg-main-layout relative min-h-screen">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
