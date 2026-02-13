'use client';
import ProfileSetupField from '@/app/components/profileSetup/ProfileSetupField';
import Button from '@/app/components/ui/Button';
import UserFormContainer from '@/app/components/userform/UserFormContainer';
import { HelperLink } from '@/types/common';
import { useCallback } from 'react';

const helperLink: HelperLink = {
  href: '/timer',
  label: '다음에 하시겠어요?',
  text: '건너뛰기',
};
export default function Page() {
  const SaveButton = useCallback(() => {
    return <Button className="">저장하기</Button>;
  }, []);
  return (
    <UserFormContainer
      title="프로필 설정"
      body={<ProfileSetupField />}
      footerAction={<SaveButton />}
      helperLink={helperLink}
    />
  );
}
