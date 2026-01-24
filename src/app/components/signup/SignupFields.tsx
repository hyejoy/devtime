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

// 💡상수들은 매 렌더링마다 새로 정의될 필요가 없으니 컴포넌트 밖에서 정의
const buttonLabel: Record<DuplicateField, '중복확인'> = {
  id: '중복확인',
  nickName: '중복확인',
};

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
        {/* TODO: 이렇게 한번에 처리하려다보니 추상화 과정에서 고민하신 것도 있는 것 같은데,
        각 인풋의 기능이나 validation 방식이 다양한 경우 무리해서 합치지 않아도 된다고 생각해요!
        values, LABEL_MAP, PLACEHOLDER_MAP 등 별도로 분리된 변수들을 살펴야하는 점,
        103~107, 111 과 같이 어쩔 수 없이 분기 처리하는 부분 때문에 컨텍스트가 나뉘는 점 때문에 가독성 관점에서는 
        오히려 불리한 것 같기도 하고요
        완전 동일한 케이스는 아니지만 이 문서도 참고해보시면 좋아요 
        → https://frontend-fundamentals.com/code-quality/code/examples/login-start-page.html
        */}
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
