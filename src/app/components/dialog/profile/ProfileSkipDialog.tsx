import DialogField from '@/app/components/dialog/DialogField';
import Button from '@/app/components/ui/Button';
import { useDialogStore } from '@/store/dialogStore';
import { useProfileActions } from '@/store/profileStore';
import { RoutePath } from '@/types/common';
import { useRouter } from 'next/navigation';

interface Props {
  nextRoute: RoutePath;
}

export default function ProfileSkipDialog({ nextRoute }: Props) {
  return (
    <DialogField dialogType="alert">
      <DialogField.Title title="프로필 설정을 건너뛸까요?" />
      <DialogField.Content>
        프로필을 설정하지 않을 경우 일부 기능 사용에 제한이 생길 수 있습니다. 그래도 프로필 설정을
        건너뛰시겠습니까?
      </DialogField.Content>
      <DialogField.Button align="align-right">
        <Button nextRoute={nextRoute}>건너뛰기</Button>
        <Button variant="secondary">취소</Button>
      </DialogField.Button>
    </DialogField>
  );
}
