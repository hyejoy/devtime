import { ReactNode } from 'react';
import styles from './layout.module.css';
import classNames from 'classnames/bind';
import Logo from '../components/ui/Logo';
import Image from 'next/image';
import Link from 'next/link';
import Logout from '../components/logout/Logout';
const cx = classNames.bind(styles);

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className={cx('root')}>
      <div className={cx('headerField')}>
        <div className={cx('logoField')}>
          <Link href={'/timer'}>
            <Logo direction="horizontal" height="40px" width="148px" />
          </Link>
        </div>
        <div className={cx('linkField')}>
          <Link href={'/dashboard'}>대시보드</Link>
          <Link href={'/ranking'}>랭킹</Link>
        </div>
        <div className={cx('profileField')}>
          {/* TODO : 테스트, 삭제예정 */}
          <Image
            className={cx('profileImage')}
            src="/images/profile/profile.png"
            alt="프로필"
            width={40}
            height={40}
          />
          <div className={cx('profileNickName')}>닉네임입니다</div>
          <Logout />
        </div>
      </div>
      <div className={cx('childrenContainer')}>
        <div className={cx('childrenField')}>{children}</div>
      </div>
    </div>
  );
}
