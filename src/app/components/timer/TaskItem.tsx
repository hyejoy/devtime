'use client';

import { useTimerStore } from '@/store/timerStore';
import { Task } from '@/types/timer';
import clsx from 'clsx';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import CheckBox_ from '../ui/CheckBox_';

interface TaskItemProps {
  task: Task;
  editingMode: boolean;
  onChangeEditMode?: (value: boolean) => void;
}

export default function TaskItem({ task, editingMode = false, onChangeEditMode }: TaskItemProps) {
  // zustand
  const { updateTaskContent, deletedTask, toggleDone } = useTimerStore((state) => state.actions);
  const { timerStatus } = useTimerStore();
  // state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [content, setContent] = useState(task.content);

  const pathname = usePathname();

  const isDashboard: boolean = pathname === '/dashboard';
  // 개별 아이템 수정 모드 진입
  const editTask = () => setIsEditingTitle(true);

  // 저장 로직 (수정 완료)
  const onSave = () => {
    updateTaskContent(task.id, content);
    setIsEditingTitle(false);

    if (editingMode) onChangeEditMode!(true);
  };

  // 완료 로직
  const handleDone = () => toggleDone(task.id);

  // 할일 삭제
  const deleteTask = () => {
    deletedTask(task.id);
    if (editingMode) onChangeEditMode!(true);
  };

  return (
    <div
      className={clsx(
        'flex min-h-[4.5rem] items-center rounded-lg leading-loose transition-colors duration-200',
        !isDashboard && task.isCompleted ? 'bg-gray-400' : 'bg-brand-primary',
        isDashboard && task.isCompleted ? 'bg-gray-200' : 'bg-brand-primary'
      )}
    >
      {/* 1. 심볼 아이콘 */}
      <div className="justify-cente mr-2 ml-7 flex h-[50px] w-[50px] shrink-0 items-center">
        <Image
          src={`/images/timerDialog/${task.isCompleted ? 'darkSymbol' : 'symbol'}.png`}
          alt="symbol"
          width={42}
          height={42}
          className="object-cover"
        />
      </div>

      {/* 2. 텍스트 영역 또는 입력창 */}
      <div className="flex flex-1 items-center px-4">
        {isEditingTitle ? (
          <input
            type="text"
            className="w-full rounded bg-transparent py-2 text-[1rem] font-medium text-white outline-none placeholder:text-white/50"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={onSave}
            onKeyDown={(e) => e.key === 'Enter' && onSave()}
            autoFocus
          />
        ) : (
          <div
            className={clsx(
              'min-h-[1.5rem] text-[1rem] font-medium break-all', // 공통 스타일
              isDashboard && task.isCompleted ? 'text-gray-400' : 'text-white' // 상태에 따른 색상 선택
            )}
          >
            {task.content}
          </div>
        )}
      </div>

      {/* 3. 버튼 영역 (편집/삭제/체크박스) */}
      <div className="flex items-center gap-4 pr-5">
        {/* 편집 모드: 연필 & 삭제 아이콘 */}
        {editingMode && !isEditingTitle && timerStatus !== 'READY' && !isDashboard && (
          <div className="flex gap-3">
            <Image
              src="/images/timerDialog/edit.png"
              alt="edit"
              width={17}
              height={17}
              className="cursor-pointer transition-transform active:scale-90"
              onClick={editTask}
            />
            <Image
              src="/images/timerDialog/delete.png"
              alt="delete"
              width={17}
              height={17}
              className="cursor-pointer transition-transform active:scale-90"
              onClick={deleteTask}
            />
          </div>
        )}

        {/* 수정 완료 모드: 체크 아이콘 */}
        {isEditingTitle && (
          <Image
            src="/images/timerDialog/check.png"
            alt="check"
            width={24}
            height={24}
            className="cursor-pointer transition-transform active:scale-90"
            onClick={onSave}
          />
        )}

        {/* 일반 모드: 체크박스 */}
        {!editingMode && !isEditingTitle && timerStatus !== 'READY' && (
          <CheckBox_
            id={`checkbox${task.id}`}
            className="whiteCheckbox"
            width={36}
            height={36}
            isChecked={task.isCompleted}
            onChange={handleDone}
          />
        )}
      </div>
    </div>
  );
}
