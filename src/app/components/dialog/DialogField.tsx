'use client';
import classNames from 'classnames/bind';
import { JSX, ReactNode, useEffect } from 'react';
import Button from './Button';
import Content from './Content';
import { useDialog } from './dialogContext';
import styles from './DialogField.module.css';
import Title from './Title';
const cx = classNames.bind(styles);

interface DialogFieldComponent {
  Title: typeof Title;
  Content: typeof Content;
  Button: typeof Button;
  ({ children }: { children: ReactNode }): JSX.Element | null;
}
// Root 컴포넌트
const DialogField = (({ children }: { children: ReactNode }) => {
  const dialog = useDialog();
  if (!dialog || !dialog.modalState) return null;

  // 모달 열릴때 body 스크롤 잠그기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className={cx('overlay')}>
      <div className={cx('dialogContainer')}>
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
