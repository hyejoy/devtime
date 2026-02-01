import { Task, useTimerActions, useTasks, useTimerStauts } from '@/store/timer';
import { useIsRunning } from '@/store/timer';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import CheckBox_ from '../ui/CheckBox_';
import styles from './TaskItem.module.css';
const cx = classNames.bind(styles);

interface TaskItemProps {
  task: Task;
  editingMode: boolean;
  changeEditingMode: () => void;
}
export default function TaskItem({
  task,
  editingMode = false,
  changeEditingMode, // 부모의 편집 모드를 토글하는 함수
}: TaskItemProps) {
  const status = useTimerStauts();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [content, setContent] = useState(task.content);
  const { updateTaskContent, deletedTask, toggleDone } = useTimerActions();

  // 개별 아이템 연필 클릭
  const changeEditing = () => {
    setIsEditingTitle(true);
  };

  // 개별 아이템 저장 (체크 아이콘 클릭 / 엔터 / 블러)
  const onSave = () => {
    updateTaskContent(task.id, content);
    setIsEditingTitle(false); // 로컬 수정 모드 종료
    if (editingMode) {
      changeEditingMode(); // 부모의 전체 편집 모드를 꺼서 상단 버튼을 복구하고 아이콘을 체크박스로 변경
    }
  };

  const handleDone = () => {
    toggleDone(task.id);
  };

  const deleteTask = () => {
    deletedTask(task.id);
    if (editingMode) changeEditingMode(); // 삭제 후 모드 종료 (선택 사항)
  };

  return (
    <div
      className={cx('goalField', task.isCompleted ? 'doneGoal' : 'doingGoal')}
    >
      <Image
        className={cx('goalSymbol')}
        alt="symbol"
        src="/images/timerDialog/symbol.png"
        width={42}
        height={20}
      />

      {isEditingTitle ? (
        <input
          type="text"
          className={cx('goalInput')}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => e.key === 'Enter' && onSave()}
          autoFocus
        />
      ) : (
        <div className={cx('goal')}>{task.content}</div>
      )}

      <div className={cx('goalButtonField')}>
        {/* 1. 편집 모드(연필/쓰레기통) 아이콘 노출 조건 */}
        {editingMode && !isEditingTitle && (
          <>
            <Image
              src="/images/timerDialog/edit.png"
              className={cx('iconButton')}
              alt="edit"
              width={16.6}
              height={16.6}
              onClick={changeEditing}
            />
            <Image
              src="/images/timerDialog/delete.png"
              className={cx('iconButton')}
              alt="delete"
              width={16.6}
              height={16.6}
              onClick={deleteTask}
            />
          </>
        )}

        {/* 2. 수정 완료(체크) 아이콘 노출 조건 */}
        {isEditingTitle && (
          <Image
            src="/images/timerDialog/check.png"
            className={cx('iconButton')}
            alt="check"
            width={24}
            height={24}
            onClick={onSave} // 여기서 onSave를 호출해야 모드가 풀림
          />
        )}

        {/* 3. 체크박스 노출 조건 (편집 모드가 아닐 때만) */}
        {!editingMode &&
          !isEditingTitle &&
          (status === 'DONE' || status === 'RUNNING') && (
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
