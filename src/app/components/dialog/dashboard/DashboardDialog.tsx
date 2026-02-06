'use client';
import Button from '@/app/components/ui/Button';
import { useDialogActions } from '@/store/dialog';
import { StudyLogsDetailResponse } from '@/types/api';
import { useEffect } from 'react';
import TaskItem from '../../timer/TaskItem';
import DialogField from '../DialogField';

export default function DashboardDialog({
  detailLog,
  onReset,
}: {
  detailLog: StudyLogsDetailResponse;
  onReset: () => void;
}) {
  console.log('DEATAIL LOG ... ', detailLog);
  const { closeDialog, changeType } = useDialogActions();
  const { todayGoal, tasks, review } = detailLog;

  useEffect(() => {
    changeType('custom');
    return () => changeType('alert');
  }, [changeType]);

  const handleDialogClose = () => {
    onReset(); // detail 정보 초기화
    closeDialog();
  };
  return (
    <DialogField>
      <DialogField.Title>
        <div className="text-primary-900 max mb-9 w-[568px] text-3xl font-bold">{todayGoal}</div>
      </DialogField.Title>
      <DialogField.Content>
        <div className="flex h-[492px] flex-col gap-3 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tasks &&
            tasks.map((task) => <TaskItem editingMode={true} task={task} isOnlyRead={true} />)}
        </div>
        <div className="mt-9 mb-9 flex flex-col gap-2">
          <div className="text-[14px] font-medium text-gray-600">한줄소감</div>
          <div className="w-[568px] text-[20px] leading-normal font-semibold text-gray-800">
            {review}
          </div>
        </div>
      </DialogField.Content>
      <DialogField.Button align="align-right">
        <Button onClick={handleDialogClose}>닫기</Button>
      </DialogField.Button>
    </DialogField>
  );
}
