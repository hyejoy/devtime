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

// editingMode => (ICON) 할 일 수정 클릭
export default function TaskItem({
  task,
  editingMode = false,
  changeEditingMode,
}: TaskItemProps) {
  /** state  */
  const status = useTimerStauts();
  const [isEditingTitle, setIsEditingTitle] = useState(false); // 할일 변경모드
  const [content, setContent] = useState(task.content);
  const { updateTaskContent, deletedTask, toggleDone } = useTimerActions();

  useEffect(() => {
    console.log('할일 수정중입니까? : ', isEditingTitle);
  }, [isEditingTitle]);
  const handleDone = () => {
    toggleDone(task.id);
  };

  const changeEditing = () => {
    setIsEditingTitle((prev) => !prev);
  };

  // 휴지통 모양에 설정
  const deleteTask = () => {
    deletedTask(task.id);
  };

  const onChangeContent = (e: ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };

  const onSave = () => {
    updateTaskContent(task.id, content);
  };
  return (
    <>
      <div
        className={cx(
          'goalField',
          `${task.isCompleted ? 'doneGoal' : 'doingGoal'}`
        )}
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
            onChange={onChangeContent}
            onBlur={onSave} // 포커스가 나갈 때 자동 저장
            onKeyDown={(e) => e.key === 'Enter' && onSave()} // 엔터 치면 저장
            autoFocus // 수정 버튼 누르자마자 커서가 바로 가도록 함
          />
        ) : (
          <div className={cx('goal')}>{task.content}</div>
        )}
        <div className={cx('goalButtonField')}>
          {(editingMode && !isEditingTitle) ||
          (!editingMode && !isEditingTitle && status === 'READY') ? (
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
          ) : (
            <></>
          )}
          {isEditingTitle ? (
            <Image
              src="/images/timerDialog/check.png"
              className={cx('iconButton')}
              alt="check"
              width={24}
              height={24}
              onClick={changeEditing}
            />
          ) : (
            <></>
          )}
          {!editingMode && (status === 'DONE' || status === 'RUNNING') ? (
            <CheckBox_
              id={`checkbox${task.id}`}
              className="whiteCheckbox"
              width={36}
              height={36}
              isChecked={task.isCompleted}
              onChange={handleDone}
            />
          ) : (
            <></>
          )}
        </div>
      </div>
    </>
  );
}
