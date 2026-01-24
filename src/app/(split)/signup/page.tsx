'use client';
import SignupTerms from '@/app/components/signup/SignupTerms';
import Button from '@/app/components/ui/Button';
import UserFormContainer from '@/app/components/userform/UserFormContainer';
import { emailRegex, passwordRegex } from '@/constants/regex';
import { MESSAGE } from '@/constants/signupMessage';
import { signup } from '@/services/signup';
import { duplicateCheckApiMap, SignupRequest } from '@/types/api';
import { HelperLink } from '@/types/common';
import {
  DuplicateField,
  DuplicateState,
  SignField,
  SignInput,
  SignValid,
} from '@/types/signup';
import classNames from 'classnames/bind';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import SignupFields from '../../components/signup/SignupFields';
import styles from './page.module.css';
const cx = classNames.bind(styles);

export default function Page() {
  const router = useRouter();
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
  const [isSubmitted, setIsSubmitted] = useState(false);

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
    [
      MESSAGE,
      passwordRegex,
      updateFieldMessage,
      values.id,
      values.password,
      values.checkPassword,
    ]
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

      // 2️⃣ 유효성 반영
      const isValid = fieldValidMap[name];

      // 3️⃣ 중복확인 상태 리셋
      if (name === 'id' || name === 'nickName') {
        updateDuplicateChecked(name, false);
        handleFeedbackMessage(name, next, isValid, false);
      } else if (name === 'password') {
        // 다른 필드는 중복 확인 상태가 메시지에 영향을 주지 않으므로 true로 설정합니다.
        handleFeedbackMessage(name, next, isValid, true);
      } else {
        // 다른 필드는 중복 확인 상태가 메시지에 영향을 주지 않으므로 true로 설정합니다.
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
      setIsSubmitted(true);
      validateAndMarkInvalidFields(); // helper message 설정

      // false 값있는지 확인
      const invalidFields = Object.entries(fieldValidityMap).filter(
        ([_, isValid]) => !isValid
      );
      // false 하나라도 있으면 리턴
      if (invalidFields.length || !isTermChecked) return;

      const signupInfo: SignupRequest = {
        email: values['id'],
        nickname: values['nickName'],
        password: values['password'],
        confirmPassword: values['checkPassword'],
      };
      // 모든 유효성 통과
      const res = await signup(signupInfo);
      if (res.success) {
        router.replace('/login');
      }
    }

    // 아이디/닉네임 중복 확인, 네 가지 입력 정보의 유효성 검증,
    // 이용 약관의 동의함 체크까지 모두 이루어져야 '회원가입' 버튼이 활성화
    const isSignupEnabled =
      !Object.values(fieldValidityMap).some((v) => !v) && isTermChecked;

    return (
      <div className={cx('bottomButtonField')}>
        <Button onClick={onSignup} disabled={!isSignupEnabled}>
          회원가입
        </Button>
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
          isSubmitted={isSubmitted}
          onChangeChecked={onToggleCheck}
        />
      }
      footerAction={<SignupButton />}
      // TODO:링크에 대한 요구사항 변경시 HelperLink 객체 구조 계속 변해야함
      // 수정할 필요는 없지만 패턴을 개선한다면 어떻게 해볼수 있을지 고민
      helperLink={helperLink}
    />
  );
}

/**
 * TODO:
 * 여기 로직이 많이 긴데,
 * 전반적인 느낌은 SignupFields 사용하면서 하나의 컴포넌트로 모든 케이스를 처리하려다보니
 * 과도하게 추상화된 느낌이 드는 것 같습니다!
 * 오히려 각 케이스마다 작성하면 중복이 일부 있더라도 코드 자체의 복잡도가 낮아서 이해하기 쉬운데,
 * 오히려 동일하지 않은 여러 케이스들의 중복을 줄이고 추상화하는 과정에서 조건 분기가 많아서 이해해야 하는 맥락이 많아 읽기가 어려워요 ㅜㅜ
 * 다른 코멘트에서도 공유드렸지만 토스 펀더멘탈 문서 몇개 더 공유드립니다
 * → https://frontend-fundamentals.com/code-quality/code/examples/submit-button.html
 *   > 이 외에 '맥락 줄이기' 쪽 글들 쭉 읽어보세요!
 * → https://frontend-fundamentals.com/code-quality/code/examples/form-fields.html
 * → https://frontend-fundamentals.com/code-quality/code/examples/use-bottom-sheet.html
 */
