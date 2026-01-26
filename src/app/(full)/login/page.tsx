'use client';
import { useDialog } from '@/app/components/dialog/dialogContext';
import LoginDialog, {
  LoginDialogType,
} from '@/app/components/login/LoginDialog';
import Button from '@/app/components/ui/Button';
import Logo from '@/app/components/ui/Logo';
import TextFieldInput from '@/app/components/ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';
import TextLinkRow from '@/app/components/ui/TextLinkRow';
import { emailRegex, passwordRegex } from '@/constants/regex';
import { MESSAGE } from '@/constants/signupMessage';
import { login } from '@/services/login';
import {
  LoginField,
  LoginHelperMessage,
  LoginInput,
  LoginValid,
} from '@/types/login';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, KeyboardEvent, useState } from 'react';
import styles from './page.module.css';

const cx = classNames.bind(styles);

//  # 헤더 없고 전체 화면 사용하는 페이지
export default function Page() {
  /** hooks */
  const dialog = useDialog();
  const router = useRouter();

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

  const [nextRoute, setNextRoute] = useState<string | null>(null);

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

  const onChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as LoginField;
    const value = e.target.value;
    handleFieldChange(name, value);
  };

  const isLoginButtonDisabled = () => {
    return Object.values(regexValidity).some((v) => !v);
  };

  async function onClickLoginButton() {
    try {
      const res = await fetch('/api/auth/login', {
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

      if (!res.ok) throw new Error('login failed');

      const data = await res.json();

      if (data.isDuplicateLogin) {
        setNextRoute('/timer');
        setDialogType('duplicate-login');
        dialog?.openModal();
        return;
      }

      if (data.isFirstLogin) {
        router.replace('/profile/setup');
      } else {
        router.replace('/timer');
      }
    } catch (err) {
      setDialogType('login-failed');
      dialog?.openModal();
    }
  }

  const onKeyDownEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.code === 'Enter') onClickLoginButton();
  };
  return (
    <div className={cx('page')}>
      <div className={cx('container')}>
        <Image src="/images/bg/signup-bg.png" alt="background" fill priority />
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
                  onChange={onChangeInput}
                  onKeyDown={onKeyDownEnter}
                  feedbackMessage={feedbackMessage[key]}
                  type={key === 'password' ? 'password' : 'text'}
                />
              </React.Fragment>
            );
          })}

          <Button
            disabled={isLoginButtonDisabled()}
            onClick={onClickLoginButton}
          >
            로그인
          </Button>
          <div className={cx('signupLink')}>
            <TextLinkRow label="회원가입" href="/signup" />
          </div>
        </div>
      </div>
      {dialog?.modalState && (
        <LoginDialog dialogType={dialogType} nextRoute={nextRoute} />
      )}
    </div>
  );
}
