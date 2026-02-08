/** --- Table.tsx --- */

'use client';

import { StudyLog } from '@/types/dashboard';
import TableRow from './TableRow';
import { formattedTime } from '@/utils/formatTime';

interface TableProps {
  studyLogs: StudyLog[];
  onClickRow: (id: string) => void;
  onChangeDeletId: (id: string) => void;
}

export default function StudyTable({ studyLogs, onClickRow, onChangeDeletId }: TableProps) {
  return (
    <div className="w-full overflow-hidden rounded-xl bg-white">
      <table className="w-full text-sm">
        <thead className="bg-table-header text-primary-900 border-none border-gray-200">
          <tr className="text-left">
            <th className="w-52 p-4 pl-9 font-bold">날짜</th>
            <th className="w-60 text-left font-bold">목표</th>
            <th className="w-52 font-bold">공부 시간</th>
            <th className="w-24 font-bold">할 일 갯수</th>
            <th className="w-24 font-bold">미완료 할 일</th>
            <th className="w-24 font-bold">달성률</th>
            <th className="w-24 font-bold">&nbsp;</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-600">
          {studyLogs.map((item, index) => (
            <TableRow
              key={`studylog-${item.id}-${index}`}
              id={item.id}
              date={item.date}
              goal={item.todayGoal}
              studyTime={formattedTime(item.studyTime)}
              totalTasks={item.totalTasks}
              pendingTasks={item.incompleteTasks}
              achievementRate={`${item.completionRate}%`}
              onClickRow={onClickRow}
              onChangeDeletId={onChangeDeletId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
