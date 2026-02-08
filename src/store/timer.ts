import { DisplayTime, SplitTime, Task, TimerStatus } from '@/types/timer';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
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

interface TimerState {
  studyLogId: string;
  timerId: string;
  timerStatus: TimerStatus;
  isRunning: boolean;
  dailyRecords: Record<string, number>; // ms 단위 저장
  totalActiveMs: number; // ms 단위
  lastStartTimestamp: string | undefined;
  displayTime: DisplayTime; // 화면 표시 시간
  todayGoal: string;
  review: string;
  tasks: Task[]; // 저장전 할일 목록
  saveTasks: Task[]; // 저장된 할일 목록

  actions: {
    setTimerStatus: (status: TimerStatus) => void;
    setTimerId: (id: string) => void;
    setTotalActiveMs: (s: number) => void;
    setIsRunning: (running: boolean) => void;
    setLastStartTimestamp: (time: string | undefined) => void;
    tick: () => void;
    timerReset: () => void;
    createSplitTime: (startTime: string) => SplitTime;
    getSplitTimesForServer: () => SplitTime[];
    updateTodayGoal: (todayGoal: string) => void;
    updateReview: (review: string) => void;
    toggleDone: (id: string) => void;
    addTask: (content: string) => void;
    updateTaskContent: (updateId: string, content: string) => void;
    deletedTask: (deletedId: string) => void;
    syncTasksWithSaved: () => void;
    /** timer page dialog 취소버튼 관련 */
    cancleCreateTimer: () => void;
    cancleEditTasks: () => void;
    cancleFinishTimer: () => void;
    settingStartTimer: (lastStartTimestamp: string, studyLogId: string, timerId: string) => void;
    settingReStartTimer: () => void;
    settingPauseTimer: () => void;
    settingDoneTimer: () => void;
    snapshotTasks: () => void;
  };
}

const STUDY_LOG_KEY = 'timer-storage';

const initialState: Omit<TimerState, 'actions'> = {
  timerStatus: 'READY',
  studyLogId: '',
  timerId: '',
  isRunning: false,
  totalActiveMs: 0,
  displayTime: { hours: '00', mins: '00', secs: '00' },
  lastStartTimestamp: '',
  dailyRecords: {},
  todayGoal: '',
  review: '',
  tasks: [],
  saveTasks: [],
};

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      ...initialState,
      actions: {
        setTimerStatus: (status: TimerStatus) => set({ timerStatus: status }),
        setTimerId: (id) => set({ timerId: id }),
        setTotalActiveMs: (s) => set({ totalActiveMs: s }),
        setIsRunning: (running) => set({ isRunning: running }),
        setLastStartTimestamp: (time) => set({ lastStartTimestamp: time }),

        tick: () => {
          const { isRunning, lastStartTimestamp, dailyRecords, totalActiveMs } = get();

          if (!isRunning || !lastStartTimestamp) return;

          const now = new Date();
          const todayKey = now.toISOString().split('T')[0];

          // 1초마다 1000ms씩 증가
          const nextTotalMs = totalActiveMs + 1000;
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
            totalActiveMs: nextTotalMs,
            displayTime: { hours: h, mins: m, secs: s },
          });
        },

        // 타이머 종료시 splitTimes 값
        getSplitTimesForServer: () => {
          const { dailyRecords } = get();
          const now = new Date().toISOString();
          return Object.entries(dailyRecords).map(([date, ms]) => {
            const isToday = new Date().toISOString().split('T')[0] === date;

            return {
              date: isToday ? now : new Date(date).toISOString(),
              timeSpent: ms, // ms 단위를 반환 (전송 직전 유틸에서 s로 변환됨)
            };
          });
        },

        createSplitTime: (startTime) => {
          const start = new Date(startTime);
          const now = new Date();
          const diffMs = now.getTime() - start.getTime();
          return { date: now.toISOString(), timeSpent: Math.max(0, diffMs) };
        },

        timerReset: () => {
          useTimerStore.persist.clearStorage();
          set(initialState);
        },
        updateTodayGoal: (todayGoal) => set({ todayGoal }),
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
        syncTasksWithSaved: () => {
          const { saveTasks } = get();
          if (saveTasks.length > 0) set({ tasks: [...saveTasks] });
        },
        cancleCreateTimer: () => {
          set((state) => ({
            todayGoal: initialState.todayGoal,
            tasks: initialState.tasks,
          }));
        },
        cancleEditTasks: () => {
          set((state) => ({
            tasks: state.saveTasks,
          }));
        },
        cancleFinishTimer: () => {
          set((state) => ({
            timerStatus: 'PAUSE',
            tasks: state.saveTasks,
            review: initialState.review,
          }));
        },
        settingStartTimer: (lastStartTimestamp: string, studyLogId: string, timerId: string) => {
          set((state) => ({
            isRunning: true,
            lastStartTimestamp,
            studyLogId,
            timerId,
            timerStatus: 'RUNNING',
            saveTasks: state.tasks,
          }));
        },
        settingReStartTimer: () => {
          const now = new Date().toISOString();
          set({
            timerStatus: 'RUNNING',
            isRunning: true,
            lastStartTimestamp: now,
          });
        },

        settingPauseTimer: () => {
          set({
            timerStatus: 'PAUSE',
            isRunning: false,
          });
        },
        settingDoneTimer: () => {
          set({
            timerStatus: 'DONE',
            isRunning: false,
          });
        },
        snapshotTasks: () => {
          set((state) => ({
            saveTasks: state.tasks,
          }));
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
