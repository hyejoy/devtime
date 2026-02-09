import { useDialogStore } from '@/store/dialog';
import Image from 'next/image';
import { memo, useCallback } from 'react';

interface TableRowProps {
  id: string;
  date: string;
  goal: string;
  studyTime: string;
  totalTasks: number;
  pendingTasks: number;
  achievementRate: string;
  onClickRow: (id: string) => void;
  onChangeDeletId: (id: string) => void;
}

const TableRow = ({
  id,
  date,
  goal,
  studyTime,
  totalTasks,
  pendingTasks,
  achievementRate,
  onClickRow,
  onChangeDeletId,
}: TableRowProps) => {
  const openDialog = useDialogStore((state) => state.openDialog);
  const handleDeleteItem = useCallback(
    (e: React.MouseEvent) => {
      // 버블링 방지
      e.stopPropagation();
      onChangeDeletId(id);
      openDialog();
    },
    [id, onChangeDeletId]
  );

  const handleShowTaskDetail = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openDialog();
      onClickRow(id);
    },
    [id, onClickRow]
  );
  return (
    <tr className="border-b border-gray-200 text-[16px] font-medium text-gray-700 transition-colors hover:bg-gray-50">
      <td className="p-9 pl-10 text-left">{date}</td>
      <td className="text-primary-900 cursor-pointer font-semibold" onClick={handleShowTaskDetail}>
        {goal}
      </td>
      <td className="">{studyTime}</td>
      <td className="p-1">{totalTasks}</td>
      <td className="p-1">{pendingTasks}</td>
      <td className="p-1">{achievementRate}</td>
      <td className="p-4">
        <div className="flex items-baseline justify-end pr-6" onClick={handleDeleteItem}>
          <Image
            src="/images/table/delete.png"
            alt="del"
            width={17.5}
            height={19.5}
            className="cursor-pointer object-contain"
          />
        </div>
      </td>
    </tr>
  );
};

export default memo(TableRow);
