'use client';
import AuthFormContainer from '@/app/components/auth/AuthFormContainer';
import Button from '@/app/components/ui/Button';
import { HelperLink } from '@/app/types/common';
import { useCallback, useEffect, useState } from 'react';
import SignupFields from './../../components/signup/SignupFields';
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export type SignInput = {
  id: string;
  nickName: string;
  password: string;
  checkPassword: string;
};

export type SignValid = {
  id: boolean;
  nickName: boolean;
  password: boolean;
  checkPassword: boolean;
};

type DuplicateOptions = Pick<SignValid, 'id' | 'nickName'>;
export default function Page() {
  /* state */
  const [values, setValues] = useState<SignInput>({
    id: '',
    nickName: '',
    password: '',
    checkPassword: '',
  });

  /* feedback Message */
  const [feedbackMessage, setFeedbackMessage] = useState<SignInput>({
    id: '',
    nickName: '',
    password: '',
    checkPassword: '',
  });

  /** 정규식 통과 */
  const [validCheck, setValidCheck] = useState<
    Pick<SignValid, 'id' | 'password'>
  >({
    id: false,
    password: false,
  });

  /** 중복 체크 한번이라도 했는지 확인 */
  const [duplicatCheck, setDuplicateCheck] = useState<DuplicateOptions>({
    id: false,
    nickName: false,
  });

  /** 중복 체크 통과 */
  const [duplicateConfirm, setDuplicateConfirm] = useState<DuplicateOptions>({
    id: false,
    nickName: false,
  });

  /* 모든 과정 통과 */
  const [validState, setValidState] = useState<SignValid>({
    id: false,
    nickName: false,
    password: false,
    checkPassword: false,
  });

  /* handlers */
  const handleValidCheck = (name: keyof SignValid, nextValues: SignInput) => {
    const value = nextValues[name];
    switch (name) {
      case 'id': {
        const emailValid = emailRegex.test(value);
        setValidCheck((prev) => ({ ...prev, id: emailValid }));
        break;
      }
      case 'nickName': {
        // 닉네임 중복체크 통과
        if (duplicateConfirm[name]) {
          setValidState((prev) => ({ ...prev, [name]: true }));
        } else {
          setValidState((prev) => ({ ...prev, [name]: false }));
        }
        break;
      }
      case 'password': {
        const passwordValid = passwordRegex.test(nextValues[name]);
        if (passwordValid) {
          setValidCheck((prev) => ({ ...prev, [name]: true }));
        } else {
          setValidCheck((prev) => ({ ...prev, [name]: false }));
        }
        break;
      }
      case 'checkPassword': {
        if (nextValues[name] && nextValues[name] === nextValues['password']) {
          setValidCheck((prev) => ({ ...prev, [name]: true }));
        } else {
          setValidCheck((prev) => ({ ...prev, [name]: false }));
        }
        break;
      }
    }
  };
  const handleFeedbackMessage = (name: keyof SignInput, value: string) => {
    console.log('handleFeddback params>>>>>>>>>', name, ',', value);

    setFeedbackMessage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  useEffect(() => {
    console.log(feedbackMessage);
  }, [feedbackMessage]);
  const handleMessage = useCallback(
    (name: keyof SignValid, nextValues: SignInput) => {
      switch (name) {
        case 'id': {
          const id = nextValues[name];
          console.log('id: ', id);
          if (id) {
            /** 아이디 입력한 경우 */
            console.log('정규식 통과', validCheck['id']);
            console.log('중복체크 한번이라도 했냐?', duplicatCheck['id']);
            console.log('중복 통과', validCheck['id']);

            /** 정규식 통과한 경우 */
            if (validCheck['id']) {
              /** 중복체크 한번이라도 한 경우 */
              if (duplicatCheck['id']) {
                // 중복 통과
                if (duplicateConfirm['id']) {
                  handleFeedbackMessage(name, '사용 가능한 이메일입니다.');
                } else {
                  // 중복체크 다시 시도
                  handleFeedbackMessage(name, '이미 사용 중인 이메일입니다.');
                }
              } else {
                // 입력하고, 정규식 통과 중복체크 안한 경우
                handleFeedbackMessage(name, '중복을 확인해 주세요.');
              }
            } else {
              /** 정규식 통과 못한 경우 */
              handleFeedbackMessage(name, '이메일 형식으로 작성해 주세요.');
            }
          } else {
            /** 아이디 입력 안한 경우 */
            handleFeedbackMessage(name, '이메일 형식으로 작성해 주세요.');
          }
          break;
        }

        case 'nickName': {
          const nickName = nextValues[name];
          console.log('nickName: ', nickName);

          if (nickName) {
            /** 닉네임 입력한 경우 */
            /** 중복체크 한번이라도 한경우 */
            if (duplicatCheck[name]) {
              // 중복체크 통과
              if (duplicateConfirm[name]) {
                handleFeedbackMessage(name, '사용 가능한 닉네임입니다.');
              } else {
                // 중복체크 미통과 (사용중)
                handleFeedbackMessage(name, '이미 사용 중인 닉네임입니다.');
              }
            } else {
              /** 중복체크 한번도 안한 경우 */
              handleFeedbackMessage(name, '중복을 확인해 주세요.');
            }

            // 중복체크 안한 경우
          } else {
            /** 닉네임 입력 안한 경우 */
            console.log('닉네임 입력 안한 경우');

            handleFeedbackMessage(name, '닉네임을 입력해 주세요.');
          }
          break;
        }

        case 'password': {
          const password = nextValues[name];
          console.log('password: ', password);
          if (password) {
            /** 패스워드 입력 한 경우*/
            // 비밀번호 정규식 통과
            if (validCheck[name]) {
              handleFeedbackMessage(name, '');
            } else {
              // 비밀번호 정규식 미통과
              handleFeedbackMessage(
                name,
                '비밀번호는 8자 이상, 영문과 숫자 조합이어야 합니다.'
              );
            }
          } else {
            /** 패스워드 입력 안한 경우 */
            handleFeedbackMessage(
              name,
              '비밀번호는 8자 이상, 영문과 숫자 조합이어야 합니다.'
            );
            handleFeedbackMessage(
              'checkPassword',
              '비밀번호가 일치하지 않습니다.'
            );
          }
          break;
        }
        case 'checkPassword': {
          const checkPassword = nextValues[name];
          console.log('checkPassword: ', checkPassword);
          console.log('password: ', nextValues['password']);
          if (checkPassword) {
            console.log('채쿠 퍄수워드 쳣어요');

            if (checkPassword !== nextValues['password']) {
              console.log('두개 다르다~~~~~~~~~~');

              handleFeedbackMessage(name, '비밀번호가 일치하지 않습니다.');
            } else {
              handleFeedbackMessage(name, '');
            }
          } else {
            /** 패스워드 입력 안한 경우 */
            handleFeedbackMessage(name, '');
          }
          break;
        }
      }
    },
    [values, validCheck, duplicatCheck, duplicateConfirm]
  );

  const onChangeValue = (name: keyof SignInput, value: string) => {
    // 값바꿔주기
    setValues((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };
      // 유효성 체크 (id, password)
      handleValidCheck(name, next);
      // halper message
      handleMessage(name, next);

      return next;
    });
  };

  const onChangeValidation = (name: keyof SignValid, value: boolean) => {
    setValidCheck((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const SignupButton = () => {
    return <Button>회원가입</Button>;
  };

  const helperLink: HelperLink = {
    href: '/login',
    label: '회원이신가요?',
    text: '로그인 바로가기',
  };

  return (
    <AuthFormContainer
      title="회원가입"
      body={
        <>
          <SignupFields
            values={values}
            validState={validState}
            feedbackMessages={feedbackMessage}
            onChangeValue={onChangeValue}
            onChangeValidation={onChangeValidation}
          />
        </>
      }
      // extra={
      //   <SignupTerms checked={termCheck} onChangeChecked={onChangeTermCheck} />
      // }
      footerAction={<SignupButton />}
      helperLink={helperLink}
    />
  );
}
