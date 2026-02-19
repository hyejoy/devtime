'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import NextTopLoader from 'nextjs-toploader';
import AuthSessionProvider from '@/context/AuthContext';
import { useTimerStore } from '@/store/timerStore';
import { useProfileStore } from '@/store/profileStore';
import { useDialogStore } from '@/store/dialogStore';

export default function ClientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isRunning, actions } = useTimerStore();
  const { closeDialog } = useDialogStore();
  const profileActions = useProfileStore((state) => state.actions);

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

  /** 페이지 이동 시 드롭다운 및 다이얼로그 닫기 */
  useEffect(() => {
    if (setDropdownClose) setDropdownClose();
    closeDialog();
  }, [pathname, setDropdownClose, closeDialog]);

  return (
    <AuthSessionProvider>
      <NextTopLoader
        color="#4c79ff"
        showSpinner={false}
        shadow="0 0 10px #4c79ff,0 0 5px #4c79ff"
      />
      {children}
    </AuthSessionProvider>
  );
}
