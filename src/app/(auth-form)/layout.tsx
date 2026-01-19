import { ReactNode } from 'react';
import styles from './layout.module.css';
import Logo from '../components/ui/Logo';
import TextField from '../components/ui/TextField';
// ✅ 좌측 블루 + 우측 컨텐츠 영역 layout
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
