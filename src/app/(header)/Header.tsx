'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Logo from '../components/ui/Logo';
import Logout from '../components/logout/Logout';
import { useTimerStore } from '@/store/timerStore';
import { useProfileStore } from '@/store/profileStore';

const NAV_ITEMS = [
  { label: '대시보드', href: '/dashboard' },
  { label: '랭킹', href: '/ranking' },
];

const LOGIN_ITEMS = [
  { label: '로그인', href: '/login' },
  { label: '회원가입', href: '/signup' },
];

export default function Header({
  isLoggedIn,
  initialNickname,
}: {
  isLoggedIn: boolean;
  initialNickname: string;
}) {
  const { setLastStartTimestamp } = useTimerStore((state) => state.actions);
  const pathname = usePathname();
  const { nickname } = useProfileStore();

  const displayNickname = nickname || initialNickname;

  const linkClick = () => {
    const now = new Date().toISOString();
    setLastStartTimestamp(now);
  };

  return (
    <header className="relative flex pt-4">
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
          <div className="text-base leading-normal font-bold text-slate-900">{displayNickname}</div>
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
      <div className="absolute top-20 flex w-[130px] flex-col bg-red-300 px-3 py-4">
        <div className="w-[106px] bg-yellow-300">마이페이지</div>
        <Logout />
        <div>로그아웃</div>
      </div>
    </header>
  );
}
