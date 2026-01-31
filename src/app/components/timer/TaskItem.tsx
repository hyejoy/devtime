import { Task, useTimerActions, useTasks } from '@/store/timer';
import { useIsRunning } from '@/store/timer';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { ChangeEvent, useRef, useState } from 'react';
import CheckBox_ from '../ui/CheckBox_';
import styles from './TaskItem.module.css';
const cx = classNames.bind(styles);

interface TaskItemProps {
  task: Task;
  editingMode: boolean;
}

export default function TaskItem({ task, editingMode = false }: TaskItemProps) {
  /** state  */
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(task.content);
  const { updateTaskContent, deletedTask, toggleDone } = useTimerActions();

  const handleDone = () => {
    toggleDone(task.id);
  };
  // 연필하고 체크표시에 설정
  const changeEditing = () => {
    setIsEditing((prev) => !prev);
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
        {isEditing ? (
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
          {editingMode && !isEditing ? (
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
          {isEditing ? (
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
          {!isEditing && !editingMode ? (
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
