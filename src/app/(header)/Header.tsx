'use client';

import { useTimerActions } from '@/store/timer';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Logo from '../components/ui/Logo';
import Logout from '../components/logout/Logout';

const NAV_ITEMS = [
  { label: '대시보드', href: '/dashboard' },
  { label: '랭킹', href: '/ranking' },
];

const LOGIN_ITEMS = [
  { label: '로그인', href: '/login' },
  { label: '회원가입', href: '/signup' },
];

export default function Header({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { setLastStartTimestamp } = useTimerActions();
  const pathname = usePathname();

  const linkClick = () => {
    const now = new Date().toISOString();
    setLastStartTimestamp(now);
  };

  return (
    <header className="flex pt-4">
      <div className="mr-12 cursor-pointer">
        <Link href={'/timer'}>
          <Logo direction="horizontal" height="40px" width="148px" />
        </Link>
      </div>

      <nav className="flex flex-1 items-center gap-[2.3rem] text-base leading-normal font-semibold">
        {NAV_ITEMS.map((item) => (
          <Link
            onClick={linkClick}
            key={item.href}
            href={item.href}
            className={clsx(
              'transition-all',
              pathname === item.href
                ? 'text-brand-primary font-bold underline'
                : 'text-brand-primary font-medium no-underline'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 로그인(O) 프로필 영역 노출 */}
      {isLoggedIn && (
        <div className="flex w-auto items-center gap-2 whitespace-nowrap">
          <Image
            className="cursor-pointer rounded-full object-cover"
            src="/images/profile/profile.png"
            alt="프로필"
            width={40}
            height={40}
          />
          <div className="text-base leading-normal font-bold text-slate-900">닉네임입니다</div>
          <Logout />
        </div>
      )}
      {/* 로그인(X) 프로필 영역 노출 */}
      {!isLoggedIn && (
        <div className="flex w-auto items-center gap-2 whitespace-nowrap">
          <nav className="flex flex-1 items-center gap-[2.3rem] text-base leading-normal font-semibold">
            {LOGIN_ITEMS.map((item) => (
              <Link
                onClick={linkClick}
                key={item.href}
                href={item.href}
                className="text-primary-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
