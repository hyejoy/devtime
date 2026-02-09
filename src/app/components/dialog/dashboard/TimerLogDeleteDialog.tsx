'use client';

import { useDialogStore } from '@/store/dialog';
import DialogField from '../DialogField';
import Button from '@/app/components/ui/Button';

interface TimerLogDeleteDialogProps {
  onDelete: () => Promise<void>;
  onChangeDeleteId: (id: string | null) => void;
}
export default function TimerLogDeleteDialog({
  onDelete,
  onChangeDeleteId,
}: TimerLogDeleteDialogProps) {
  const { closeDialog } = useDialogStore();

  const handleCloseDialog = () => {
    onChangeDeleteId(null);
    closeDialog();
  };
  const handleDelete = async () => {
    await onDelete();
    onChangeDeleteId(null);
    closeDialog();
  };
  return (
    <DialogField dialogType="alert">
      <DialogField.Title title="기록을 삭제하시겠습니까?"></DialogField.Title>
      <DialogField.Content>
        <div className="text-gray-700">
          한 번 삭제된 학습 기록은 다시 복구할 수 없습니다. 그래도 계속 하시겠습니까?
        </div>
      </DialogField.Content>
      <DialogField.Button align="align-right">
        <Button variant="secondary" onClick={handleCloseDialog}>
          취소
        </Button>
        <Button onClick={handleDelete}>삭제하기</Button>
      </DialogField.Button>
    </DialogField>
  );
}
