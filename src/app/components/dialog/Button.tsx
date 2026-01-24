import classNames from 'classnames/bind';
import { ComponentProps, ReactNode } from 'react';
import styles from './Button.module.css';
const cx = classNames.bind(styles);
interface Props extends ComponentProps<'button'> {
  align: 'full' | 'align-right';
  children: ReactNode;
}
export default function Button({ align, children, ...props }: Props) {
  return <div className={cx(align, 'container')}>{children}</div>;
}
