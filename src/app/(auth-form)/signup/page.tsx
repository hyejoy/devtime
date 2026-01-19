'use client';
import AuthFormContainer from '@/app/components/auth/AuthFormContainer';
import Button from '@/app/components/ui/Button';
import { HelperLink } from '@/app/types/common';
import SignupFields from './../../components/signup/SignupFields';
import SignupTerms from './../../components/signup/SignupTerms';
import styles from './page.module.css';
export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export default function Page() {
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
      body={<SignupFields />}
      extra={<SignupTerms />}
      footerAction={<SignupButton />}
      helperLink={helperLink}
    />
  );
}
