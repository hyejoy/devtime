import { useDialogActions } from '@/store/dialog';
import Image from 'next/image';

interface TableRowProps {
  id: string;
  date: string;
  goal: string;
  studyTime: string;
  totalTasks: number;
  pendingTasks: number;
  achievementRate: string;
  onDelete: (id: string) => void;
  onClickRow: (id: string) => void;
}

export default function TableRow({
  id,
  date,
  goal,
  studyTime,
  totalTasks,
  pendingTasks,
  achievementRate,
  onDelete,
  onClickRow,
}: TableRowProps) {
  // 오타 수정 및 버블링 방지 추가
  const handleDeleteItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('정말로 삭제하시겠습니까?')) {
      // 간단한 확인 절차 추가
      onDelete(id);
    }
  };

  const { openDialog, changeType } = useDialogActions();
  const handleShowTaskDetail = () => {
    onClickRow(id);
    changeType('custom');
    openDialog();
  };
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
        <div className="flex items-baseline justify-end pr-6">
          <Image
            src="/images/table/delete.png"
            alt="del"
            width={17.5}
            height={19.5}
            className="cursor-pointer object-contain"
            onClick={handleShowTaskDetail}
          />
        </div>
      </td>
    </tr>
  );
}
