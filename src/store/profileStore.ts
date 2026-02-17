import { Profile, ProfileField, ProfilePostRes } from '@/types/profile';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface ProfileState extends Profile {
  isLogin: boolean;
  isDropdownOpen: boolean;
  isFirstLogin: boolean;
  actions: {
    setLogin: (value: boolean) => void;
    initProfile: (data: Profile) => void;
    setProfile: <K extends keyof ProfileField>(key: K, value: ProfileField[K]) => void;
    resetProfile: () => void;
    setDropdownClose: () => void;
    setDropdownOpen: () => void;
    setIsFirstLogin: (isFirst: boolean) => void;
  };
}

const initialState: Omit<ProfileState, 'actions'> = {
  email: '',
  nickname: '',
  profile: {
    career: '' as ProfilePostRes['career'],
    purpose: '' as ProfilePostRes['purpose'],
    goal: '',
    techStacks: [],
    profileImage: undefined,
  }, // ✅ 여기서 as ProfilePostRes를 제거하거나 명확히 일치시킵니다.
  isLogin: false,
  isDropdownOpen: false,
  isFirstLogin: false,
};

export const useProfileStore = create<ProfileState>()(
  immer((set) => ({
    ...initialState,
    actions: {
      setLogin: (value) =>
        set((state) => {
          state.isLogin = value;
        }),
      initProfile: (data) =>
        set((state) => {
          state.email = data.email;
          state.nickname = data.nickname;
          state.profile = data.profile;
        }),
      setProfile: (key, value) =>
        set((state) => {
          if (!state.profile) {
            state.profile = { ...initialState.profile } as ProfilePostRes;
          }
          // Immer 내부에서 안전하게 할당하기 위해 any 사용 또는 인덱스 시그니처 대응
          (state.profile as any)[key] = value;
        }),
      resetProfile: () =>
        set((state) => {
          state.email = initialState.email;
          state.nickname = initialState.nickname;
          state.profile = { ...initialState.profile } as ProfilePostRes;
          state.isLogin = false;
        }),
      setDropdownClose: () =>
        set((state) => {
          state.isDropdownOpen = false;
        }),
      setDropdownOpen: () =>
        set((state) => {
          state.isDropdownOpen = true;
        }),
      setIsFirstLogin: (isFirst: boolean) =>
        set((state) => {
          state.isFirstLogin = isFirst;
        }),
    },
  }))
);

export const useIsLogin = () => useProfileStore((state) => state.isLogin);
export const useIsFirstLogin = () => useProfileStore((state) => state.isFirstLogin);
export const useProfileActions = () => useProfileStore((state) => state.actions);
