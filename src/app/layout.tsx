'use client';
import AuthSessionProvider from '@/context/AuthContext';
import { ReactNode, useEffect } from 'react';
import { digitalNumber, pretendard } from '../../public/fonts/font';
import './globals.css';
import { useTimerStore } from '@/store/timerStore';
import { useProfileStore } from '@/store/profileStore';
import { usePathname } from 'next/navigation';
import { useDialogStore } from '@/store/dialogStore';
import NextTopLoader from 'nextjs-toploader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DevTime - 개발 학습 시간 관리',
  description: '개발 공부 시간을 측정하고 기록하는 타이머 기반 웹 애플리케이션',
  openGraph: {
    title: 'DevTime',
    description: '나의 성장을 기록하는 시간, DevTime',
    url: 'https://devtime-chi.vercel.app',
    siteName: 'DevTime',
    images: [
      {
        url: 'https://devtime-chi.vercel.app/images/og-image.png', //
        width: 1200,
        height: 630,
        alt: 'DevTime 서비스 미리보기 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevTime',
    description: '나의 성장을 기록하는 시간, DevTime',
    images: ['https://devtime-chi.vercel.app/images/og-image.png'],
  },
};
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
        <NextTopLoader
          color="#4c79ff" // 프로젝트 브랜드 색상
          showSpinner={false} // 우측 상단 스피너 노출 여부
          shadow="0 0 10px #your-brand-color,0 0 5px #your-brand-color"
        />
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
