'use client';

import { JSX, ReactNode, useEffect } from 'react';
import Button from './Button';
import Content from './Content';
import Title from './Title';
import { useDialogType } from '@/store/dialog';

interface DialogFieldComponent {
  Title: typeof Title;
  Content: typeof Content;
  Button: typeof Button;
  ({ children }: { children: ReactNode }): JSX.Element | null;
}

const DialogField = (({ children }: { children: ReactNode }) => {
  const dialogType = useDialogType();

  // useEffect(() => {
  //   // 1. 현재 스크롤바 너비 계산 (윈도우 전체 너비 - 실제 문서 너비)
  //   const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  //   const originalOverflow = window.getComputedStyle(document.body).overflow;
  //   const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;

  //   // 2. 스크롤 잠금 및 패딩 추가 (흔들림 방지 핵심)
  //   document.body.style.overflow = 'hidden';
  //   if (scrollbarWidth > 0) {
  //     document.body.style.paddingRight = `${scrollbarWidth}px`;
  //   }

  //   return () => {
  //     // 3. 원래대로 복구
  //     document.body.style.overflow = originalOverflow;
  //     document.body.style.paddingRight = originalPaddingRight;
  //   };
  // }, []);

  return (
    /* .overlay 역할 */
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 p-5">
      {/* .dialogContainer 역할 + 조건부 클래스 적용 */}
      <div
        className={`flex flex-col rounded-[12px] bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.2)] ${dialogType === 'alert' ? 'w-[348px]' : 'w-auto'} `}
      >
        {/* .childrenContainer 역할 */}
        <div className="h-full min-w-auto">{children}</div>
      </div>
    </div>
  );
}) as DialogFieldComponent;

DialogField.Title = Title;
DialogField.Content = Content;
DialogField.Button = Button;

export default DialogField;
