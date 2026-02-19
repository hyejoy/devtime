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
import React, { ChangeEvent, useState } from 'react';
import styles from './page.module.css';
import LoginDialog, { LoginDialogType } from '@/app/components/dialog/login/LoginDialog';
import { useDialogStore } from '@/store/dialogStore';
import { useTimerStore } from '@/store/timerStore';
import { RoutePath } from '@/types/common';
import { useRouter } from 'next/navigation';
// 1. LoadingBar 컴포넌트 임포트 (경로는 실제 파일 위치에 맞게 수정하세요)
import LoadingBar from '@/app/components/ui/LoadingBar';

const cx = classNames.bind(styles);

export default function Page() {
  const router = useRouter();
  const { openDialog, isOpen } = useDialogStore();
  const { timerReset } = useTimerStore((state) => state.actions);

  /** state */
  const [values, setValues] = useState<LoginInput>({ email: '', password: '' });
  const [regexValidity, setRegexValidity] = useState<LoginValid>({ email: false, password: false });
  const [feedbackMessage, setFeedbackMessage] = useState<LoginHelperMessage>({
    email: '',
    password: '',
  });
  const [dialogType, setDialogType] = useState<LoginDialogType>(null);
  const [nextRoute, setNextRoute] = useState<RoutePath>();

  // ✅ 2. 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  const LABEL_MAP: Record<LoginField, string> = { email: '아이디', password: '비밀번호' };

  /** handler */
  const handleFieldChange = (name: LoginField, value: string) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      const fieldValidMap: LoginValid = {
        email: emailRegex.test(next.email),
        password: passwordRegex.test(next.password),
      };
      updateRegexValidity(name, fieldValidMap[name]);
      handleFeedbackMessage(name, fieldValidMap[name]);
      return next;
    });
  };

  const handleFeedbackMessage = (name: LoginField, isValid: boolean) => {
    const message =
      name === 'email'
        ? !isValid
          ? MESSAGE.EMAIL_INVALID
          : ''
        : !isValid
          ? MESSAGE.PASSWORD_INVALID
          : '';
    updateFeedbackMessage(name, message);
  };

  const updateRegexValidity = (name: LoginField, value: boolean) => {
    setRegexValidity((prev) => ({ ...prev, [name]: value }));
  };

  const updateFeedbackMessage = (name: LoginField, message: string) => {
    setFeedbackMessage((prev) => ({ ...prev, [name]: message }));
  };

  const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as LoginField;
    const value = e.target.value;
    handleFieldChange(name, value);
  };

  const isLoginButtonDisabled = () => {
    // ✅ 로딩 중일 때도 버튼 비활성화
    return Object.values(regexValidity).some((v) => !v) || isLoading;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoginButtonDisabled()) {
      handleLoginButton();
    }
  };

  async function handleLoginButton() {
    // ✅ 3. 로딩 시작
    setIsLoading(true);

    try {
      const res = await fetch(`${API.AUTH.LOGIN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
        credentials: 'include',
      });
      const data = await res.json();

      if (!res.ok) {
        setDialogType('login-failed');
        openDialog();
        setIsLoading(false); // 실패 시 로딩 종료
        return;
      }

      timerReset();

      if (data.isDuplicateLogin) {
        setDialogType('duplicate-login');
        setNextRoute(data.isFirstLogin ? '/profile/setup' : '/timer');
        openDialog();
        setIsLoading(false); // 중복 로그인 안내 시 로딩 종료
        return;
      }

      // 성공 시 페이지 이동 (이동 전까지 로딩 유지)
      router.replace(data.isFirstLogin ? '/profile/setup' : '/timer');
    } catch (err) {
      console.error('네트워크 에러:', err);
      setDialogType('login-failed');
      openDialog();
      setIsLoading(false); // 에러 발생 시 로딩 종료
    }
  }

  return (
    <div className={cx('page')}>
      {/* ✅ 4. 로딩 중일 때 로딩바 렌더링 */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
          <LoadingBar />
        </div>
      )}

      <div className={cx('container')}>
        <Image src="/images/bg/signup-bg.png" alt="background" fill priority />
        <form onSubmit={handleSubmit}>
          <div className={cx('loginForm')}>
            <div className={cx('logoContainer')}>
              <Logo direction="vertical" width="6rem" height="5.5rem" />
            </div>
            {(Object.keys(values) as Array<LoginField>).map((key) => (
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
                  disabled={isLoading} // 로딩 중 입력 방지
                />
              </React.Fragment>
            ))}

            <Button className="w-full" type="submit" disabled={isLoginButtonDisabled()}>
              {isLoading ? '로그인 중...' : '로그인'}
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
