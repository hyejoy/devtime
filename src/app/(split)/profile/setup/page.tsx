'use client';
import ProfileSaveButton from '@/app/components/profileSetup/ProfileSaveButton';
import ProfileSetupField from '@/app/components/profileSetup/ProfileSetupField';
import UserFormContainer from '@/app/components/userform/UserFormContainer';
import { HelperLink } from '@/types/common';

const helperLink: HelperLink = {
  href: '/timer',
  label: '다음에 하시겠어요?',
  text: '건너뛰기',
};

export default function Page() {
  return (
    <UserFormContainer
      title="프로필 설정"
      body={<ProfileSetupField />}
      footerAction={<ProfileSaveButton />}
      helperLink={helperLink}
    />
  );
}
