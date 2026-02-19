'use client';
import AuthSessionProvider from '@/context/AuthContext';
import '@/styles/tokens/colors.css';
import { ReactNode, useEffect } from 'react';
import { digitalNumber, pretendard } from '../../public/fonts/font';
import './globals.css';
import { useTimerStore } from '@/store/timerStore';
import { useProfileActions, useProfileStore } from '@/store/profileStore';
import { usePathname } from 'next/navigation';
import { useDialogStore } from '@/store/dialogStore';

//   fontFamily: 'var(--font-pretendard)',
export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isRunning, actions } = useTimerStore();
  const { closeDialog } = useDialogStore();
  const profileActions = useProfileStore((state) => state.actions);
  // actions가 로드되었는지 확인 후 구조 분해 할당
  const setDropdownClose = profileActions?.setDropdownClose;
  const { tick } = actions;
  /** 타이머 엔진 · tick */

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  useEffect(() => {
    setDropdownClose(); // 페이지 이동시마다 dropdown , modal close
    closeDialog();
  }, [pathname]);

  return (
    /* suppressHydrationWarning 추가: 브라우저 익스텐션으로 인한 HTML 속성 불일치 에러를 방지합니다. */
    <html
      lang="ko"
      className={`${pretendard.variable} ${digitalNumber.variable} hide-scrollbar`}
      suppressHydrationWarning
    >
      <body className="font-pretendard bg-main-layout relative min-h-screen">
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
