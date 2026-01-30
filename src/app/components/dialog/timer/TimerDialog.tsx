'use client';
import { useDialogActions, useIsDialogOpen } from '@/store/dialog';
import {
  useTaskActions,
  useTaskReview,
  useTasks,
  useTaskTitle,
} from '@/store/task';
import classNames from 'classnames/bind';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import Input from '../../input/Input';
import TaskItem from '../../timer/TaskItem';
import Button from '../../ui/Button';
import DialogField from '../DialogField';
import styles from './TimerDialog.module.css';
import { useIsRunning, useTimerActions, useTimerDone } from '@/store/timer';
import Image from 'next/image';
const cx = classNames.bind(styles);

interface TimerDialogProps {
  onStartTimer: () => Promise<void>;
  onFinishTimer: () => Promise<void>;
  onSaveTasks: () => Promise<void>;
}

export default function TimerDialog({
  onStartTimer,
  onFinishTimer,
  onSaveTasks,
}: TimerDialogProps) {
  /** state */
  const [editingMode, setEditingMode] = useState(false);
  const [newTask, setNewTask] = useState('');
  /** zustand */
  const { closeDialog, changeType } = useDialogActions();
  const dialogOpen = useIsDialogOpen();
  const title = useTaskTitle();
  const tasks = useTasks();
  const isRunning = useIsRunning();
  const isDone = useTimerDone();
  const { addTask, updateTitle, resetGoal, resetReview } = useTaskActions();
  const { setIsDone } = useTimerActions();

  const prevTasks = useRef([...tasks]);
  /** handler */
  const changeEditingMode = () => {
    // editingMode && !isEditing;
    setEditingMode((prev) => !prev);
  };

  const onChangeNewTask = (e: ChangeEvent<HTMLInputElement>) => {
    setNewTask(e.target.value);
  };

  const onAddTask = () => {
    if (newTask.trim() === '') return;
    addTask(newTask);
    setNewTask('');
  };

  const isReadyToStart = title.trim() !== '' && tasks.length !== 0;

  const onChangeTitle = (e: ChangeEvent<HTMLInputElement>) => {
    updateTitle(e.target.value);
  };

  const cancelTimer = () => {
    closeDialog();
    // 초기화
    setIsDone(false); // Finish 버튼 클릭시 done 설정 초기화
    resetGoal(); // 작성중 닫기 눌렀을 때 제목, TODO TASK 초기화
  };
  const discardTaskChanges = () => {};
  const abortReviewChange = () => {};
  const handleCancelByStatus = () => {
    if (!isRunning) {
      cancelTimer(); // 타이머 생성하다가 취소
      return;
    } else if (isDone) {
      abortReviewChange(); // 할일 관리 수정하다가 취소
    } else {
      discardTaskChanges(); // 회고 작성하다가 취소
    }
  };
  // render button
  const renderButtons = () => {
    if (!isRunning) {
      return (
        <Button
          onClick={onStartTimer}
          variant="secondary"
          disabled={!isReadyToStart}
        >
          타이머 시작하기
        </Button>
      );
    }

    if (isRunning && editingMode) {
      return <Button variant="secondary">변경 사항 저장하기</Button>;
    }

    if (isRunning && !editingMode) {
      return <Button variant="secondary">저장하기</Button>;
    }
  };
  /** dialog값 고정 */
  useEffect(() => {
    changeType('custom');
    return () => {
      changeType('alert');
    };
  }, []);

  if (!dialogOpen) return null;

  return (
    <DialogField>
      <DialogField.Title type="text">
        {isDone ? (
          <div className={cx('isDoneTitleField')}>
            <div className={cx('isDoneMainTitle')}>오늘도 수고하셨어요!</div>
            <div className={cx('isDoneSubTitle')}>
              완료한 일을 체크하고, 오늘의 학습 회고를 작성해 주세요.
            </div>
          </div>
        ) : null}
        {!isRunning ? (
          <>
            <Input.Input
              onChange={onChangeTitle}
              value={title}
              size={'large'}
              placeholder="오늘의 목표"
              className={cx('todayGoal')}
            />
            <Input.Label name="todo" label="할일목록">
              할 일 목록
            </Input.Label>
          </>
        ) : null}
        <div className={cx('inputGroupField')}>
          <div className={cx('inputField')}>
            {/* 1. 인풋창 */}
            <Input.Input
              size={'normal'}
              name="todo"
              placeholder="할 일을 추가해 주세요."
              value={newTask}
              onChange={onChangeNewTask}
              onKeyDown={(e) => e.key === 'Enter' && onAddTask()}
              onAdd={onAddTask}
            />
          </div>
        </div>
      </DialogField.Title>
      <DialogField.Content>
        <div className={cx('goalWrapper')}>
          {isRunning ? (
            <div className={cx('listHeader')}>
              <div className={cx('content')}>할 일 목록</div>
              {!editingMode ? (
                <div className={cx('button')}>
                  <Image
                    src="/images/timerDialog/edit_black.png"
                    className={cx('iconButton')}
                    alt="edit"
                    width={16.6}
                    height={16.6}
                    onClick={changeEditingMode}
                  />
                  <div onClick={changeEditingMode}>할 일 수정</div>
                </div>
              ) : null}
            </div>
          ) : null}
          <div className={cx('goalContainer')}>
            {tasks.map((task) => (
              <TaskItem task={task} key={task.id} editingMode={editingMode} />
            ))}
          </div>
        </div>
        {isDone ? (
          <div className={cx('reviewField')}>
            <div className={cx('reviewTitle')}>학습회고</div>
            <textarea className={cx('reviewContent')} />
          </div>
        ) : null}
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
