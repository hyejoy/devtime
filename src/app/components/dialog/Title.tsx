import classNames from 'classnames/bind';
import { ComponentProps, ReactNode } from 'react';
import styles from './Title.module.css';
const cx = classNames.bind(styles);

type TitleType = 'text' | 'custom';
interface Props extends ComponentProps<'div'> {
  title: string;
  type: TitleType;
  className?: string;
  children?: ReactNode;
}
export default function Title({
  title,
  type = 'text',
  className,
  children,
  ...props
}: Props) {
  return (
    <>
      <div className={cx('title', className)} {...props}>
        {title}
      </div>
      {children}
    </>
  );
}
