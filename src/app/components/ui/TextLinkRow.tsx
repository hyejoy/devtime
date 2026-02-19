import Link from 'next/link';
import { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import { RoutePath } from '@/types/common';

interface Props extends ComponentPropsWithoutRef<'div'> {
  question?: string;
  label: string;
  href?: RoutePath;
  isBold?: boolean;
  onClick?: () => void;
}

export default function TextLinkRow({
  question,
  label,
  href,
  isBold = false,
  onClick,
  className,
  ...props
}: Props) {
  // 공통 스타일: 텍스트 컬러, 호버 시 언더라인, 트랜지션
  const linkStyle = clsx(
    'text-brand-primary transition-all hover:underline focus:outline-none',
    isBold ? 'text-base font-bold' : 'text-[14px] font-medium'
  );

  return (
    <div
      className={clsx(
        'text-brand-primary flex items-center justify-center gap-[12px] text-base leading-5 font-normal',
        className
      )}
      {...props}
    >
      {question && <span>{question}</span>}

      {href ? (
        <Link href={href} className={linkStyle}>
          {label}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onClick}
          className={clsx(linkStyle, 'cursor-pointer border-none bg-transparent p-0')}
        >
          {label}
        </button>
      )}
    </div>
  );
}
