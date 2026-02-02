'use client';
import { ReactNode } from 'react';
import Logo from '../components/ui/Logo';
import Image from 'next/image';
import Link from 'next/link';
import Logout from '../components/logout/Logout';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const NAV_ITEMS = [
  { label: '대시보드', href: '/dashboard' },
  { label: '랭킹', href: '/ranking' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    /* .root 스타일 적용 */
    <div className="mx-auto flex min-h-[100dvh] w-[70vw] max-w-[1200px] flex-col">
      {/* .headerField 스타일 적용 */}
      <header className="flex pt-4">
        {/* .logoField 스타일 적용 */}
        <div className="mr-12 cursor-pointer">
          <Link href={'/timer'}>
            <Logo direction="horizontal" height="40px" width="148px" />
          </Link>
        </div>

        {/* .linkField 스타일 적용 */}
        <nav className="flex flex-1 items-center gap-[2.3rem] text-base leading-normal font-semibold">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'transition-all',
                pathname === item.href
                  ? 'text-brand-primary font-bold underline' // .active
                  : 'text-brand-primary font-medium no-underline' // .notActive
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* .profileField 스타일 적용 */}
        <div className="flex w-auto items-center gap-2 whitespace-nowrap">
          <Image
            /* .profileImage 스타일 적용 */
            className="cursor-pointer rounded-full object-cover"
            src="/images/profile/profile.png"
            alt="프로필"
            width={40}
            height={40}
          />
          {/* .profileNickName 스타일 적용 (색상은 CSS 변수 대신 임시로 slate-900 적용) */}
          <div className="text-base leading-normal font-bold text-slate-900">
            닉네임입니다
          </div>
          <Logout />
        </div>
      </header>

      {/* .childrenContainer & .childrenField 스타일 적용 */}
      <main className="mx-auto mt-3.5 flex items-center justify-center">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
