'use client';

import clsx from 'clsx';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import TimerDialog from '@/app/components/dialog/timer/TimerDialog';
import TimeDisplay from '@/app/components/timer/TimeDisplay';
import { timerService } from '@/services/timerService';
import { useDialogStore } from '@/store/dialog';
import { useTimerStore } from '@/store/timer';
import TimerButton from './../../components/timer/TimerButton';
import { useShallow } from 'zustand/react/shallow';

export default function TimerClient() {
  /** zustand */

  const {
    studyLogId,
    timerId,
    timerStatus,
    isRunning,
    totalActiveMs,
    lastStartTimestamp,
    displayTime,
    todayGoal,
  } = useTimerStore(
    useShallow((state) => ({
      studyLogId: state.studyLogId,
      timerId: state.timerId,
      timerStatus: state.timerStatus,
      isRunning: state.isRunning,
      totalActiveMs: state.totalActiveMs,
      lastStartTimestamp: state.lastStartTimestamp,
      displayTime: state.displayTime,
      todayGoal: state.todayGoal,
    }))
  );

  const {
    setLastStartTimestamp,
    setTotalActiveMs,
    tick,
    setTimerStatus,
    setIsRunning,
    timerReset,
    settingReStartTimer,
    settingPauseTimer,
  } = useTimerStore((state) => state.actions);
  const { hours, mins, secs } = displayTime;
  const { openDialog } = useDialogStore();

  /** state */
  const [isHydrated, setIsHydrated] = useState(false); // 하이드레이션 체크
  const [isEditingMode, setEditingMode] = useState(false); // editingMode ture 연필&쓰레기통 · false면 checkbox

  /** 하이드레이션 및 시간 보정 */
  useEffect(() => {
    setIsHydrated(true);

    // 시작한 타이머 없는 경우
    if (timerStatus === 'READY') {
      setLastStartTimestamp('');
    }

    // 실행중 · 마지막 실행시간 있는 경우
    if (isRunning && lastStartTimestamp) {
      const now = new Date().getTime(); // ms
      const last = new Date(lastStartTimestamp).getTime(); //ms
      const gap = now - last; //ms
      setTotalActiveMs(totalActiveMs + gap);
    }
  }, []);

  /** 타이머 엔진 · tick */
  useEffect(() => {
    if (!isRunning) return;
    const intervalId = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isRunning, tick]);

  /** 10분 마다 실행 */
  useEffect(() => {
    if (totalActiveMs > 0 && totalActiveMs % 600000 < 1000) {
      //⭐⭐⭐⭐🛫 authService.refresh(); // 서비스 레이어의 함수 호출
    }
  }, [totalActiveMs]);

  const handleEditingMode = (isEditing: boolean) => {
    setEditingMode(isEditing);
  };

  const handleTimerStart = async () => {
    // 첫 타이머 실행
    if (!timerId) {
      setTimerStatus('READY');
      openDialog(); // dialog에서 시작 실행 처리
    } else {
      // 일시 정지 후 재개 [이미 timerId가 있는 경우]
      const now = new Date().toISOString();
      settingReStartTimer();
    }
  };

  // 타이머 일시정지
  const handleTimerPause = () => {
    settingPauseTimer();
  };

  // 타이머 종료
  const handleTimerStop = () => {
    setTimerStatus('DONE');
    setIsRunning(false);
    openDialog(); // dialog에서 정지 실행 처리
  };

  const handleResetTimer = async () => {
    if (!confirm('정말 타이머를 초기화하시겠습니까?')) return;
    try {
      await timerService.delete(timerId);
      timerReset();
      alert('타이머가 초기화 되었습니다.');
    } catch (err) {
      console.error('삭제 실패": ', err);
      alert('타이머 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEditTasks = () => {
    handleEditingMode(false);
    openDialog();
  };

  if (!isHydrated) return null;

  return (
    <>
      <main className="flex flex-col items-center justify-center">
        <section className="mt-26.75 mb-12.5">
          <div
            className={clsx(
              'text-[72px] font-bold',
              timerStatus !== 'READY' ? 'text-brand-primary' : 'text-brand-primary-30'
            )}
          >
            {timerStatus !== 'READY' ? todayGoal : '오늘도 열심히 달려봐요!'}
          </div>
        </section>

        <div className={'flex h-auto justify-center'}>
          <TimeDisplay unit="HOURS" value={hours} />
          <div className={'font-pretendard text-brand-primary box-border px-8 py-4 text-[160px]'}>
            :
          </div>
          <TimeDisplay unit="MINUTES" value={mins} />
          <div className={'font-pretendard text-brand-primary box-border px-8 py-4 text-[160px]'}>
            :
          </div>
          <TimeDisplay unit="SECONDS" value={secs} />
        </div>

        <div className={'mt-20 flex h-[100px] w-[1020px] items-center justify-start'}>
          <div className={'flex w-[680px] justify-end gap-14'}>
            <TimerButton timerType="start" active={!isRunning} onClick={handleTimerStart} />
            <TimerButton timerType="pause" active={isRunning} onClick={handleTimerPause} />
            <TimerButton
              timerType="finish"
              active={timerStatus !== 'READY'}
              onClick={handleTimerStop}
            />
          </div>
          <div className={'flex flex-1 justify-end gap-6'}>
            {timerStatus !== 'READY' && (
              <>
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
                  onClick={handleResetTimer}
                />
              </>
            )}
          </div>
        </div>
        <TimerDialog isEditingMode={isEditingMode} onChangeEditingMode={handleEditingMode} />
      </main>
    </>
  );
}
