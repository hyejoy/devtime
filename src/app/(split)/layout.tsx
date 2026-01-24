import { ReactNode } from 'react';
import styles from './layout.module.css';
import Logo from '../components/ui/Logo';
// # 헤더 없고 회원가입처럼 반반 나뉜 페이지
export default function layout({ children }: { children: ReactNode }) {
  return (
    <div className={styles.container}>
      <div className={styles.logoInner}>
        <Logo direction="vertical" width="264" height="200" color="white" />
        <div className={styles.logoTitle}>개발자를 위한 타이머</div>
      </div>

      <div className={styles.signUpForm}>{children}</div>
    </div>
  );
}
