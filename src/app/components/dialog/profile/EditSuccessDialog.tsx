import DialogField from '@/app/components/dialog/DialogField';
import Button from '@/app/components/ui/Button';
import { useDialogStore } from '@/store/dialogStore';

export default function EditSuccessDialog({ onClick }: { onClick: () => void }) {
  return (
    <DialogField>
      <DialogField.Content>변경 사항이 저장되었습니다.</DialogField.Content>
      <DialogField.Button align="align-right">
        <Button nextRoute="/mypage" onClick={onClick}>
          확인
        </Button>
      </DialogField.Button>
    </DialogField>
  );
}
