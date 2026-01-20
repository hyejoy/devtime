'use client';

import { SignInput, SignValid } from '@/app/(auth-form)/signup/page';
import Button from '@/app/components/ui/Button';
import TextLabel from '@/app/components/ui/TextLabel';
import { useRef } from 'react';
import TextFieldInput from '../ui/TextFieldInput';
import styles from './SignupFields.module.css';
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

/** buttonLabel */
const buttonLabel: any = {
  id: '중복확인',
  nickName: '중복확인',
};

type Props = {
  values: SignInput;
  validState: SignValid;
  feedbackMessages: SignInput;
  /* handlers */
  onChangeValue: (name: keyof SignInput, value: string) => void;
  onChangeValidation: (name: keyof SignValid, value: boolean) => void;
};

export default function SignupFields({
  values,
  validState,
  feedbackMessages,
  // validation,
  onChangeValue,
}: Props) {
  /* refs */
  const inputRefs = {
    id: useRef<HTMLInputElement>(null),
    nickName: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    checkPassword: useRef<HTMLInputElement>(null),
  } as const;

  const LABEL_MAP: Record<keyof SignInput, string> = {
    id: '아이디',
    nickName: '닉네임',
    password: '비밀번호',
    checkPassword: '비밀번호 확인',
  };

  const PLACEHOLDER_MAP: Record<keyof SignInput, string> = {
    id: '이메일 주소 형식으로 입력해 주세요.',
    nickName: '닉네임을 입력해 주세요.',
    password: '비밀번호를 입력해 주세요.',
    checkPassword: '비밀번호를 다시 입력해 주세요.',
  };

  return (
    <>
      <div className={styles.textFieldContainer}>
        {(Object.keys(values) as Array<keyof typeof values>).map((key) => {
          return (
            <>
              <TextLabel name={key} label={LABEL_MAP[key]} />
              <div className={styles.textField}>
                <TextFieldInput
                  ref={inputRefs[key]}
                  value={values[key]}
                  onChange={(e) => onChangeValue(key, e.target.value)}
                  name={key}
                  placeholder={PLACEHOLDER_MAP[key]}
                  type={
                    key === 'password' || key === 'checkPassword'
                      ? 'password'
                      : 'text'
                  }
                  feedbackMessage={feedbackMessages[key]}
                  isValid={validState[key]}
                />
                {buttonLabel[key] && (
                  <Button variant="secondary" disabled={!validState[key]}>
                    {buttonLabel[key]}
                  </Button>
                )}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
}
