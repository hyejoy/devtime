import classNames from 'classnames/bind';
import { ComponentProps, ReactNode } from 'react';
import styles from './Title.module.css';
const cx = classNames.bind(styles);

interface Props extends ComponentProps<'div'> {
  title?: string;
  className?: string;
  children?: ReactNode;
}
export default function Title({ title, className, children, ...props }: Props) {
  return (
    <div className={cx('title', className)} {...props}>
      {title}
      {children}
    </div>
  );
}
