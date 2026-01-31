import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useDialogStore } from './dialog';
import { API } from '@/constants/endpoints';

// --- Types ---

export type Task = {
  id: string;
  content: string;
  isCompleted: boolean;
};

interface SplitTime {
  date: string; // ISO String
  timeSpent: number; // 서버 호환을 위해 초(s) 단위 유지
}

interface DisplayTime {
  hours: string;
  mins: string;
  secs: string;
}

type TimerStatus = 'READY' | 'RUNNING' | 'DONE';

interface TimerState {
  // Timer 관련
  timerStatus: TimerStatus;
  studyLogId: string;
  timerId: string;
  isRunning: boolean;
  dailyRecords: Record<string, number>;
  totalActiveSeconds: number;
  lastStartTimestamp: string | undefined;
  displayTime: DisplayTime;

  // Task 관련 (통합됨)
  title: string;
  review: string;
  tasks: Task[];
  saveTasks: Task[];

  actions: {
    //
    setTimerStatus: (status: TimerStatus) => void;
    setTimerId: (id: string) => void;
    setTotalActiveSeconds: (s: number) => void;
    setIsRunning: (running: boolean) => void;
    setLastStartTimestamp: (time: string | undefined) => void;

    // Timer Logic
    tick: () => void;
    timerReset: () => void; // 전체 초기화 (Task 포함)
    createSplitTime: (startTime: string) => SplitTime;
    getSplitTimesForServer: () => SplitTime[];

    /**API */
    // 시작, 일시정지, 정지
    startTimerOnServer: () => Promise<void>;
    pauseTimerOnServer: () => Promise<void>;
    finishTimerOnServer: () => Promise<void>;
    // 할일 목록 fetch / update
    updateTaskList: () => Promise<void>;
    fetchTaskList: () => Promise<void>;
    // Task Logic (통합됨)
    updateTitle: (title: string) => void;
    updateReview: (review: string) => void;
    toggleDone: (id: string) => void;
    addTask: (content: string) => void;
    updateTaskContent: (updateId: string, content: string) => void;
    deletedTask: (deletedId: string) => void;
    resetGoal: () => void; // 타이틀 + 할 일 목록 초기화
    resetReview: () => void; // 회고 초기화
    syncTasksWithSaved: () => void;
  };
}

// --- Store ---
export const STUDY_LOG_KEY = 'study_log_id';
export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      timerStatus: 'READY',
      studyLogId: '',
      timerId: '',
      isRunning: false,
      isDone: false,
      dailyRecords: {},
      totalActiveSeconds: 0,
      lastStartTimestamp: undefined,
      displayTime: { hours: '00', mins: '00', secs: '00' },
      title: '',
      review: '',
      tasks: [],
      saveTasks: [],
      actions: {
        // --- Timer Actions ---
        setTimerStatus: (status) => set({ timerStatus: status }),
        setTimerId: (id) => set({ timerId: id }),
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
          // 10분(600초)마다 세션 연장 요청
          if (totalActiveSeconds > 0 && totalActiveSeconds % 600 === 0) {
            fetch('/api/auth/refresh', { credentials: 'include' });
          }
          const now = new Date();
          const todayKey = now.toISOString().split('T')[0];

          const nextTotalSeconds = totalActiveSeconds + 1;
          const updateRecords = { ...dailyRecords };
          updateRecords[todayKey] = (updateRecords[todayKey] || 0) + 1;

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
            displayTime: { hours: h, mins: m, secs: s },
          });
        },

        getSplitTimesForServer: () => {
          const { dailyRecords } = get();
          return Object.entries(dailyRecords).map(([date, seconds]) => ({
            date: new Date(date).toISOString(),
            timeSpent: seconds,
          }));
        },

        createSplitTime: (startTime) => {
          const start = new Date(startTime);
          const now = new Date();
          const diffMs = now.getTime() - start.getTime();
          const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));
          return { date: now.toISOString(), timeSpent: diffSeconds };
        },

        timerReset: () => {
          // ✅ 초기화 시 로컬스토리지에서도 삭제
          localStorage.removeItem(STUDY_LOG_KEY);
          set({
            studyLogId: '',
            timerId: '',
            isRunning: false,
            totalActiveSeconds: 0,
            displayTime: { hours: '00', mins: '00', secs: '00' },
            lastStartTimestamp: undefined,
            dailyRecords: {},
            title: '',
            review: '',
            tasks: [],
            saveTasks: [],
          });
        },

        // --- Task Actions ---
        updateTitle: (title) => set({ title }),
        updateReview: (review) => set({ review }),

        toggleDone: (id) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? { ...task, isCompleted: !task.isCompleted }
                : task
            ),
          })),

        addTask: (content) =>
          set((state) => ({
            tasks: [
              { id: nanoid(), content, isCompleted: false },
              ...state.tasks,
            ],
          })),

        updateTaskContent: (id, content) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, content } : task
            ),
          })),

        deletedTask: (id) =>
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          })),

        resetGoal: () => set({ title: '', tasks: [] }),
        resetReview: () => set({ review: '' }),
        // 수정 모달을 열 때 호출
        syncTasksWithSaved: () => {
          const { saveTasks } = get();
          if (saveTasks.length > 0) {
            set({ tasks: [...saveTasks] }); // 저장된 스냅샷을 현재 편집 리스트로 복구
          }
        },

        /*** 🚩 API Actions ***/
        startTimerOnServer: async () => {
          const { lastStartTimestamp, tasks, title, timerId } = get();
          const now = new Date().toISOString();

          // 1. 처음 생성하는 경우 (스냅샷 저장 및 서버 전송)
          if (!lastStartTimestamp) {
            console.log('처음 생성하는 경우');

            // 타이머 시작 시점의 tasks를 saveTasks에 복사 (스냅샷)
            set({ saveTasks: [...tasks] });
            const taskList = tasks.map((t) => t.content);

            try {
              const res = await fetch(`${API.TIMER.TIMERS}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ todayGoal: title, tasks: taskList }),
              });

              if (!res.ok) throw new Error('타이머 시작 실패');

              const data = await res.json();
              console.log('🍀🧡res :', data);
              // ✅ 로컬스토리지에 저장
              localStorage.setItem(STUDY_LOG_KEY, data.studyLogId);
              set({
                studyLogId: data.studyLogId,
                timerId: data.timerId,
                lastStartTimestamp: now,
                isRunning: true,
              });

              useDialogStore.getState().actions.closeDialog();
            } catch (err) {
              console.error('타이머 생성 에러:', err);
            }
          }
          // 2. 일시정지 후 다시 시작하는 경우
          else if (timerId) {
            console.log('일시 정지 후 다시 시작');
            set({
              lastStartTimestamp: now,
              isRunning: true,
            });
          }
        },

        // 2. 타이머 일시정지 (서버 동기화 포함)
        pauseTimerOnServer: async () => {
          const { timerId, isRunning, actions } = get();
          if (!timerId || !isRunning) return;

          // 화면 먼저 멈춤 (UX 최적화)
          set({ isRunning: false });

          // 서버에 현재까지의 기록 동기화
          const body = actions.getSplitTimesForServer();
          try {
            const res = await fetch(`${API.TIMER.ITEM(timerId)}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ splitTimes: body }),
            });

            if (res.status === 401 || res.url.includes('/auth/')) {
              console.warn('세션이 만료되어 로그인이 필요합니다.');
              // 필요한 경우 로그인 페이지로 이동시키거나 알림 처리
              return;
            }
            if (!res.ok) throw new Error('일시정지 동기화 실패');
          } catch (err) {
            console.error('일시정지 중 오류:', err);
          }
        },

        // 3. 타이머 최종 종료 (회고 및 할 일 목록 제출)
        finishTimerOnServer: async () => {
          const { timerId, review, saveTasks, actions } = get();
          console.log('저장된 테스크 목록ㅡ', saveTasks);

          if (!timerId) return;

          if (review.length < 15) {
            alert('회고를 15자 이상 작성해주세요!');
            return;
          }

          const splitTimes = actions.getSplitTimesForServer();
          const taskList = saveTasks.map((t) => ({
            content: t.content,
            isCompleted: t.isCompleted,
          }));

          try {
            const res = await fetch(`${API.TIMER.STOP(timerId)}`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                splitTimes,
                review,
                tasks: taskList,
              }),
            });

            if (res.ok) {
              actions.timerReset(); // 모든 상태 초기화
              useDialogStore.getState().actions.closeDialog();
            } else {
              throw new Error('종료 처리 실패');
            }
          } catch (err) {
            console.error('타이머 종료 중 오류:', err);
          }
        },
        fetchTaskList: async () => {
          try {
            const { studyLogId } = get();
            if (!studyLogId) return;
            const res = await fetch(
              `${API.STUDYLOGS.GET_STUDY_LOG(studyLogId)}`,
              {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
              }
            );
            const result = await res.json(); // result는 { success: true, data: {...} } 형태
            if (
              result.success &&
              result.data &&
              Array.isArray(result.data.tasks)
            ) {
              const fetchedTasks = result.data.tasks;
              set({
                tasks: fetchedTasks,
                saveTasks: fetchedTasks,
                title: result.data.todayGoal || get().title, // 목표 제목도 동기화
              });
            } else {
              console.warn('응답 구조가 예상과 다릅니다:', result);
            }
          } catch (err) {
            console.log('할 일 목록 전체 업데이트 실패');
          }
        },

        updateTaskList: async () => {
          const { studyLogId, tasks } = get();
          if (!studyLogId) return;
          const requestBody = tasks.map((task) => ({
            content: task.content,
            isCompleted: task.isCompleted,
          }));

          set({ saveTasks: [...tasks] });
          console.log('req 🩵:', requestBody);
          try {
            const res = await fetch(`${API.TASK.UPDATE(studyLogId)}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tasks: requestBody }),
            });

            if (res.status === 401 || res.url.includes('/auth/')) {
              console.warn('세션이 만료되어 로그인이 필요합니다.');
              // 필요한 경우 로그인 페이지로 이동시키거나 알림 처리
              return;
            }
            if (!res.ok) throw new Error('일시정지 동기화 실패');
          } catch (err) {
            console.log('할 일 목록 전체 업데이트 실패');
          }
        },
      },
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        studyLogId: state.studyLogId,
        timerId: state.timerId,
        timerStatus: state.timerStatus,
        totalActiveSeconds: state.totalActiveSeconds,
        tasks: state.tasks,
        saveTasks: state.saveTasks,
        title: state.title,
        dailyRecords: state.dailyRecords,
        lastStartTimestamp: state.lastStartTimestamp,
      }),
    }
  )
);

// --- Selectors ---
export const useTimerStauts = () => useTimerStore((state) => state.timerStatus);
export const useStudyLogId = () => useTimerStore((state) => state.studyLogId);
export const useTimerId = () => useTimerStore((state) => state.timerId);
export const useIsRunning = () => useTimerStore((state) => state.isRunning);
export const useDailyRecords = () =>
  useTimerStore((state) => state.dailyRecords);
export const useTotalSeconds = () =>
  useTimerStore((state) => state.totalActiveSeconds);
export const useLastStartTimestamp = () =>
  useTimerStore((state) => state.lastStartTimestamp);
export const useDisplayTime = () => useTimerStore((state) => state.displayTime);

export const useTaskTitle = () => useTimerStore((state) => state.title);
export const useTaskReview = () => useTimerStore((state) => state.review);
export const useTasks = () => useTimerStore((state) => state.tasks);
export const useSaveTasks = () => useTimerStore((state) => state.saveTasks);

export const useTimerActions = () => useTimerStore((state) => state.actions);
