import { Profile, TechStackItem } from '@/types/profile';
import { create } from 'zustand';
import { combine } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const initialState: Profile = {
  email: '',
  nickname: '',
  profile: {
    career: '',
    purpose: '',
    goal: '',
    techStacks: [] as TechStackItem[],
    profileImage: undefined,
  },
};

export type ProfileUpdatePayload = NonNullable<Profile['profile']>;

export const useProfileStore = create(
  immer(
    combine({ ...initialState, password: '', isLogin: false }, (set) => ({
      actions: {
        setLogin: (value: boolean) =>
          set((state) => {
            state.isLogin = value;
          }),

        /** 💡 서버에서 받아온 전체 정보를 스토어에 세팅하는 액션 */
        initProfile: (data: Profile) =>
          set((state) => {
            state.email = data.email;
            state.nickname = data.nickname;
            state.profile = data.profile;
          }),

        /** 개별 필드 수정용 */
        setProfile: <K extends keyof ProfileUpdatePayload>(
          key: K,
          value: ProfileUpdatePayload[K]
        ) =>
          set((state) => {
            if (!state.profile) {
              state.profile = initialState.profile;
            }
            state.profile[key] = value;
          }),

        resetProfile: () => {
          set((state) => {
            state.email = initialState.email;
            state.nickname = initialState.nickname;
            state.profile = initialState.profile;
            state.isLogin = false;
          });
        },

        setPassword: (password: string) => {
          set((state) => (state.password = password));
        },
      },
    }))
  )
);

/** 💡 Selector Hooks - 외부에서 편하게 쓰기 위함 */
export const useIsLogin = () => useProfileStore((state) => state.isLogin);
export const useProfileActions = () => useProfileStore((state) => state.actions);
export const useUserInfo = () =>
  useProfileStore((state) => ({
    email: state.email,
    nickname: state.nickname,
    profile: state.profile,
  }));
