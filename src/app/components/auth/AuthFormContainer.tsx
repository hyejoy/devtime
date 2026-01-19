'use client';

import { HelperLink } from '@/app/types/common';
import TextLinkRow from '../ui/TextLinkRow';
import styles from './AuthFormContainer.module.css';

export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

type Props = {
  title: string;
  body?: React.ReactNode; // 메인 입력 필드
  extra?: React.ReactNode; // 선택적 보조 영역(약관 / 프로필 이미지)
  footerAction?: React.ReactNode; // Call To Action 버튼
  helperLink?: HelperLink; // 하단 helper 링크
  /** 하단 helper 링크 */
};
export default function AuthFormContainer({
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
