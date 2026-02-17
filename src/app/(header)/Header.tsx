'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Logo from '../components/ui/Logo';
import { useTimerStore } from '@/store/timerStore';
import { useProfileActions, useProfileStore } from '@/store/profileStore';
import { CircleUser, PlusIcon, User, LogOut } from 'lucide-react';
import Logout from '@/app/components/logout/Logout';
import { useEffect, useRef } from 'react';
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
  const { nickname, isDropdownOpen } = useProfileStore();
  const profileActions = useProfileStore((state) => state.actions);
  const { setDropdownClose, setDropdownOpen } = useProfileActions();
  const displayNickname = nickname || initialNickname;

  // 드롭다운 영역을 감지 ref
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 클릭된 요소가 dropdownRef 내부에 없으면 닫기
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownClose();
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, setDropdownClose]);

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
        <div
          ref={dropdownRef}
          className="relative flex w-auto cursor-pointer items-center gap-2 whitespace-nowrap"
          onClick={setDropdownOpen}
        >
          <div className="relative h-10 w-10 rounded-full border border-gray-200">
            <Image
              className="cursor-pointer rounded-full object-cover"
              src="/images/profile/profile.png"
              alt="프로필"
              fill // 부모 컨테이너를 꽉 채우도록 설정
            />
          </div>
          <div className="text-base leading-normal font-bold text-slate-900">{displayNickname}</div>
          {/* 마이페이지 드롭다운 */}
          {isDropdownOpen && (
            <div
              className={clsx(
                'absolute top-full right-0 z-50 mt-2 flex w-[130px]',
                'flex-col rounded-sm border border-gray-300 bg-white px-3 py-4 shadow-lg'
              )}
            >
              <Link href="/mypage" className="flex w-full py-2 hover:bg-gray-50">
                <button className="flex cursor-pointer items-center gap-3 pb-3 text-gray-600">
                  <CircleUser className="h-4 w-[15px]" /> 마이페이지
                </button>
              </Link>
              <hr className="border-gray-300" />
              <Logout />
            </div>
          )}
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
