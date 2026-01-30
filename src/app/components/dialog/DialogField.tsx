'use client';
import classNames from 'classnames/bind';
import { JSX, ReactNode, useEffect } from 'react';
import Button from './Button';
import Content from './Content';
import styles from './DialogField.module.css';
import Title from './Title';
import { useDialogType } from '@/store/dialog';
const cx = classNames.bind(styles);

interface DialogFieldComponent {
  Title: typeof Title;
  Content: typeof Content;
  Button: typeof Button;
  ({ children }: { children: ReactNode }): JSX.Element | null;
}
// Root 컴포넌트
const DialogField = (({ children }: { children: ReactNode }) => {
  // if (!isModalOpen) return null;

  const dialogType = useDialogType();
  // 모달 열릴때 body 스크롤 잠그기
  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className={cx('overlay')}>
      <div
        className={cx(
          'dialogContainer',
          `${dialogType === 'alert' ? 'alertDialog' : 'customDialog'}`
        )}
      >
        <div className={cx('childrenContainer')}>{children}</div>
      </div>
    </div>
  );
}) as DialogFieldComponent;

// 하위 컴포넌트들을 네임스페이스로 매핑
DialogField.Title = Title;
DialogField.Content = Content;
DialogField.Button = Button;

export default DialogField;
