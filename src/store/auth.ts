// import { create } from 'zustand';
// import { API } from '@/constants/endpoints';

// interface AuthState {
//   isInitialized: boolean;
//   isLoggedIn: boolean;
//   actions: {
//     // 값 직접 세팅용
//     setIsLoggedIn: (value: boolean) => void;
//     setInitialized: (value: boolean) => void;

//     // 비즈니스 로직용
//     checkSession: () => Promise<void>;
//     login: (body: any) => Promise<any>; // 결과 처리를 위해 반환형 추가
//     logout: () => Promise<void>;
//   };
// }

// export const useAuthStore = create<AuthState>((set) => ({
//   isInitialized: false,
//   isLoggedIn: false,
//   actions: {
//     // 1. 단순 값 세팅 함수들 추가
//     setIsLoggedIn: (value) => set({ isLoggedIn: value }),
//     setInitialized: (value) => set({ isInitialized: value }),

//     // 2. 세션 체크
//     checkSession: async () => {
//       try {
//         const res = await fetch(`${API.AUTH.SESSION}`);
//         if (res.ok) {
//           set({ isLoggedIn: true, isInitialized: true });
//         } else {
//           set({ isLoggedIn: false, isInitialized: true });
//         }
//       } catch (error) {
//         set({ isLoggedIn: false, isInitialized: true });
//       }
//     },

//     // 3. 로그인 (컴포넌트에서 결과를 핸들링할 수 있게 response 반환)
//     login: async (body) => {
//       try {
//         const res = await fetch(`${API.AUTH.LOGIN}`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(body),
//           credentials: 'include',
//         });
//         const data = await res.json();

//         // 성공 시 상태 업데이트
//         if (res.ok && !data.isDuplicateLogin) {
//           set({ isLoggedIn: true });
//         }
//         return { ok: res.ok, data }; // 컴포넌트에서 data.isDuplicateLogin 등을 체크할 수 있게 함
//       } catch (error) {
//         console.error('Login error:', error);
//         throw error;
//       }
//     },

//     // 4. 로그아웃
//     logout: async () => {
//       try {
//         await fetch(`${API.AUTH.LOGOUT}`, {
//           method: 'POST',
//           credentials: 'include',
//         });
//       } finally {
//         // 성공 실패 여부와 상관없이 클라이언트 상태는 로그아웃으로 간주
//         set({ isLoggedIn: false });
//         window.location.href = '/login';
//       }
//     },
//   },
// }));

// // 편리한 사용을 위한 Selector Hooks
// export const useIsLoggedIn = () => useAuthStore((state) => state.isLoggedIn);
// export const useIsInitialized = () =>
//   useAuthStore((state) => state.isInitialized);
// export const useAuthActions = () => useAuthStore((state) => state.actions);
