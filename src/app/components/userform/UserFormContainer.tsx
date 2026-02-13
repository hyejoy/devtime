'use client';

import { HelperLink } from '@/types/common';
import TextLinkRow from '../ui/TextLinkRow';
import clsx from 'clsx';
/** TODO
 * body와 extra를 나누는 기준이 모호할 수도 있겠다는 생각이 드네요!
 * '선택적' '보조' 라는 것은 무엇을 기준으로 하는지. 필수 입력 여부?
 * 약관에 동의하지 않으면 가입을 못 함 -> 그럼 약관은 필수로 봐야하는 거 아닌가?
 */
type Props = {
  title: string;
  body?: React.ReactNode; // 메인 입력 필드
  extra?: React.ReactNode; // 선택적 보조 영역(약관 / 프로필 이미지)
  footerAction?: React.ReactNode; // Call To Action 버튼
  helperLink?: HelperLink; // 하단 helper 링크
  /** 하단 helper 링크 */
};
export default function UserFormContainer({ title, body, extra, footerAction, helperLink }: Props) {
  return (
    <div
      className={clsx(
        // 1. 크기 및 중앙 정렬: 너비는 100%로 시작하되, 최대 너비(max-w)를 제한함
        'mx-auto h-[780px] w-full max-w-[420px]',
        // 2. 레이아웃: 내부 요소들을 세로로 정렬
        'flex flex-col',
        // 3. 기존 노란 배경 대신 실제 서비스 톤으로 예시 (필요시 bg-yellow-200 유지)
        'box-border bg-yellow-200 transition-all select-none'
      )}
    >
      <div className="text-brand-primary mb-[36px] bg-red-300 text-center text-[1.3rem] leading-8 font-bold">
        {title}
      </div>
      {body && <section>{body}</section>}
      {extra && <section>{extra}</section>}
      {footerAction && <div className="flex flex-col">{footerAction}</div>}
      {helperLink && (
        <TextLinkRow
          question={helperLink.label}
          href={helperLink.href}
          label={helperLink.text}
          isBold={true}
        />
      )}
    </div>
  );
}
