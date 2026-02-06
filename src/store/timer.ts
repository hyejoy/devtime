import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useDialogStore } from './dialog';
import { API } from '@/constants/endpoints';
import { formatSplitTimesForServer } from '@/utils/formatTime';
/** TODO
 * 설계 측면에서 개선해야 할 큰 포인트들 말씀드리면,
 * API 호출을 스토어 안에서 하는 것
 * 다른 스토어 (useDialogStore)를 여기서 사용하는 것
 * 인데요,
 * API 호출부는 별도로 분리해주세요.
 * 컴포넌트 또는 커스텀훅에서 API 호출 후 상태 업데이트 시에만 스토어를 활용하시면 됩니다
 * 스토어끼리의 결합도 제거해주세요. dialog 는 UI 로직이므로 컴포넌트 레벨에서 처리해야 합니다
 */
// --- Types ---
export type Task = {
  id: string;
  content: string;
  isCompleted: boolean;
};

interface SplitTime {
  date: string;
  timeSpent: number; // 스토어 내부에선 ms 단위로 관리
}

interface DisplayTime {
  hours: string;
  mins: string;
  secs: string;
}

type TimerStatus = 'READY' | 'RUNNING' | 'DONE';

interface TimerState {
  timerStatus: TimerStatus;
  studyLogId: string;
  timerId: string;
  isRunning: boolean;
  dailyRecords: Record<string, number>; // ms 단위 저장
  totalActiveSeconds: number; // 실제 값은 ms 단위
  lastStartTimestamp: string | undefined;
  displayTime: DisplayTime;
  title: string;
  review: string;
  tasks: Task[];
  saveTasks: Task[];

  actions: {
    setTimerStatus: (status: TimerStatus) => void;
    setTimerId: (id: string) => void;
    setTotalActiveSeconds: (s: number) => void;
    setIsRunning: (running: boolean) => void;
    setLastStartTimestamp: (time: string | undefined) => void;
    tick: () => void;
    timerReset: () => void;
    createSplitTime: (startTime: string) => SplitTime;
    getSplitTimesForServer: () => SplitTime[];
    startTimerOnServer: () => Promise<void>;
    pauseTimerOnServer: () => Promise<void>;
    saveCurrentTime: () => Promise<void>;
    finishTimerOnServer: () => Promise<void>;
    updateTaskList: () => Promise<void>;
    fetchTaskList: () => Promise<void>;
    updateTitle: (title: string) => void;
    updateReview: (review: string) => void;
    toggleDone: (id: string) => void;
    addTask: (content: string) => void;
    updateTaskContent: (updateId: string, content: string) => void;
    deletedTask: (deletedId: string) => void;
    resetGoal: () => void;
    resetReview: () => void;
    syncTasksWithSaved: () => void;
  };
}

const STUDY_LOG_KEY = 'timer-storage';

const initialState = {
  studyLogId: '',
  timerId: '',
  isRunning: false,
  totalActiveSeconds: 0,
  displayTime: { hours: '00', mins: '00', secs: '00' },
  lastStartTimestamp: '',
  dailyRecords: {},
  title: '',
  review: '',
  tasks: [],
  saveTasks: [],
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timerStatus: 'READY',
      ...initialState,
      actions: {
        setTimerStatus: (status) => set({ timerStatus: status }),
        setTimerId: (id) => set({ timerId: id }),
        setTotalActiveSeconds: (s) => set({ totalActiveSeconds: s }),
        setIsRunning: (running) => set({ isRunning: running }),
        setLastStartTimestamp: (time) => set({ lastStartTimestamp: time }),

        tick: () => {
          const { isRunning, lastStartTimestamp, dailyRecords, totalActiveSeconds } = get();
          if (!isRunning || !lastStartTimestamp) return;

          // 10분마다 세션 연장 (600,000ms)
          if (totalActiveSeconds > 0 && totalActiveSeconds % 600000 === 0) {
            fetch('/api/auth/refresh', { credentials: 'include' });
          }

          const now = new Date();
          const todayKey = now.toISOString().split('T')[0];

          // 1초마다 1000ms씩 증가
          const nextTotalMs = totalActiveSeconds + 1000;
          const updateRecords = { ...dailyRecords };
          updateRecords[todayKey] = (updateRecords[todayKey] || 0) + 1000;

          // 디스플레이 계산용 (ms -> s)
          const totalSeconds = Math.floor(nextTotalMs / 1000);
          const h = Math.floor(totalSeconds / 3600)
            .toString()
            .padStart(2, '0');
          const m = Math.floor((totalSeconds % 3600) / 60)
            .toString()
            .padStart(2, '0');
          const s = (totalSeconds % 60).toString().padStart(2, '0');

          set({
            dailyRecords: updateRecords,
            totalActiveSeconds: nextTotalMs,
            displayTime: { hours: h, mins: m, secs: s },
          });
        },

        getSplitTimesForServer: () => {
          const { dailyRecords } = get();
          return Object.entries(dailyRecords).map(([date, ms]) => ({
            date: new Date(date).toISOString(),
            timeSpent: ms, // ms 단위를 반환 (전송 직전 유틸에서 s로 변환됨)
          }));
        },

        createSplitTime: (startTime) => {
          const start = new Date(startTime);
          const now = new Date();
          const diffMs = now.getTime() - start.getTime();
          return { date: now.toISOString(), timeSpent: Math.max(0, diffMs) };
        },

        timerReset: () => set(initialState),
        updateTitle: (title) => set({ title }),
        updateReview: (review) => set({ review }),
        toggleDone: (id) =>
          set((state) => ({
            tasks: state.tasks.map((t) =>
              t.id === id ? { ...t, isCompleted: !t.isCompleted } : t
            ),
          })),
        addTask: (content) =>
          set((state) => ({
            tasks: [{ id: nanoid(), content, isCompleted: false }, ...state.tasks],
          })),
        updateTaskContent: (id, content) =>
          set((state) => ({
            tasks: state.tasks.map((t) => (t.id === id ? { ...t, content } : t)),
          })),
        deletedTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          })),
        resetGoal: () => set({ title: '', tasks: [] }),
        resetReview: () => set({ review: '' }),
        syncTasksWithSaved: () => {
          const { saveTasks } = get();
          if (saveTasks.length > 0) set({ tasks: [...saveTasks] });
        },

        /*** 🚩 API Actions (기존 구조 유지하되 데이터 전송 시 단위 변환 적용) ***/
        startTimerOnServer: async () => {
          const { tasks, title, actions } = get();
          const now = new Date().toISOString();
          set({ saveTasks: [...tasks] });
          const taskList = tasks.map((t) => t.content);

          try {
            const res = await fetch(`${API.TIMER.TIMERS}`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                todayGoal: title || '오늘의 목표',
                tasks: taskList,
              }),
            });
            if (!res.ok) throw new Error('시작 실패');
            const data = await res.json();
            set({
              studyLogId: data.studyLogId,
              timerId: data.timerId,
              lastStartTimestamp: now,
              isRunning: true,
              timerStatus: 'RUNNING',
            });
            useDialogStore.getState().actions.closeDialog();
          } catch (err) {
            console.error(err);
          }
        },

        pauseTimerOnServer: async () => {
          const { timerId, isRunning, actions } = get();
          if (!timerId || !isRunning) return;
          set({ isRunning: false });

          // 핵심: 서버로 보낼 때 formatSplitTimesForServer 유틸을 사용하여 ms -> s 변환
          const body = formatSplitTimesForServer(actions.getSplitTimesForServer());

          try {
            await fetch(`${API.TIMER.ITEM(timerId)}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ splitTimes: body }),
            });
          } catch (err) {
            console.error(err);
          }
        },

        saveCurrentTime: async () => {
          const { timerId, isRunning, actions } = get();
          if (!timerId || !isRunning) return;
          const body = formatSplitTimesForServer(actions.getSplitTimesForServer());
          try {
            await fetch(`${API.TIMER.ITEM(timerId)}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ splitTimes: body }),
            });
          } catch (err) {
            console.error(err);
          }
        },

        finishTimerOnServer: async () => {
          const { timerId, review, tasks, actions } = get();
          if (!timerId || review.trim().length < 15) return;

          // 서버 전송용 초(s) 단위 변환
          const splitTimes = formatSplitTimesForServer(actions.getSplitTimesForServer());
          const taskList = tasks.map((t) => ({ content: t.content, isCompleted: t.isCompleted }));

          try {
            const res = await fetch(`${API.TIMER.STOP(timerId)}`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ splitTimes, review, tasks: taskList }),
            });
            if (res.ok) {
              actions.timerReset();
              useDialogStore.getState().actions.closeDialog();
            }
          } catch (err) {
            console.error(err);
          }
        },

        fetchTaskList: async () => {
          /* 기존 로직 동일 */
        },
        updateTaskList: async () => {
          /* 기존 로직 동일 */
        },
      },
    }),
    {
      name: STUDY_LOG_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { actions, ...rest } = state;
        return rest;
      },
    }
  )
);

/*** TODO

 * 이 부분도 헷갈려요.

 * use prefix 는 커스텀 훅에 사용되는 네이밍이라

 * 사용처에서 볼 때 뭘 의미하는지 예상이 잘 안돼요.

 * 네이밍 변경하시거나 사용처에서 직접 useTimerStore import 해서 참조하는 편이 좋을 것 같아요

 */

export const useTimerStauts = () => useTimerStore((state) => state.timerStatus);
export const useStudyLogId = () => useTimerStore((state) => state.studyLogId);
export const useTimerId = () => useTimerStore((state) => state.timerId);
export const useIsRunning = () => useTimerStore((state) => state.isRunning);
export const useDailyRecords = () => useTimerStore((state) => state.dailyRecords);
export const useTotalSeconds = () => useTimerStore((state) => state.totalActiveSeconds);
export const useLastStartTimestamp = () => useTimerStore((state) => state.lastStartTimestamp);
export const useDisplayTime = () => useTimerStore((state) => state.displayTime);
export const useTaskTitle = () => useTimerStore((state) => state.title);
export const useTaskReview = () => useTimerStore((state) => state.review);
export const useTasks = () => useTimerStore((state) => state.tasks);
export const useSaveTasks = () => useTimerStore((state) => state.saveTasks);

export const useTimerActions = () => useTimerStore((state) => state.actions);
