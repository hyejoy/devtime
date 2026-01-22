'use client';

import { HelperLink } from '@/types/common';
import TextLinkRow from '../ui/TextLinkRow';
import styles from './UserFormContainer.module.css';

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
        />
      )}
    </div>
  );
}
