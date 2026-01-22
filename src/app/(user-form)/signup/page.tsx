'use client';
import SignupTerms from '@/app/components/signup/SignupTerms';
import Button from '@/app/components/ui/Button';
import UserFormContainer from '@/app/components/userform/UserFormContainer';
import { emailRegex, passwordRegex } from '@/constants/regex';
import { MESSAGE } from '@/constants/signupMessage';
import { checkEmail, checkNickname } from '@/services/signup';
import { DuplicateCheckApi, duplicateCheckApiMap } from '@/types/api';
import { HelperLink } from '@/types/common';
import {
  DuplicateField,
  DuplicateState,
  SignField,
  SignInput,
  SignValid,
} from '@/types/signup';
import classNames from 'classnames/bind';
import { useCallback, useState } from 'react';
import SignupFields from './../../components/signup/SignupFields';
import styles from './page.module.css';
const cx = classNames.bind(styles);

export default function Page() {
  /* input values */
  const [values, setValues] = useState<SignInput>({
    id: '',
    nickName: '',
    password: '',
    checkPassword: '',
  });

  /* validation (regex level) */
  const [regexValidity, setRegexValidity] = useState<
    Pick<SignValid, 'id' | 'password'>
  >({
    id: false,
    password: false,
  });

  /* duplicate check */
  const [duplicateChecked, setDuplicateChecked] = useState<DuplicateState>({
    id: false,
    nickName: false,
  });

  /* feedback messages */
  const [feedbackMessage, setFeedbackMessage] = useState<SignInput>({
    id: '',
    nickName: '',
    password: '',
    checkPassword: '',
  });

  const [isTermChecked, setTermChecked] = useState(false);

  /* final validation state */
  const fieldValidityMap: SignValid = {
    id: regexValidity.id && duplicateChecked.id,
    nickName: duplicateChecked.nickName,
    password: regexValidity.password,
    checkPassword:
      values.checkPassword === values.password &&
      values.checkPassword.length > 0,
  };

  const updateDuplicateStatus = (name: DuplicateField, isCheck: boolean) => {
    setDuplicateChecked((prev) => {
      const valid = {
        ...prev,
        [name]: isCheck,
      };

      return valid;
    });
  };

  /* handlers */
  const updateFieldValidity = (name: keyof SignValid, isValid: boolean) => {
    setRegexValidity((prev) => {
      const next = { ...prev, [name]: isValid };
      return next;
    });
  };

  const updateFieldMessage = (name: keyof SignInput, value: string) => {
    setFeedbackMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function updateDuplicateChecked(name: DuplicateField, value: boolean) {
    setDuplicateChecked((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };
      return next;
    });
  }

  const handleFeedbackMessage = useCallback(
    (
      name: keyof SignValid, //field
      values: SignInput, // input value
      isValid: boolean, // regx (id, pw)
      isDuplicateConfirmed: boolean //중복(id,nick)
    ) => {
      const value = values[name];

      switch (name) {
        case 'id': {
          if (!values.id) {
            updateFieldMessage('id', MESSAGE.EMAIL_INVALID);
            return;
          }

          if (!isValid) {
            updateFieldMessage('id', MESSAGE.EMAIL_INVALID);
            return;
          }

          if (!isDuplicateConfirmed) {
            updateFieldMessage('id', MESSAGE.EMAIL_DUPLICATE_REQUIRED);
            return;
          }

          updateFieldMessage('id', MESSAGE.EMAIL_AVAILABLE);
          return;
        }

        case 'nickName': {
          if (!value) {
            updateFieldMessage(name, MESSAGE.REQUIRED.nickName);
            return;
          }

          if (!isDuplicateConfirmed) {
            updateFieldMessage(name, MESSAGE.EMAIL_DUPLICATE_REQUIRED);
            return;
          }

          updateFieldMessage(
            name,
            isDuplicateConfirmed
              ? MESSAGE.NICKNAME_AVAILABLE
              : MESSAGE.NICKNAME_DUPLICATED
          );
          return;
        }

        case 'password': {
          if (!value) {
            updateFieldMessage(name, MESSAGE.PASSWORD_INVALID);
            return;
          }
          const isValid = passwordRegex.test(values.password);
          updateFieldMessage(
            'password',
            isValid ? '' : MESSAGE.PASSWORD_INVALID
          );

          updateFieldMessage(
            'checkPassword',
            value === values.checkPassword ? '' : MESSAGE.PASSWORD_MISMATCH
          );
          return;
        }

        case 'checkPassword': {
          if (!value || value !== values.password) {
            updateFieldMessage(name, MESSAGE.PASSWORD_MISMATCH);
            return;
          } else {
            updateFieldMessage(name, '');
            return;
          }
        }
      }
    },
    []
  );

  const handleFieldChange = (name: keyof SignInput, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };

      // 1️⃣ 필드별 유효성 계산
      const fieldValidMap: Record<SignField, boolean> = {
        id: emailRegex.test(next.id),
        nickName: true, // 닉네임은 regex 검증 없음 (중복확인만)
        password: passwordRegex.test(next.password),
        checkPassword:
          next.checkPassword.length > 0 && next.checkPassword === next.password,
      };

      const isValid = fieldValidMap[name];

      // 2️⃣ 유효성 반영

      // 3️⃣ 중복확인 상태 리셋
      if (name === 'id' || name === 'nickName') {
        updateDuplicateChecked(name, false);
        handleFeedbackMessage(name, next, isValid, false);
      } else if (name === 'password') {
        // 다른 필드는 중복 확인 상태가 메시지에 영향을 주지 않으므로 true로 설정합니다.
        handleFeedbackMessage(name, next, isValid, true);
      } else {
        handleFeedbackMessage(name, next, true, true);
        updateFieldValidity(name, true);
      }
      updateFieldValidity(name, isValid);
      return next;
    });
  };

  async function handleDuplicateCheck(name: DuplicateField) {
    // 이미 중복 확인된 경우 실행하지 않음
    if (duplicateChecked[name]) return;

    const value = values[name];
    const checkApi = duplicateCheckApiMap[name];

    if (!checkApi) return;

    const { success, available, message } = await checkApi(value);

    if (!success) return;

    updateDuplicateStatus(name, available);
    updateFieldMessage(name, message);
  }

  const onToggleCheck = () => {
    setTermChecked((prev) => !prev);
  };

  const validateAndMarkInvalidFields = () => {
    const invalidFieldKeys = Object.entries(fieldValidityMap)
      .filter(([_, isValid]) => !isValid)
      .map(([key]) => key as keyof SignInput);

    invalidFieldKeys.map((key) => {
      if (key === 'id') {
        handleFeedbackMessage(
          key,
          values,
          regexValidity['id'],
          duplicateChecked['id']
        );
        return;
      }
      if (key === 'nickName') {
        handleFeedbackMessage(key, values, true, duplicateChecked['nickName']);
        return;
      }
      if (key === 'password') {
        handleFeedbackMessage(key, values, regexValidity['password'], true);
        return;
      }
      if (key === 'checkPassword') {
        handleFeedbackMessage(key, values, true, true);
        return;
      }
    });
  };

  const SignupButton = () => {
    /** 회원가입 버튼 */
    async function onSignup() {
      validateAndMarkInvalidFields(); // helper message 설정

      // false 값있는지 확인
      const invalidFields = Object.entries(fieldValidityMap).filter(
        ([_, isValid]) => !isValid
      );
      // false 하나라도 있으면 리턴
      if (invalidFields.length) return;

      // 모든 유효성 통과

      console.log(invalidFields);
    }
    return (
      <div className={cx('bottomButtonField')}>
        <Button onClick={onSignup}>회원가입</Button>
      </div>
    );
  };

  const helperLink: HelperLink = {
    href: '/login',
    label: '회원이신가요?',
    text: '로그인 바로가기',
  };
  return (
    <UserFormContainer
      title="회원가입"
      body={
        <>
          <SignupFields
            values={values}
            fieldValidity={fieldValidityMap}
            isDuplicateCheckedMap={duplicateChecked}
            isRegexValidityMap={regexValidity}
            feedbackMessages={feedbackMessage}
            onChangeValue={handleFieldChange}
            onChangeValidation={updateFieldValidity}
            onConfirmDuplicate={handleDuplicateCheck}
          />
        </>
      }
      extra={
        <SignupTerms
          isChecked={isTermChecked}
          onChangeChecked={onToggleCheck}
        />
      }
      footerAction={<SignupButton />}
      helperLink={helperLink}
    />
  );
}
