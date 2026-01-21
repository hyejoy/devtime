'use client';
import UserFormContainer from '@/app/components/userform/UserFormContainer';
import SignupTerms from '@/app/components/signup/SignupTerms';
import Button from '@/app/components/ui/Button';
import { emailRegex, passwordRegex } from '@/constants/regex';
import { MESSAGE } from '@/constants/signupMessage';
import { HelperLink } from '@/types/common';
import {
  DuplicateField,
  DuplicateState,
  SignField,
  SignInput,
  SignValid,
} from '@/types/signup';
import classNames from 'classnames/bind';
import { useCallback, useEffect, useState } from 'react';
import SignupFields from './../../components/signup/SignupFields';
import styles from './page.module.css';
import { checkEmail, checkNickname } from '@/services/signup';
import { DuplicateCheckApi } from '@/types/api';
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
  const [validCheck, setValidCheck] = useState<
    Pick<SignValid, 'id' | 'password'>
  >({
    id: false,
    password: false,
  });

  /* duplicate check */
  const [duplicateConfirm, setDuplicateConfirm] = useState<DuplicateState>({
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

  /* final validation state */
  const validState = {
    id: validCheck.id && duplicateConfirm.id,
    nickName: duplicateConfirm.nickName,
    password: validCheck.password,
    checkPassword:
      values.checkPassword === values.password &&
      values.checkPassword.length > 0,
  };

  const [isTermChecked, setTermChecked] = useState(false);

  const setDuplicateCheck = (name: DuplicateField, isCheck: boolean) => {
    setDuplicateConfirm((prev) => {
      const valid = {
        ...prev,
        [name]: isCheck,
      };

      return valid;
    });
  };

  /* handlers */
  const handleValid = (name: keyof SignValid, isValid: boolean) => {
    setValidCheck((prev) => {
      const next = { ...prev, [name]: isValid };
      return next;
    });
  };

  const handleValidCheck = (name: keyof SignValid, nextValues: SignInput) => {
    const value = nextValues[name];

    const validators: Record<keyof SignValid, () => boolean> = {
      id: () => emailRegex.test(value),
      nickName: () => Boolean(duplicateConfirm.nickName),
      password: () => passwordRegex.test(value),
      checkPassword: () => Boolean(value) && value === nextValues.password,
    };

    handleValid(name, validators[name]());
  };

  const handleFeedbackMessage = (name: keyof SignInput, value: string) => {
    setFeedbackMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMessage = useCallback(
    (
      name: keyof SignValid,
      values: SignInput,
      isValid: boolean,
      isDuplicateConfirmed: boolean
    ) => {
      const value = values[name];

      switch (name) {
        case 'id': {
          if (!values.id) {
            handleFeedbackMessage('id', MESSAGE.EMAIL_INVALID);
            return;
          }

          if (!isValid) {
            handleFeedbackMessage('id', MESSAGE.EMAIL_INVALID);
            return;
          }

          if (!isDuplicateConfirmed) {
            handleFeedbackMessage('id', MESSAGE.EMAIL_DUPLICATE_REQUIRED);
            return;
          }

          handleFeedbackMessage('id', MESSAGE.EMAIL_AVAILABLE);
          return;
        }

        case 'nickName': {
          if (!value) {
            handleFeedbackMessage(name, MESSAGE.REQUIRED.nickName);
            return;
          }

          if (!isDuplicateConfirmed) {
            handleFeedbackMessage(name, MESSAGE.EMAIL_DUPLICATE_REQUIRED);
            return;
          }

          handleFeedbackMessage(
            name,
            isDuplicateConfirmed
              ? MESSAGE.NICKNAME_AVAILABLE
              : MESSAGE.NICKNAME_DUPLICATED
          );
          return;
        }

        case 'password': {
          if (!value) {
            handleFeedbackMessage(name, MESSAGE.PASSWORD_INVALID);
            return;
          }
          const isValid = passwordRegex.test(values.password);
          handleFeedbackMessage(
            'password',
            isValid ? '' : MESSAGE.PASSWORD_INVALID
          );

          handleFeedbackMessage(
            'checkPassword',
            value === values.checkPassword ? '' : MESSAGE.PASSWORD_MISMATCH
          );
          return;
        }

        case 'checkPassword': {
          if (!value) {
            handleFeedbackMessage(name, '');
            return;
          }

          handleFeedbackMessage(
            name,
            value === values.password ? '' : MESSAGE.PASSWORD_MISMATCH
          );
          return;
        }
      }
    },
    [validCheck, duplicateConfirm, duplicateConfirm]
  );

  const onChangeValue = (name: SignField, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };

      const isEmailValid =
        name === 'id' ? emailRegex.test(next.id) : validCheck.id;

      const isIdDuplicateChecked = name === 'id' ? false : duplicateConfirm.id;

      const isNickDuplicateChecked =
        name === 'nickName' ? false : duplicateConfirm.nickName;

      const isDuplicateChecked =
        name === 'id' ? isIdDuplicateChecked : isNickDuplicateChecked;

      // id, nickname 수정하는 경우 중복확인 false로 변경
      handleValid(name, isEmailValid);
      if (name === 'id' || name === 'nickName') {
        handleDuplicateConfirmValue(name, false);
      }

      // 메시지는 계산값 기준
      handleMessage(name, next, isEmailValid, isDuplicateChecked);

      return next;
    });
  };

  useEffect(() => {}, [values]);
  const onChangeValidation = (name: keyof SignValid, value: boolean) => {
    setValidCheck((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const SignupButton = () => {
    return (
      <div className={cx('bottomButtonField')}>
        <Button>회원가입</Button>
      </div>
    );
  };

  const helperLink: HelperLink = {
    href: '/login',
    label: '회원이신가요?',
    text: '로그인 바로가기',
  };

  const onToggleCheck = () => {
    setTermChecked((prev) => !prev);
  };

  function handleDuplicateConfirmValue(name: DuplicateField, value: boolean) {
    setDuplicateConfirm((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };
      return next;
    });
  }
  //⭐⭐⭐⭐
  const duplicateCheckApiMap: Record<DuplicateField, DuplicateCheckApi> = {
    id: checkEmail,
    nickName: checkNickname,
  };

  async function handleDuplicateCheck(name: DuplicateField) {
    // 이미 중복 확인된 경우 실행하지 않음
    if (duplicateConfirm[name]) return;
    console.log('실행 확인');

    const value = values[name];
    const checkApi = duplicateCheckApiMap[name];

    if (!checkApi) return;

    const { success, available, message } = await checkApi(value);

    if (!success) return;

    setDuplicateCheck(name, available);
    handleFeedbackMessage(name, message);
  }

  return (
    <UserFormContainer
      title="회원가입"
      body={
        <>
          <SignupFields
            values={values}
            isValid={validState}
            isDuplicateConfirm={duplicateConfirm}
            feedbackMessages={feedbackMessage}
            onChangeValue={onChangeValue}
            onChangeValidation={onChangeValidation}
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
