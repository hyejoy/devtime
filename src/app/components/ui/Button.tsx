// ui/Button.tsx
'use client';

import classNames from 'classnames/bind';
import { ComponentProps } from 'react';
import styles from './Button.module.css';
import { RoutePath } from '@/types/common';
import Link from 'next/link';
import { useDialogStore } from '@/store/dialogStore'; // 💡 스토어 임포트

interface ButtonProps extends ComponentProps<'button'> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  nextRoute?: RoutePath;
}

const cx = classNames.bind(styles);

export default function Button({
  variant = 'primary',
  nextRoute,
  className = '',
  onClick,
  ...props
}: ButtonProps) {
  const { closeDialog } = useDialogStore();

  // 클릭 시 다이알로그를 닫고, 전달받은 onClick이 있다면 실행
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    closeDialog();
    if (onClick) onClick(e);
  };

  const Content = (
    <button
      className={cx('button', `variant_${variant}`, className)}
      onClick={handleClick}
      {...props}
    />
  );

  if (nextRoute) {
    return <Link href={nextRoute}>{Content}</Link>;
  }

  return Content;
}
