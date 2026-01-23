'use client';
import Button from '@/app/components/ui/Button';
import Logo from '@/app/components/ui/Logo';
import TextFieldInput from '@/app/components/ui/TextFieldInput';
import TextLabel from '@/app/components/ui/TextLabel';
import TextLinkRow from '@/app/components/ui/TextLinkRow';
import { emailRegex, passwordRegex } from '@/constants/regex';
import { MESSAGE } from '@/constants/signupMessage';
import {
  LoginField,
  LoginHelperMessage,
  LoginInput,
  LoginValid,
} from '@/types/login';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, useState } from 'react';
import styles from './page.module.css';
import { login } from '@/services/login';

const cx = classNames.bind(styles);
// 상단바 없고 단독 UI
export default function Page() {
  const router = useRouter();
  const [values, setValues] = useState<LoginInput>({
    email: '',
    password: '',
  });

  /* validation (regex level) */
  const [regexValidity, setRegexValidity] = useState<LoginValid>({
    email: false,
    password: false,
  });

  const [feedbackMessage, setFeedbackMessage] = useState<LoginHelperMessage>({
    email: '',
    password: '',
  });

  const LABEL_MAP: Record<LoginField, string> = {
    email: '아이디',
    password: '비밀번호',
  };

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
      hanleFeedbackMessage(name, fieldValidMap[name]);
      return next;
    });
  };

  const hanleFeedbackMessage = (name: LoginField, isValid: boolean) => {
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
      const res = await login(values);
      // 1. accessToken 메모리에 저장
      // setAccessToken(res.accessToken);
      // 2. 서버가 refreshToken을 cookie에 심어줬다고 가정
      // 3. 분기

      // 중복 로그인 안내 (UI 전용)
      if (res.isDuplicateLogin && res.accessToken) {
        // 먼저 토큰 저장
        document.cookie = `accessToken=${res.accessToken}; path=/`;
        alert('이미 로그인된 계정입니다.');
        router.replace('/timer');
        return;
      }

      // 첫로그인
      if (res.isFirstLogin && res.accessToken) {
        router.replace('/profile');
      } else {
        // 첫로그인 아닌 경우
        router.replace('/timer');
      }
    } catch (err) {

    }
  }

  return (
    <div>
      <div className={cx('container')}>
        <Image src="/images/bg/signup-bg.png" alt="background" fill priority />
      </div>

      {/* 콘텐츠 */}
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
                feedbackMessage={feedbackMessage[key]}
                type={key === 'password' ? 'password' : 'text'}
              />
            </React.Fragment>
          );
        })}

        <Button disabled={isLoginButtonDisabled()} onClick={onClickLoginButton}>
          로그인
        </Button>
        <div className={cx('signupLink')}>
          <TextLinkRow label="회원가입" href="/signup" />
        </div>
      </div>
    </div>
  );
}
