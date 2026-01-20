'use client';

import {
  EMAIL_FORMAT_REQUIRED_MESSAGE,
  NICKNAME_REQUIRED_MESSAGE,
  PASSWORD_MISMATCH_MESSAGE,
  PASSWORD_POLICY_MESSAGE,
  SignInput,
  SignValid,
} from '@/app/(auth-form)/signup/page';
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
  onChangeValidation,
}: Props) {
  /* refs */
  const idRef = useRef<HTMLInputElement>(null);
  const nickNameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const checkPasswordRef = useRef<HTMLInputElement>(null);

  // 이미 사용 중인 이메일입니다.
  // 사용 가능한 이메일입니다.
  // 사용 가능한 닉네임 입니다.
  const LABEL_MAP: Record<keyof SignInput, string> = {
    id: '아이디',
    nickName: '닉네임',
    password: '비밀번호',
    checkPassword: '비밀번호 확인',
  };

  const PLACEHOLDER_MAP: Record<keyof SignInput, string> = {
    id: EMAIL_FORMAT_REQUIRED_MESSAGE,
    nickName: NICKNAME_REQUIRED_MESSAGE,
    password: PASSWORD_POLICY_MESSAGE,
    checkPassword: PASSWORD_MISMATCH_MESSAGE,
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
                  value={values[key]}
                  onChangeValue={onChangeValue}
                  // ref={ref}
                  name={key}
                  placeholder={PLACEHOLDER_MAP[key]}
                  type={
                    key === 'password' || key === 'checkPassword'
                      ? 'password'
                      : 'text'
                  }
                  feedbackMessage={feedbackMessages[key]}
                  validState={validState[key]}
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
