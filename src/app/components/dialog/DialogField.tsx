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

  // 모달 열릴 때 body 스크롤 잠그기
  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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
