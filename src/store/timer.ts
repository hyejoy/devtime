import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useDialogStore } from './dialog';
import { API } from '@/constants/endpoints';
import { formatSplitTimesForServer } from '@/utils/timer';
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
    saveCurrentTime: () => Promise<void>;
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
export const STUDY_LOG_KEY = 'timer-storage';

const initialState = {
  //초기값
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
          const { isRunning, lastStartTimestamp, dailyRecords, totalActiveSeconds } = get();

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
          set(initialState);
        },

        // --- Task Actions ---
        updateTitle: (title) => set({ title }),
        updateReview: (review) => set({ review }),

        toggleDone: (id) =>
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
            ),
          })),

        addTask: (content) =>
          set((state) => ({
            tasks: [{ id: nanoid(), content, isCompleted: false }, ...state.tasks],
          })),

        updateTaskContent: (id, content) =>
          set((state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? { ...task, content } : task)),
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
          const { lastStartTimestamp, tasks, title, timerId, actions, timerStatus } = get();
          const now = new Date().toISOString();
          if (!lastStartTimestamp) {
            console.log('🚀처음 생성 시도');

            set({ saveTasks: [...tasks] });

            // ✅ 서버 에러 메시지에 따라 다시 문자열 배열로 변경
            // 만약 tasks가 비어있다면 서버에서 400을 뱉을 수 있으므로 체크 필요
            const taskList = tasks.map((t) => t.content);

            try {
              const res = await fetch(`${API.TIMER.TIMERS}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  todayGoal: title || '오늘의 목표', // 빈 값일 경우 기본값 부여 (400 방지)
                  tasks: taskList,
                }),
              });

              if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error('❌ 서버 상세 에러:', errorData);
                throw new Error(errorData.error?.message || '타이머 시작 실패');
              }

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
              console.error('타이머 생성 에러:', err);
            }
          } else if (timerId) {
            set({
              lastStartTimestamp: now,
              isRunning: true,
              timerStatus: 'RUNNING',
            });
            useDialogStore.getState().actions.closeDialog();
          }
        },
        // 2. 타이머 일시정지 (서버 동기화 포함)
        pauseTimerOnServer: async () => {
          const { timerId, isRunning, actions } = get();
          if (!timerId || !isRunning) return;

          // 화면 먼저 멈춤 (UX 최적화)
          set({ isRunning: false });

          // 서버에 현재까지의 기록 동기화
          const body = formatSplitTimesForServer(actions.getSplitTimesForServer());

          try {
            const res = await fetch(`${API.TIMER.ITEM(timerId)}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ splitTimes: body }),
            });

            // 1. 응답이 성공적이지 않을 때 (400, 500 등)
            if (!res.ok) {
              // 💡 await를 붙여서 데이터를 기다리고, 변수에 담아 출력합니다.
              const errorData = await res.json().catch(() => ({}));
              console.log('🛑 백엔드 에러 메세지:', errorData);

              // 만약 프록시 서버(route.ts)에서 에러를 { error: ... } 형태로 감쌌다면
              // console.log('🔍 상세 내용:', errorData.error);
            }

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
        saveCurrentTime: async () => {
          const { timerId, isRunning, actions } = get();
          if (!timerId || !isRunning) return;

          // 화면 먼저 멈춤 (UX 최적화)

          // 서버에 현재까지의 기록 동기화
          const body = formatSplitTimesForServer(actions.getSplitTimesForServer());

          try {
            const res = await fetch(`${API.TIMER.ITEM(timerId)}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ splitTimes: body }),
            });

            // 1. 응답이 성공적이지 않을 때 (400, 500 등)
            if (!res.ok) {
              // 💡 await를 붙여서 데이터를 기다리고, 변수에 담아 출력합니다.
              const errorData = await res.json().catch(() => ({}));
              console.log('🛑 백엔드 에러 메세지:', errorData);

              // 만약 프록시 서버(route.ts)에서 에러를 { error: ... } 형태로 감쌌다면
              // console.log('🔍 상세 내용:', errorData.error);
            }

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
          const { timerId, review, tasks, actions } = get();

          if (!timerId) return;

          const cleanReview = review.trim();
          if (cleanReview.length < 15) return;

          const splitTimes = formatSplitTimesForServer(actions.getSplitTimesForServer());

          const taskList = tasks.map((t) => ({
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
              console.log('ok>>>>>>', res);

              actions.timerReset(); // 모든 상태 초기화
              useDialogStore.getState().actions.closeDialog();
            } else {
              // 400 에러의 구체적 원인 파악을 위해 에러 바디 로그 출력
              const errorDetail = await res.json();
              console.error('서버가 거절한 이유:', errorDetail);
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
            const res = await fetch(`${API.STUDYLOGS.GET_DETAIL_STUDY_LOG(studyLogId)}`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            const result = await res.json(); // result는 { success: true, data: {...} } 형태
            if (result.success && result.data && Array.isArray(result.data.tasks)) {
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
          console.log('보내는 요청 : ', JSON.stringify(requestBody));

          try {
            const res = await fetch(`${API.TASK.UPDATE(studyLogId)}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ tasks: requestBody }),
            });

            // 2. 스터디 로그 목록 가져오기 테스트
            // 💡 괄호()를 붙여서 함수를 실행해야 URL이 나옵니다!
            const testUrl = API.STUDYLOGS.GET_STUDY_LOGS();
            console.log('🔍 호출할 URL:', testUrl);

            const test = await fetch(testUrl, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });

            // 💡 fetch 응답 객체 자체를 찍으면 내용이 안 보일 수 있으니 JSON으로 파싱해서 찍어보세요.
            const testData = await test.json().catch(() => ({}));
            console.log('✅ test 결과 데이터:', testData);

            /////
            if (res.status === 401 || res.url.includes('/auth/')) {
              console.warn('세션이 만료되어 로그인이 필요합니다.');
              // 필요한 경우 로그인 페이지로 이동시키거나 알림 처리
              return;
            }
            if (!res.ok) throw new Error('일시정지 동기화 실패');
          } catch (err) {
            console.log('할 일 목록 전체 업데이트 실패', err);
          }
        },
      },
    }),
    {
      name: STUDY_LOG_KEY,
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
