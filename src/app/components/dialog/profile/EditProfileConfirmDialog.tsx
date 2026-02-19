import DialogField from '@/app/components/dialog/DialogField';
import Button from '@/app/components/ui/Button';

export default function EditProfileConfirmDialog({
  onClickSaveButton,
}: {
  onClickSaveButton: () => void;
}) {
  return (
    <DialogField>
      <DialogField.Content>변경 사항을 저장하시겠습니까?</DialogField.Content>
      <DialogField.Button align="align-right">
        <Button variant="secondary">취소</Button>
        <Button onClick={onClickSaveButton}>저장하기</Button>
      </DialogField.Button>
    </DialogField>
  );
}
