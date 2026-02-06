'use client';
import { useDialogActions, useIsDialogOpen } from '@/store/dialog';
import {
  useIsRunning,
  useTaskReview,
  useTasks,
  useTaskTitle,
  useTimerActions,
  useTimerStauts,
} from '@/store/timer';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react';
import Input from '../../input/Input';
import TaskItem from '../../timer/TaskItem';
import Button from '../../ui/Button';
import DialogField from '../DialogField';
import styles from './TimerDialog.module.css';
import clsx from 'clsx';

const cx = classNames.bind(styles);

export default function TimerDialog() {
  /** local state */
  const [editingMode, setEditingMode] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');

  /** zustand state */
  const {
    addTask,
    updateTitle,
    resetGoal,
    resetReview,
    startTimerOnServer,
    updateReview,
    syncTasksWithSaved,
    updateTaskList,
    finishTimerOnServer, // ✅ 최종 종료 액션 추가
  } = useTimerActions();

  const { closeDialog, changeType } = useDialogActions();
  const timerStatus = useTimerStauts();
  const dialogOpen = useIsDialogOpen();
  const title = useTaskTitle();
  const tasks = useTasks();
  const review = useTaskReview();

  const isReadyToStart = title.trim() !== '' && tasks.length !== 0;

  /** handler */
  useEffect(() => {
    // console.log('Tilte ✏️ click? ', editingMode);
  }, [editingMode]);

  const changeEditingMode = (value: boolean) => {
    setEditingMode(value);
  };
  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    addTask(newTask); // Zustand에 작업 추가
    setEditingMode(true); // 즉시 편집 모드 활성화 (아이콘 노출)
    setNewTask(''); // 입력창 비우기
  };

  const saveChanges = () => {
    if (editingMode) {
      setEditingMode(false);
    } else {
      closeDialog();
    }
    updateTaskList();
  };

  const handleCancelByStatus = () => {
    switch (timerStatus) {
      case 'READY':
        resetGoal();
        closeDialog();
        break;
      case 'DONE':
        syncTasksWithSaved(); // 편집 중이던 내용 버리고 저장된 스냅샷으로 복구
        resetReview();
        closeDialog();
        break;
      case 'RUNNING':
        syncTasksWithSaved();
        closeDialog();
        break;
    }
  };

  /** 렌더링용 버튼 컴포넌트 */
  const renderButtons = () => {
    switch (timerStatus) {
      case 'READY':
        return (
          <Button onClick={onStartTimer} variant="secondary" disabled={!isReadyToStart}>
            타이머 시작하기
          </Button>
        );
      case 'RUNNING':
        return (
          <Button onClick={saveChanges} variant="secondary">
            {editingMode ? '변경 사항 저장하기' : '저장하기'}
          </Button>
        );
      case 'DONE':
        return (
          <Button variant="secondary" disabled={review.length < 15} onClick={onClickDone}>
            공부 완료하기
          </Button>
        );
      default:
        return null;
    }
  };

  const onChangeNewTask = (e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value);

  const onStartTimer = async () => {
    await startTimerOnServer();
    closeDialog();
  };
  const onClickDone = async () => {
    finishTimerOnServer();
  };

  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => updateTitle(e.target.value);
  const onReviewChange = (e: ChangeEvent<HTMLTextAreaElement>) => updateReview(e.target.value);

  /** dialog값 고정 */
  useEffect(() => {
    changeType('custom');
    return () => changeType('alert');
  }, [changeType]);

  if (!dialogOpen) return null;

  return (
    <DialogField>
      <DialogField.Title>
        {timerStatus === 'DONE' && (
          <div className={cx('isDoneTitleField')}>
            <div className={cx('isDoneMainTitle')}>오늘도 수고하셨어요!</div>
            <div className={cx('isDoneSubTitle')}>
              완료한 일을 체크하고, 오늘의 학습 회고를 작성해 주세요.
            </div>
          </div>
        )}
        {timerStatus === 'READY' && (
          <>
            <Input.Input
              onChange={onChangeTitle}
              value={title}
              size={'large'}
              placeholder="오늘의 목표"
              className={clsx('text-primary-900')}
            />
            <Input.Label name="todo">할 일 목록</Input.Label>
          </>
        )}
        <div className={clsx('mb-3.5 flex w-full')}>
          <div className={clsx('flex-1')}>
            <Input.Input
              className={clsx('text-gray-300')}
              size={'normal'}
              name="todo"
              placeholder="할 일을 추가해 주세요."
              value={newTask}
              onChange={onChangeNewTask}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              onAdd={handleAddTask}
            />
          </div>
        </div>
      </DialogField.Title>

      <DialogField.Content>
        <div className={cx('goalWrapper')}>
          {(timerStatus === 'RUNNING' || timerStatus === 'DONE') && (
            <div className={cx('listHeader')}>
              <div className={cx('content')}>할 일 목록</div>
              {!editingMode && (
                <div className={cx('button')} onClick={() => changeEditingMode(true)}>
                  <Image
                    src="/images/timerDialog/edit_black.png"
                    className={cx('iconButton')}
                    alt="edit"
                    width={16.6}
                    height={16.6}
                  />
                  <div>할 일 수정</div>
                </div>
              )}
            </div>
          )}
          <div className={cx('goalContainer')}>
            {tasks!.map((task) => (
              <TaskItem
                isOnlyRead={false}
                task={task}
                key={task.id}
                editingMode={editingMode}
                changeEditingMode={changeEditingMode}
              />
            ))}
          </div>
        </div>
        {timerStatus === 'DONE' && (
          <div className={cx('reviewField')}>
            <div className={cx('reviewTitle')}>학습 회고</div>
            <textarea
              placeholder="오늘 학습한 내용을 회고해 보세요(15자 이상 작성 필수)"
              className={cx('reviewContent')}
              onChange={onReviewChange}
            />
          </div>
        )}
      </DialogField.Content>

      <DialogField.Button align="align-right">
        <Button variant="secondary" onClick={handleCancelByStatus}>
          취소
        </Button>
        {renderButtons()}
      </DialogField.Button>
    </DialogField>
  );
}
