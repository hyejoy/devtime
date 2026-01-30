'use client';

import TimeDisplay from '@/app/components/timer/TimeDisplay';
import { API } from '@/constants/endpoints';
import {
  useDisplayTime,
  useIsRunning,
  useLastStartTimestamp,
  useTimerActions,
  useTimerId,
} from '@/store/timer';
import { ActiveTimerResponse, StartTimerResponse } from '@/types/api';
import { timerSummary } from '@/types/timer';
import classNames from 'classnames/bind';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TimerButton from './../../components/timer/TimerButton';
import styles from './TimerClient.module.css';
import TimerDialog from '@/app/components/dialog/timer/TimerDialog';
import { useDialogActions, useIsDialogOpen } from '@/store/dialog';
import { useTaskReview, useTasks, useTaskTitle } from '@/store/task';

const cx = classNames.bind(styles);

export default function TimerClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const [initTimer, setInitTimer] = useState<ActiveTimerResponse | undefined>(
    undefined
  );

  const timerId = useTimerId();
  const lastStartTimestamp = useLastStartTimestamp();
  const isRunning = useIsRunning();
  const review = useTaskReview();
  const tasks = useTasks();

  const {
    setTimerId,
    setIsRunning,
    setTotalActiveSeconds,
    setLastStartTimestamp,
    tick,
    timerReset,
    createSplitTime,
    setIsDone,
    getSplitTimesForServer,
  } = useTimerActions();

  const isDialogOpen = useIsDialogOpen();
  const { openDialog, closeDialog, changeType } = useDialogActions();

  const { hours, mins, secs } = useDisplayTime();
  const title = useTaskTitle();

  // --- 헬퍼 함수 및 공통 로직 ---

  // 시간을 갱신하고 서버에 동기화하는 핵심 함수
  const handleSyncWithServer = async () => {
    if (!timerId || !lastStartTimestamp) return null;

    const split = createSplitTime(lastStartTimestamp);
    const now = new Date().toISOString();

    const newSplitTimes = [
      ...(initTimer?.splitTimes ?? []),
      {
        date: now,
        timeSpent: split.timeSpent,
      },
    ];

    try {
      const res = await fetch(`${API.TIMER.ITEM(timerId)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ splitTimes: newSplitTimes }),
      });

      if (!res.ok) throw new Error('동기화 실패');

      const data: ActiveTimerResponse = await res.json();
      setInitTimer(data);
      setLastStartTimestamp(now); // 기준점 갱신
      return data;
    } catch (err) {
      console.error('서버 동기화 중 오류:', err);
      return null;
    }
  };

  // --- 핸들러 함수 ---

  const onStart = () => {
    console.log(isDialogOpen);

    openDialog();
  };
  const onStartTimer = async () => {
    // 1. 처음 생성하는 경우
    if (!lastStartTimestamp) {
      const taskList = tasks.map((t) => t.content) ?? [];
      try {
        const res = await fetch(`${API.TIMER.TIMERS}`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ todayGoal: title, tasks: taskList }),
        });
        if (!res.ok) throw new Error('타이머 시작 실패');

        const next: StartTimerResponse = await res.json();
        setTimerId(next.timerId);
        setLastStartTimestamp(new Date().toISOString());
        setIsRunning(true);
        closeDialog();
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // 2. 일시정지 후 다시 시작하는 경우
    if (timerId) {
      setLastStartTimestamp(new Date().toISOString());
      setIsRunning(true);
    }
  };

  const onPauseTimer = async () => {
    if (!timerId) return;
    setIsRunning(false);
    await handleSyncWithServer();
  };

  const onFinish = () => {
    setIsDone(true);
  };

  const onFinishTimer = async () => {
    if (!review || review.length < 15) {
      alert('회고를 15자 이상 작성해주세요!');
      return;
    }

    // 종료 전 마지막 세션 시간을 서버에 한 번 더 보내서 완벽하게 맞춤
    const updatedData = await handleSyncWithServer();
    const finalSplitTimes = updatedData?.splitTimes ?? initTimer?.splitTimes;
    const body = getSplitTimesForServer();
    try {
      const res = await fetch(`${API.TIMER.STOP(timerId!)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body,
          // splitTimes: finalSplitTimes,
          // review: review,
          // tasks: tasks,
        }),
      });

      if (res.ok) {
        setLoading(true);
        timerReset();
      }
    } catch (err) {
      console.error('타이머 종료 중 오류:', err);
    }
  };

  // --- Effects ---

  // 초기 활성 타이머 로드
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch(`${API.TIMER.TIMERS}`, {
          credentials: 'include',
        });
        const data: ActiveTimerResponse = await res.json();

        if (res.ok && !data.error) {
          setInitTimer(data);
          const accumulatedTime = data.splitTimes.reduce(
            (acc, s) => acc + s.timeSpent,
            0
          );
          const currentDiff = createSplitTime(data.lastUpdateTime).timeSpent;

          setTimerId(data.timerId);
          setIsRunning(true);
          setLastStartTimestamp(data.lastUpdateTime);
          setTotalActiveSeconds(accumulatedTime + currentDiff);
        }
      } catch (err) {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // 10분마다 자동 저장 (Polling)
  useEffect(() => {
    if (!timerId || !isRunning) return;

    const intervalId = setInterval(async () => {
      console.log('10분 자동 저장 실행 ✅');
      await handleSyncWithServer();
    }, 600000);

    return () => clearInterval(intervalId);
  }, [timerId, isRunning, initTimer]);

  // 1초마다 UI 갱신 (Tick)
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => tick(), 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  if (loading) return <div>로딩중...</div>;

  return (
    <div className={cx('page')}>
      <div
        className={cx(
          'title',
          `${lastStartTimestamp ? 'titleRunning' : 'titleDefault'}`
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
        {/* 1. 메인 컨트롤 버튼 영역 (재생, 일시정지, 종료) */}
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
              onClick={onPauseTimer}
            />
            <TimerButton
              timerType="finish"
              active={!!lastStartTimestamp}
              onClick={onFinishTimer}
            />
          </div>
        </div>

        <div className={cx('iconContainer')}>
          <div className={cx('iconWrap')}>
            <Image
              className={cx('iconField')}
              src="/images/timer/see-todo-active.png"
              alt="할 일 목록"
              width={55}
              height={55}
            />
            <Image
              className={cx('iconField')}
              src="/images/timer/reset-active.png"
              alt="새로고침"
              width={55}
              height={55}
              onClick={() => window.location.reload()} // 새로고침 기능 추가
            />
          </div>
        </div>
      </div>
      {isDialogOpen && (
        <TimerDialog
          onStartTimer={onStartTimer}
          onFinishTimer={onFinishTimer}
        />
      )}
    </div>
  );
}
