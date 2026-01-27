'use client';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';

interface TimerContextType {
  timerId: string;
  totalActiveMs: number; // 실제로 타이머가 '재생' 상태였던 시간의 합.
  isRunning: boolean; // 실행 중 여부
  lastStartTimestamp: string | undefined; // 마지막으로 '시작'
  lastPauseTimestamp: string | undefined; // 마지막으로 '정지'
  displayTime: number;
  setTimerId: Dispatch<SetStateAction<string>>;
  setTotalActiveMs: Dispatch<SetStateAction<number>>;
  setIsRunning: Dispatch<SetStateAction<boolean>>;
  setLastStartTimestamp: Dispatch<SetStateAction<string>>;
  setLastPauseTimestamp: Dispatch<SetStateAction<string>>;
  setDisplayTime: Dispatch<SetStateAction<number>>;
  timerReset: () => void;
  // totalPausedMs: number; // 타이머를 '일시정지' 해두었던 시간의 합
  // setTotalPausedMs: Dispatch<SetStateAction<number>>;
}
// 초기값에 타입을 부여 (null을 허용하되 명시적으로)
export const TimerContext = createContext<TimerContextType | undefined>(
  undefined
);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timerId, setTimerId] = useState('');
  const [totalActiveMs, setTotalActiveMs] = useState(0);
  // const [totalPausedMs, setTotalPausedMs] = useState(0);
  const [lastStartTimestamp, setLastStartTimestamp] = useState<string>('');
  const [lastPauseTimestamp, setLastPauseTimestamp] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);

  const timerReset = () => {
    setTimerId('');
    setTotalActiveMs(0);
    setDisplayTime(0);
    setIsRunning(false);
    setLastStartTimestamp('');
  };

  const value = {
    timerId,
    totalActiveMs,
    isRunning,
    lastStartTimestamp,
    lastPauseTimestamp,
    setTimerId,
    displayTime,
    setTotalActiveMs,
    setIsRunning,
    setLastStartTimestamp,
    setLastPauseTimestamp,
    setDisplayTime,
    timerReset,
    // totalPausedMs,
    // setTotalPausedMs,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && lastStartTimestamp) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const start = new Date(lastStartTimestamp!).getTime();

        // 현재 세션에서 흐른 초 (현재 - 재생버튼 누른 시점)
        const currentSessionSeconds = Math.floor((now - start) / 1000);

        // 최종 표시 시간 = 이전까지의 누적 공부 시간 + 현재 공부 중인 시간
        setDisplayTime(totalActiveMs + currentSessionSeconds);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, lastStartTimestamp, totalActiveMs]);

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer는 TimerProvider 안에서만 사용할 수 있습니다.');
  }
  return context;
}
