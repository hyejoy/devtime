'use client';
import CheckBox from '@/app/components/ui/CheckBox';
import { TERMS_OF_SERVICE } from '@/constants/termsOfService.ts';
import { ChangeEvent } from 'react';
import styles from './SignupTerms.module.css';
type Props = {
  isChecked: boolean;
  onChangeChecked: (checked: boolean) => void;
};

export default function SignupTerms({ isChecked, onChangeChecked }: Props) {
  const onToggleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    const chekced = e.currentTarget.checked;
    onChangeChecked(chekced);
  };

  return (
    <>
      <div className={styles.termForm}>
        <div>이용약관</div>
        <CheckBox
          id="signup-term-checkbox"
          isChecked={isChecked}
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
