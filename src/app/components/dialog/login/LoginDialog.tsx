'use client';

import { useRouter } from 'next/navigation';
import DialogField from '../DialogField';
import Button from '../../ui/Button';
import { useDialogActions } from '@/store/dialog';

const LOGIN_DIALOG_COPY = {
  'duplicate-login': {
    title: '중복 로그인이 불가능합니다.',
    content:
      '다른 기기에 중복 로그인 된 상태입니다. [확인] 버튼을 누르면 다른 기기에서 강제 로그아웃되며, 진행중인 타이머가 있다면 기록이 자동 삭제됩니다.',
    buttonLabel: '확인',
  },
  'login-failed': {
    title: '로그인 정보를 다시 확인해 주세요',
    content: null,
    buttonLabel: '확인',
  },
} as const;

export type LoginDialogType = 'duplicate-login' | 'login-failed' | null;

interface Props {
  dialogType: LoginDialogType;
  nextRoute?: string | null;
}

export default function LoginDialog({ dialogType, nextRoute }: Props) {
  const { closeDialog } = useDialogActions();
  const router = useRouter();
  const handleConfirm = () => {
    closeDialog();
    if (nextRoute) {
      router.replace(nextRoute);
    }
  };

  if (!dialogType) return null;

  if (dialogType) {
    const copy = LOGIN_DIALOG_COPY[dialogType];
    return (
      <DialogField>
        <DialogField.Title type="text" title={copy.title} />
        <DialogField.Content>{copy.content}</DialogField.Content>
        <DialogField.Button align="full">
          <Button onClick={handleConfirm}>{copy.buttonLabel}</Button>
        </DialogField.Button>
      </DialogField>
    );
  }
}
