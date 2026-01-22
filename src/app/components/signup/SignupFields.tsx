'use client';

import Button from '@/app/components/ui/Button';
import TextLabel from '@/app/components/ui/TextLabel';
import { MESSAGE } from '@/constants/signupMessage';
import {
  DuplicateField,
  DuplicateState,
  SignField,
  SignInput,
  SignValid,
} from '@/types/signup';
import { ChangeEvent, useRef } from 'react';
import TextFieldInput from '../ui/TextFieldInput';
import styles from './SignupFields.module.css';

/** buttonLabel */
const buttonLabel: Record<DuplicateField, '중복확인'> = {
  id: '중복확인',
  nickName: '중복확인',
};

type Props = {
  values: SignInput;
  fieldValidity: SignValid;
  isDuplicateCheckedMap: DuplicateState;
  isRegexValidityMap: Pick<SignValid, 'id' | 'password'>;
  feedbackMessages: SignInput;
  /* handlers */
  onChangeValue: (name: keyof SignInput, value: string) => void;
  onChangeValidation: (name: keyof SignValid, value: boolean) => void;
  onConfirmDuplicate: (field: DuplicateField) => void;
};

export default function SignupFields({
  values,
  fieldValidity,
  isDuplicateCheckedMap,
  isRegexValidityMap,
  feedbackMessages,
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

  const isDuplicateButtonDisabled = (key: 'id' | 'nickName') => {
    if (key === 'id') {
      return (
        !values.id || // 값 없음
        !isRegexValidityMap.id || // ❗ 정규식 실패
        isDuplicateCheckedMap.id // 이미 중복확인 완료
      );
    }

    if (key === 'nickName') {
      return !values.nickName || isDuplicateCheckedMap.nickName;
    }

    return true;
  };

  const onChangeFieldValue = (
    e: ChangeEvent<HTMLInputElement>,
    key: SignField
  ) => {
    const value = e.target.value;
    onChangeValue(key, value);
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
                  onChange={(e) => onChangeFieldValue(e, key)}
                  name={key}
                  placeholder={PLACEHOLDER_MAP[key]}
                  type={
                    key === 'password' || key === 'checkPassword'
                      ? 'password'
                      : 'text'
                  }
                  feedbackMessage={feedbackMessages[key]}
                  isValid={fieldValidity[key]}
                />
                {(key === 'id' || key === 'nickName') && (
                  <Button
                    id={key}
                    variant="secondary"
                    disabled={isDuplicateButtonDisabled(key)}
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
