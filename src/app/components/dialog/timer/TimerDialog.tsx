'use client';
import { timerService } from '@/services/timerService';
import { useDialogStore } from '@/store/dialogStore';
import { useTimerStore } from '@/store/timerStore';
import classNames from 'classnames/bind';
import clsx from 'clsx';
import Image from 'next/image';
import { ChangeEvent, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import Input from '../../input/Input';
import TaskItem from '../../timer/TaskItem';
import Button from '../../ui/Button';
import DialogField from '../DialogField';
import styles from './TimerDialog.module.css';

const cx = classNames.bind(styles);

interface TimerDialogProps {
  isEditingMode: boolean;
  onChangeEditingMode: (isEditing: boolean) => void;
}

export default function TimerDialog({ isEditingMode, onChangeEditingMode }: TimerDialogProps) {
  /** zustand */
  // useShallow를 사용하여 상태를 가져옵니다.
  const { studyLogId, timerId, timerStatus, todayGoal, tasks, review } = useTimerStore(
    useShallow((state) => ({
      studyLogId: state.studyLogId,
      timerId: state.timerId,
      timerStatus: state.timerStatus,
      isRunning: state.isRunning,
      totalActiveMs: state.totalActiveMs,
      lastStartTimestamp: state.lastStartTimestamp,
      displayTime: state.displayTime,
      todayGoal: state.todayGoal,
      tasks: state.tasks,
      review: state.review,
    }))
  );

  const {
    addTask,
    updateTodayGoal,
    updateReview,
    getSplitTimesForServer,
    cancleCreateTimer,
    cancleEditTasks,
    cancleFinishTimer,
    settingStartTimer,
    settingDoneTimer,
    snapshotTasks,
    timerReset,
  } = useTimerStore((state) => state.actions);

  const { isOpen, closeDialog } = useDialogStore();

  /** state */
  const [newTask, setNewTask] = useState('');

  const isReadyToStart = todayGoal.trim() !== '' && tasks.length !== 0;

  /** handler */
  const handleEditMode = (value: boolean) => {
    onChangeEditingMode(value);
  };

  // 할일 추가
  const handleAddTask = () => {
    if (newTask.trim() === '') return;
    if (newTask.length >= 30) {
      alert('30자 이하로 작성해주세요.');
      return;
    }
    addTask(newTask); // Zustand에 작업 추가
    // onChangeEditingMode(true); // 즉시 편집 모드 활성화 (아이콘 노출)
    setNewTask(''); // 입력창 비우기
  };

  // 할일 목록 전체 업데이트
  const handleSaveTasks = async () => {
    if (tasks.length === 0) return;
    if (isEditingMode) {
      onChangeEditingMode(false);
    }

    const taskList = tasks.map((task) => ({
      content: task.content,
      isCompleted: task.isCompleted,
    }));

    try {
      await timerService.updateTasks(studyLogId, {
        tasks: taskList,
      });
      snapshotTasks(); // tasks -> saveTasks 스냅샷
      if (!isEditingMode) closeDialog();
    } catch (err) {
      console.error('할일 업데이트 실패', err);
    }
  };

  const handleCancelByStatus = () => {
    closeDialog();
    switch (timerStatus) {
      case 'READY':
        cancleCreateTimer();
        break;
      case 'DONE':
        cancleFinishTimer(); // 편집 중이던 내용 버리고 저장된 스냅샷으로 복구
        break;
      case 'PAUSE':
        cancleEditTasks();
        break;
      case 'RUNNING':
        cancleEditTasks();
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
          <Button onClick={handleSaveTasks} variant="secondary">
            {isEditingMode ? '변경 사항 저장하기' : '저장하기'}
          </Button>
        );

      case 'DONE':
        return (
          <Button variant="secondary" disabled={review.length < 15} onClick={onClickDone}>
            공부 완료하기
          </Button>
        );
      default:
        return (
          <Button onClick={handleSaveTasks} variant="secondary">
            {isEditingMode ? '변경 사항 저장하기' : '저장하기'}
          </Button>
        );
    }
  };

  const onChangeNewTask = (e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value);

  // 타이머 시작하기
  const onStartTimer = async () => {
    const taskList: string[] = tasks.map((task) => task.content);
    if (todayGoal.length >= 30) {
      alert('목표를 30자 이하로 작성해주세요.');
      return;
    }
    try {
      const res = await timerService.start({
        todayGoal: todayGoal,
        tasks: taskList,
      });

      const { startTime, studyLogId, timerId } = res;
      settingStartTimer(startTime, studyLogId, timerId);
    } catch (err) {
      console.error('타이머 시작 실패 : ', err);
    }
    closeDialog();
  };

  // 타이머 종료
  const onClickDone = async () => {
    const payload = getSplitTimesForServer();
    if (!payload) return;
    settingDoneTimer();

    try {
      await timerService.stop(timerId, payload);
      timerReset();
      closeDialog();
      alert('학습이 종료 되었습니다.');
    } catch (err) {
      console.error('타이머 종료 실패 : ', err);
    }
  };

  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => updateTodayGoal(e.target.value);
  const onReviewChange = (e: ChangeEvent<HTMLTextAreaElement>) => updateReview(e.target.value);

  // 타이머 시작전일때는 수정,삭제 모드 보여야함
  useEffect(() => {
    if (timerStatus === 'READY') {
      handleEditMode(true);
    }
  }, [timerStatus]);
  if (!isOpen) return null;

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
              value={todayGoal}
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
          {timerStatus !== 'READY' && (
            <div className={cx('listHeader')}>
              <div className={cx('content')}>할 일 목록</div>
              {!isEditingMode && (
                <div className={cx('button')} onClick={() => handleEditMode(true)}>
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
                task={task}
                key={task.id}
                editingMode={isEditingMode}
                onChangeEditMode={handleEditMode}
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
