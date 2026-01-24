'use client';

import { HelperLink } from '@/types/common';
import TextLinkRow from '../ui/TextLinkRow';
import styles from './UserFormContainer.module.css';

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
export default function UserFormContainer({
  title,
  body,
  extra,
  footerAction,
  helperLink,
}: Props) {
  return (
    <div className={styles.formInner}>
      <div className={styles.formTitle}>{title}</div>

      {body && <section>{body}</section>}

      {extra && <section className={styles.extra}>{extra}</section>}

      {footerAction && (
        <div className={styles.footerAction}>{footerAction}</div>
      )}

      {helperLink && (
        <TextLinkRow
          question={helperLink.text}
          href={helperLink.href}
          label={helperLink.label}
          isBold={true}
        />
      )}
    </div>
  );
}
