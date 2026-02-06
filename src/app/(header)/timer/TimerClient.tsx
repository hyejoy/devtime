'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

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
  useTimerStauts,
} from '@/store/timer';
import { useDialogActions, useIsDialogOpen } from '@/store/dialog';
import { API } from '@/constants/endpoints';

export default function TimerClient() {
  const [isHydrated, setIsHydrated] = useState(false);

  // Zustand States
  const timerId = useTimerId();
  const isRunning = useIsRunning();
  const timerStatus = useTimerStauts();
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
    setLastStartTimestamp,
  } = useTimerActions();

  // Dialog Actions
  const isDialogOpen = useIsDialogOpen();
  const { openDialog } = useDialogActions();

  // 1. 하이드레이션 및 시간 보정
  useEffect(() => {
    setIsHydrated(true);
    if (timerStatus === 'READY') {
      setLastStartTimestamp('');
    }

    if (isRunning && lastStartTimestamp) {
      const now = new Date().getTime();
      const last = new Date(lastStartTimestamp).getTime();
      const gap = Math.floor((now - last) / 1000);
      setTotalActiveSeconds(totalActiveSeconds + gap);
    }
  }, []);

  // 2. 타이머 엔진 (Tick)
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  // 3. 서버 자동 저장 (10분)
  useEffect(() => {
    if (!timerId || !isRunning) return;
    const TEN_MINUTES = 10 * 60 * 1000;
    const intervalId = setInterval(async () => {
      try {
        await saveCurrentTime();
      } catch (err) {
        console.error('동기화 실패:', err);
      }
    }, TEN_MINUTES);
    return () => clearInterval(intervalId);
  }, [timerId, isRunning, saveCurrentTime]);

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
    fetchTaskList();
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

  if (!isHydrated) return null;

  return (
    <main className="flex flex-col items-center justify-center">
      {/* 메인 페이지 규격에 맞춘 상단 섹션 */}
      <section className="mt-[10px] mb-[66px] flex flex-col items-center">
        <div
          className={clsx(
            'text-[72px] leading-tight font-bold whitespace-nowrap',
            totalActiveSeconds ? 'text-brand-primary' : 'text-brand-primary-30'
          )}
        >
          {totalActiveSeconds ? title : '오늘도 열심히 달려봐요!'}
        </div>
      </section>

      {/* 타이머 디스플레이 영역 */}
      <div className="flex h-auto items-center justify-center">
        <TimeDisplay unit="HOURS" value={hours} />
        <div className="font-pretendard text-brand-primary px-8 py-4 text-[160px] leading-none">
          :
        </div>
        <TimeDisplay unit="MINUTES" value={mins} />
        <div className="font-pretendard text-brand-primary px-8 py-4 text-[160px] leading-none">
          :
        </div>
        <TimeDisplay unit="SECONDS" value={secs} />
      </div>

      {/* 하단 버튼 및 액션 아이콘 영역 */}
      <div className="mt-20 flex h-[100px] w-full max-w-[800px] items-center justify-center">
        {/* 중앙 정렬을 위한 컨테이너 */}
        <div className="relative flex items-center gap-14">
          <TimerButton timerType="start" active={!isRunning} onClick={onStart} />
          <TimerButton timerType="pause" active={isRunning} onClick={pauseTimerOnServer} />
          <TimerButton timerType="finish" active={!!lastStartTimestamp} onClick={onFinish} />

          {/* 우측 보조 버튼 (목록/리셋) */}
          {lastStartTimestamp && (
            <div className="absolute left-full ml-10 flex gap-6">
              <Image
                className="cursor-pointer transition-opacity hover:opacity-80"
                src="/images/timer/see-todo-active.png"
                alt="목록"
                width={55}
                height={55}
                onClick={handleEditTasks}
              />
              <Image
                className="cursor-pointer transition-opacity hover:opacity-80"
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
    </main>
  );
}
