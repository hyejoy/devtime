'use client';

import { API } from '@/constants/endpoints';
import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { profileService } from '@/services/profileService';
import { useIsLogin, useProfileActions, useProfileStore } from '@/store/profileStore';
import { Profile } from '@/types/profile';

const EXCLUDING_PATH = ['/', '/login', '/signup'];

export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { initProfile, setLogin } = useProfileActions();
  const isLogin = useIsLogin();
  useEffect(() => {
    const isExclude = EXCLUDING_PATH.find((path) => path === pathname);
    if (isExclude) return;

    const initSession = async () => {
      try {
        const res = await fetch(`${API.AUTH.SESSION}`);

        if (res.ok) {
          if (!isLogin) {
            const resData = await profileService.get();

            // 2. 스토어 규격에 맞게 객체 재구성
            const formattedData: Profile = {
              email: resData.email,
              nickname: resData.nickname,
              profile: {
                career: resData.profile?.career || '',
                purpose: resData.profile?.purpose || '',
                goal: (resData.profile?.goal || '') as any,
                techStacks: resData.profile?.techStacks || [],
                profileImage: resData.profile?.profileImage || '',
              },
            };

            // 3. 업데이트
            initProfile(formattedData);
            setLogin(true);
            localStorage.setItem('user-nickname', resData.nickname);
          }
        } else {
          setLogin(false);
          await fetch(`${API.AUTH.LOGOUT}`, {
            method: 'POST',
            credentials: 'include',
          });
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('세션체크 중 에러 발생', err);
      }
    };

    initSession();
  }, [pathname, isLogin, initProfile, setLogin]);

  return <>{children}</>;
}
