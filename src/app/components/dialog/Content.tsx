import classNames from 'classnames/bind';
import { ReactNode } from 'react';
import styles from './Content.module.css';
const cx = classNames.bind(styles);
interface ContentProps {
  children: ReactNode;
}
export default function Content({ children }: ContentProps) {
  return (
    <>
      <div className={cx('contentText')}>{children}</div>
    </>
  );
}
