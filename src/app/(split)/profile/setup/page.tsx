'use client';
import ProfileSkipDialog from '@/app/components/dialog/profile/ProfileSkipDialog';
import ProfileSaveButton from '@/app/components/profileSetup/ProfileSaveButton';
import ProfileSetupField from '@/app/components/profileSetup/ProfileSetupField';
import UserFormContainer from '@/app/components/userform/UserFormContainer';
import { useDialogStore } from '@/store/dialogStore';
import { HelperLink } from '@/types/common';

export default function Page() {
  const { isOpen, openDialog } = useDialogStore();
  const SkipSetupDialog: HelperLink = {
    label: '다음에 하시겠어요?',
    text: '건너뛰기',
    onClick: () => {
      openDialog();
    },
  };

  return (
    <>
      <UserFormContainer
        title="프로필 설정"
        body={<ProfileSetupField />}
        footerAction={<ProfileSaveButton />}
        helperLink={SkipSetupDialog}
      />
      {isOpen && <ProfileSkipDialog nextRoute="/timer" />}
    </>
  );
}
