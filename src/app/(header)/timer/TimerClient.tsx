'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames/bind';
import styles from './TimerClient.module.css';

import TimeDisplay from '@/app/components/timer/TimeDisplay';
import TimerButton from './../../components/timer/TimerButton';
import TimerDialog from '@/app/components/dialog/timer/TimerDialog';

import {
  useTimerActions,
  useIsRunning,
  useLastStartTimestamp,
  useTimerId,
  useTaskTitle,
  useDisplayTime,
  useTotalSeconds,
  useTaskReview,
} from '@/store/timer';
import { useDialogActions, useIsDialogOpen } from '@/store/dialog';
import { API } from '@/constants/endpoints';

const cx = classNames.bind(styles);

export default function TimerClient() {
  const [isHydrated, setIsHydrated] = useState(false); // ✅ 하이드레이션 체크

  // Zustand States
  const timerId = useTimerId();
  const isRunning = useIsRunning();
  const lastStartTimestamp = useLastStartTimestamp();
  const title = useTaskTitle();
  const totalActiveSeconds = useTotalSeconds();
  const { hours, mins, secs } = useDisplayTime();

  // Zustand Actions
  const {
    startTimerOnServer,
    pauseTimerOnServer,
    setTimerStatus,
    tick,
    timerReset,
    fetchTaskList,
    setTotalActiveSeconds,
    setIsRunning,
    saveCurrentTime,
  } = useTimerActions();

  // Dialog Actions
  const isDialogOpen = useIsDialogOpen();
  const { openDialog } = useDialogActions();

  // 1. [Hydration] 클라이언트 사이드 데이터 복구 확인
  useEffect(() => {
    setIsHydrated(true);

    // 새로고침 시, 실행 중이었다면 서버와 동기화하거나 시간을 보정합니다.
    if (isRunning && lastStartTimestamp) {
      const now = new Date().getTime();
      const last = new Date(lastStartTimestamp).getTime();
      const gap = Math.floor((now - last) / 1000);

      // 흐른 시간만큼 추가 (보정)
      setTotalActiveSeconds(totalActiveSeconds + gap);
    }
  }, []);

  // 2. [Tick] 1초마다 UI 갱신
  // 1초마다 숫자를 올리는 엔진 (Tick)
  useEffect(() => {
    // 로컬스토리지에서 복구된 isRunning이 true일 때만 인터벌 실행
    if (!isRunning) return;

    console.log('⏱️ 타이머 엔진 재가동 (Tick)');

    const intervalId = setInterval(() => {
      tick();
    }, 1000);

    // 컴포넌트 언마운트 시 인터벌 청소 (메모리 누수 방지)
    return () => {
      console.log('🛑 타이머 엔진 정지');
      clearInterval(intervalId);
    };
  }, [isRunning, tick]);

  // 3. [Sync] 10분마다 서버 자동 저장 (Polling)
  useEffect(() => {
    if (!timerId || !isRunning) return;

    // 10분 = 10 * 60 * 1000 ms
    const TEN_MINUTES = 10 * 60 * 1000;

    const intervalId = setInterval(async () => {
      try {
        await saveCurrentTime();
      } catch (err) {
        console.error('동기화 실패:', err);
      }
    }, TEN_MINUTES);

    return () => clearInterval(intervalId);
  }, [timerId, isRunning, pauseTimerOnServer, setIsRunning]);

  // --- 핸들러 ---
  const onStart = () => {
    if (!timerId) {
      setTimerStatus('READY');
      openDialog();
    } else {
      startTimerOnServer();
    }
  };

  const onFinish = () => {
    setTimerStatus('DONE');
    setIsRunning(false);
    openDialog();
  };

  const handleEditTasks = () => {
    setTimerStatus('RUNNING');
    fetchTaskList(); // 최신 목록 가져오기
    openDialog();
  };

  const resetTimer = async () => {
    if (!confirm('정말 타이머를 초기화하시겠습니까?')) return;
    try {
      await fetch(`${API.TIMER.ITEM(timerId)}`, { method: 'DELETE' });
      timerReset();
    } catch (err) {
      console.error('리셋 실패:', err);
    }
  };

  // 하이드레이션 전에 빈 화면  방지
  if (!isHydrated) return null;

  return (
    <div className={cx('page')}>
      <div
        className={cx(
          'title',
          lastStartTimestamp ? 'titleRunning' : 'titleDefault'
        )}
      >
        <div>{lastStartTimestamp ? title : '오늘도 열심히 달려봐요!'}</div>
      </div>

      <div className={cx('timerContainer')}>
        <TimeDisplay unit="HOURS" value={hours} />
        <div className={cx('dot')}>:</div>
        <TimeDisplay unit="MINUTES" value={mins} />
        <div className={cx('dot')}>:</div>
        <TimeDisplay unit="SECONDS" value={secs} />
      </div>

      <div className={cx('buttonContainer')}>
        <div className={cx('buttonWrap')}>
          <div className={cx('playButtonField')}>
            <TimerButton
              timerType="start"
              active={!isRunning}
              onClick={onStart}
            />
            <TimerButton
              timerType="pause"
              active={isRunning}
              onClick={pauseTimerOnServer}
            />
            <TimerButton
              timerType="finish"
              active={!!lastStartTimestamp}
              onClick={onFinish}
            />
          </div>
        </div>

        <div className={cx('iconContainer')}>
          {lastStartTimestamp && (
            <div className={cx('iconWrap')}>
              <Image
                className={cx('iconField')}
                src="/images/timer/see-todo-active.png"
                alt="목록"
                width={55}
                height={55}
                onClick={handleEditTasks}
              />
              <Image
                className={cx('iconField')}
                src="/images/timer/reset-active.png"
                alt="리셋"
                width={55}
                height={55}
                onClick={resetTimer}
              />
            </div>
          )}
        </div>
      </div>
      {isDialogOpen && <TimerDialog />}
    </div>
  );
}
