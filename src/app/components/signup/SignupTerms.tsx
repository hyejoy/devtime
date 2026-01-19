'use client';
import CheckBox from '@/app/components/ui/CheckBox';
import { useState, ChangeEvent } from 'react';
import styles from './SignupTerms.module.css';
import { TERMS_OF_SERVICE } from '@/contants/DevTime_terms';

export default function SignupTerms() {
  const [termCheck, setTermCheck] = useState(false);
  const onToggleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    const isCheck = e.currentTarget.checked;
    setTermCheck(isCheck);
  };
  return (
    <>
      <div className={styles.termForm}>
        <div>이용약관</div>
        <CheckBox
          id="signup-term-checkbox"
          checked={termCheck}
          label="동의함"
          onToggleCheck={onToggleCheck}
        />
      </div>
      <div>
        <p className={styles.termContent}>{TERMS_OF_SERVICE}</p>
      </div>
    </>
  );
}
