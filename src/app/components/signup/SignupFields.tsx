'use client';

import Button from '@/app/components/ui/Button';
import TextLabel from '@/app/components/ui/TextLabel';
import {
  DuplicateField,
  DuplicateState,
  SignInput,
  SignValid,
} from '@/types/signup';
import { useRef } from 'react';
import TextFieldInput from '../ui/TextFieldInput';
import styles from './SignupFields.module.css';
import { MESSAGE } from '@/constants/signupMessage';
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

/** buttonLabel */
const buttonLabel: Record<DuplicateField, '중복확인'> = {
  id: '중복확인',
  nickName: '중복확인',
};

type Props = {
  values: SignInput;
  isValid: SignValid;
  isDuplicateConfirm: DuplicateState;
  feedbackMessages: SignInput;
  /* handlers */
  onChangeValue: (name: keyof SignInput, value: string) => void;
  onChangeValidation: (name: keyof SignValid, value: boolean) => void;
  onConfirmDuplicate: (field: DuplicateField) => void;
};

export default function SignupFields({
  values,
  isValid,
  isDuplicateConfirm,
  feedbackMessages,
  // validation,
  onChangeValue,
  onConfirmDuplicate,
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
    id: MESSAGE.REQUIRED.id,
    nickName: MESSAGE.REQUIRED.nickName,
    password: MESSAGE.REQUIRED.password,
    checkPassword: MESSAGE.REQUIRED.checkPassword,
  };

  return (
    <>
      <div className={styles.textFieldContainer}>
        {(Object.keys(values) as Array<keyof SignInput>).map((key) => {
          return (
            <div key={key}>
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
                  isValid={isValid[key]}
                />
                {(key === 'id' || key === 'nickName') && (
                  <Button
                    id={key}
                    variant="secondary"
                    disabled={!values[key] || !isDuplicateConfirm[key]}
                    onClick={() => onConfirmDuplicate(key)}
                  >
                    {buttonLabel[key]}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
