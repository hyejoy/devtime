'use client';

import { JSX, ReactNode, useEffect } from 'react';
import Button from './Button';
import Content from './Content';
import Title from './Title';

type DialogType = 'alert' | 'custom';

interface DialogFieldProps {
  children: ReactNode;
  dialogType?: DialogType;
  nextRouter?: string;
}

interface DialogFieldComponent {
  ({ dialogType, nextRouter, children }: DialogFieldProps): JSX.Element | null;
  Title: typeof Title;
  Content: typeof Content;
  Button: typeof Button;
}

const DialogField = (({ dialogType = 'custom', children }: DialogFieldProps) => {
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
