/**
 * 현재 Zustand 스토어의 tick 로직은 초(Seconds) 단위로 계산
 * 스토어 내부 로직(tick, displayTime)은 모두 초(s) 단위로 유지
 * 서버에 보낼 때도 초(s) 단위로 데이터 전송
 */

import { create } from 'zustand';

interface SplitTime {
  date: string; // ISO String (날자 부분만)
  timeSpent: number; // ms 단위
}

interface DisplayTime {
  hours: string;
  mins: string;
  secs: string;
}

interface TimerStore {
  timerId: string;
  isDone: boolean;
  isRunning: boolean; // 실행 중 여부
  dailyRecords: Record<string, number>; // key는 날짜(string), value는 초(number)
  totalActiveSeconds: number; // 실제로 타이머가 '재생' 상태였던 시간의 합.
  lastStartTimestamp: string | undefined; // 마지막으로 시작
  displayTime: DisplayTime;

  actions: {
    setTimerId: (id: string) => void;
    setIsDone: (done: boolean) => void;
    setTotalActiveSeconds: (s: number) => void;
    setIsRunning: (running: boolean) => void;
    setLastStartTimestamp: (time: string | undefined) => void;
    tick: () => void; // 1초마다 실행될 로직 (초 단위로 유지됨)
    timerReset: () => void;
    createSplitTime: (startTime: string) => SplitTime;
    getSplitTimesForServer: () => SplitTime[];
  };
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timerId: '',
  isRunning: false,
  isDone: false,
  dailyRecords: {},
  totalActiveSeconds: 0,
  lastStartTimestamp: undefined,
  displayTime: {
    hours: '00',
    mins: '00',
    secs: '00',
  },
  actions: {
    setTimerId: (id) => set({ timerId: id }),
    setIsDone: (done) => set({ isDone: done }),
    setTotalActiveSeconds: (s) => set({ totalActiveSeconds: s }),
    setIsRunning: (running) => set({ isRunning: running }),
    setLastStartTimestamp: (time) => set({ lastStartTimestamp: time }),

    tick: () => {
      const {
        isRunning,
        lastStartTimestamp,
        dailyRecords,
        totalActiveSeconds,
      } = get();
      if (!isRunning || !lastStartTimestamp) return;
      const now = new Date();
      const todayKey = now.toISOString().split('T')[0]; // 2026-01-28

      // 전체 초 증가 (1초마다 화면 변경)
      const nextTotalSeconds = totalActiveSeconds + 1;
      // 1초씩(1000ms) 현재 날자 키에 누적
      const updateRecords = { ...dailyRecords };

      updateRecords[todayKey] = (updateRecords[todayKey] || 0) + 1; // 초(s) 단위로 저장함
      const h = Math.floor(nextTotalSeconds / 3600)
        .toString()
        .padStart(2, '0');
      const m = Math.floor((nextTotalSeconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
      const s = (nextTotalSeconds % 60).toString().padStart(2, '0');
      set({
        dailyRecords: updateRecords,
        totalActiveSeconds: nextTotalSeconds,
        displayTime: { hours: h, mins: m, secs: s }, // 화면용 객체 업데이트
      });
    },
    // 서버 전송용 데이터 변환
    getSplitTimesForServer: (): SplitTime[] => {
      const { dailyRecords } = get();
      return Object.entries(dailyRecords).map(([date, seconds]) => ({
        date: new Date(date).toISOString(),
        timeSpent: seconds, // 초단위로 전송함
      }));
    },
    timerReset: () =>
      set({
        timerId: '',
        isRunning: false,
        isDone: false,
        totalActiveSeconds: 0,
        displayTime: {
          hours: '00',
          mins: '00',
          secs: '00',
        },
        lastStartTimestamp: undefined,
        dailyRecords: {},
      }),
    createSplitTime: (startTime: string): SplitTime => {
      const start = new Date(startTime);
      const now = new Date();
      // 1. 밀리초 차이 계산
      const diffMs = now.getTime() - start.getTime();

      // 2. 초 단위로 환산
      const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
      // console.log('지난 시간 (초) : ', diffSeconds);
      return {
        date: now.toISOString(),
        timeSpent: diffSeconds, // 초 단위 값
      };
    },
  },
}));

export const useTimerId = () => useTimerStore((state) => state.timerId);
export const useTimerDone = () => useTimerStore((state) => state.isDone);
export const useIsRunning = () => useTimerStore((state) => state.isRunning);
export const useDailyRecords = () =>
  useTimerStore((state) => state.dailyRecords);
export const useTotalSeconds = () =>
  useTimerStore((state) => state.totalActiveSeconds);
export const useLastStartTimestamp = () =>
  useTimerStore((state) => state.lastStartTimestamp);
export const useDisplayTime = () => useTimerStore((state) => state.displayTime);
// actions
export const useTimerActions = () => useTimerStore((state) => state.actions);
