import { Metadata } from 'next';
import { ReactNode } from 'react';
import { digitalNumber, pretendard } from '../../public/fonts/font';
import ClientLayout from './ClientLayout';
import '@/styles/tokens/colors.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevTime - 개발 학습 시간 관리',
  description: '개발 공부 시간을 측정하고 기록하는 타이머 기반 웹 애플리케이션',
  openGraph: {
    title: 'DevTime',
    description: '나의 성장을 기록하는 시간, DevTime',
    url: 'https://devtime-chi.vercel.app/',
    siteName: 'DevTime',
    images: [
      {
        url: 'https://devtime-chi.vercel.app/images/og-image.png',
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${pretendard.variable} ${digitalNumber.variable} hide-scrollbar`}
      suppressHydrationWarning
    >
      <body className="font-pretendard bg-main-layout relative min-h-screen">
        {/* 모든 클라이언트 로직은 ClientLayout 내부에서 실행됨 */}
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
