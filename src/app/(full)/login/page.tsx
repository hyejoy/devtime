'use client';
import Button from '@/app/components/ui/Button';
import Logo from '@/app/components/ui/Logo';
import TextFieldInput from '@/app/components/ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';
import TextLinkRow from '@/app/components/ui/TextLinkRow';
import { API } from '@/constants/endpoints';
import { emailRegex, passwordRegex } from '@/constants/regex';
import { MESSAGE } from '@/constants/signupMessage';
import { LoginField, LoginHelperMessage, LoginInput, LoginValid } from '@/types/login';
import classNames from 'classnames/bind';
import Image from 'next/image';
import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import styles from './page.module.css';
import LoginDialog, { LoginDialogType } from '@/app/components/dialog/login/LoginDialog';
import { useDialogStore } from '@/store/dialogStore';
import { useTimerStore } from '@/store/timerStore';
import { RoutePath } from '@/types/common';
import { useRouter } from 'next/navigation';

const cx = classNames.bind(styles);

//  # 헤더 없고 전체 화면 사용하는 페이지
export default function Page() {
  /** zustand */
  const router = useRouter();
  const { openDialog, closeDialog, isOpen } = useDialogStore();
  const { timerReset } = useTimerStore((state) => state.actions);
  /** state */
  const [values, setValues] = useState<LoginInput>({
    email: '',
    password: '',
  });
  const [regexValidity, setRegexValidity] = useState<LoginValid>({
    email: false,
    password: false,
  });
  const [feedbackMessage, setFeedbackMessage] = useState<LoginHelperMessage>({
    email: '',
    password: '',
  });

  const [dialogType, setDialogType] = useState<LoginDialogType>(null);

  const [nextRoute, setNextRoute] = useState<RoutePath>();

  /**constants · maps */
  const LABEL_MAP: Record<LoginField, string> = {
    email: '아이디',
    password: '비밀번호',
  };

  /** handler */
  const handleFieldChange = (name: LoginField, value: string) => {
    setValues((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      const fieldValidMap: LoginValid = {
        email: emailRegex.test(next.email),
        password: passwordRegex.test(next.password),
      };

      // 유효성 검증
      updateRegexValidity(name, fieldValidMap[name]);
      handleFeedbackMessage(name, fieldValidMap[name]);
      return next;
    });
  };

  const handleFeedbackMessage = (name: LoginField, isValid: boolean) => {
    if (name === 'email') {
      const message = !isValid ? MESSAGE.EMAIL_INVALID : '';
      updateFeedbackMessage(name, message);
      return;
    }
    if (name == 'password') {
      const message = !isValid ? MESSAGE.PASSWORD_INVALID : '';
      updateFeedbackMessage(name, message);
      return;
    }
  };

  const updateRegexValidity = (name: LoginField, value: boolean) => {
    setRegexValidity((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const updateFeedbackMessage = (name: LoginField, message: string) => {
    setFeedbackMessage((prev) => {
      return { ...prev, [name]: message };
    });
    return;
  };

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as LoginField;
    const value = e.target.value;
    handleFieldChange(name, value);
  };

  const isLoginButtonDisabled = () => {
    return Object.values(regexValidity).some((v) => !v);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // 페이지 새로고침 방지
    if (!isLoginButtonDisabled()) {
      handleLoginButton();
    }
  };

  async function handleLoginButton() {
    try {
      const res = await fetch(`${API.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        console.warn('로그인 실패:', data.error?.message || '알 수 없는 에러');
        setDialogType('login-failed');
        openDialog();
        return;
      }

      if (res.ok) {
        timerReset();

        // 중복 로그인 체크
        if (data.isDuplicateLogin) {
          setDialogType('duplicate-login');
          setNextRoute(data.isFirstLogin ? '/profile/setup' : '/timer');
          openDialog();
          return;
        }

        // 첫 로그인인 경우
        if (data.isFirstLogin) {
          router.replace('/profile/setup');
        } else {
          router.replace('/timer');
        }
      }
    } catch (err) {
      // 네트워크 장애 등 예상치 못한 에러 발생 시
      console.error('네트워크 에러:', err);
      setDialogType('login-failed');
      openDialog();
    }
  }

  return (
    <div className={cx('page')}>
      <div className={cx('container')}>
        <Image src="/images/bg/signup-bg.png" alt="background" fill priority />
        <form onSubmit={handleSubmit}>
          <div className={cx('loginForm')}>
            <div className={cx('logoContainer')}>
              <Logo direction="vertical" width="6rem" height="5.5rem" />
            </div>
            {(Object.keys(values) as Array<LoginField>).map((key) => {
              return (
                <React.Fragment key={key}>
                  <TextLabel label={LABEL_MAP[key]} name={key} />
                  <TextFieldInput
                    id={key}
                    name={key}
                    value={values[key]}
                    placeholder={MESSAGE.LOGIN[key]}
                    onChange={handleChangeInput}
                    feedbackMessage={feedbackMessage[key]}
                    type={key === 'password' ? 'password' : 'text'}
                    hasFeedback={true}
                  />
                </React.Fragment>
              );
            })}

            <Button
              className="w-full"
              type="submit"
              disabled={isLoginButtonDisabled()}
              onClick={handleLoginButton}
            >
              로그인
            </Button>
            <div className={cx('signupLink')}>
              <TextLinkRow label="회원가입" href="/signup" />
            </div>
          </div>
        </form>
      </div>
      {isOpen && <LoginDialog dialogType={dialogType} nextRoute={nextRoute} alignButton="full" />}
    </div>
  );
}
