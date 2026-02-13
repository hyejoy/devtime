'use client';

import { API } from '@/constants/endpoints';
import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { profileService } from '@/services/profileService';
import { TechStackItem } from '@/types/profile';
import { useIsLogin, useProfileActions, useProfileStore } from '@/store/profileStore';

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

            /** 💡 데이터 변환 로직 (Transform) */
            // 1. string[]을 TechStackItem[]로 변환
            const transformedTechStacks: TechStackItem[] =
              resData.profile?.techStacks?.map((name, index) => ({
                id:
                  typeof crypto.randomUUID !== 'undefined'
                    ? crypto.randomUUID()
                    : Math.random().toString(36).substring(2, 11),
                name: name,
              })) || [];

            // 2. 스토어 규격에 맞게 객체 재구성
            const formattedData = {
              email: resData.email,
              nickname: resData.nickname,
              profile: {
                career: resData.profile?.career || '',
                purpose: resData.profile?.purpose || '취업 준비',
                goal: resData.profile?.goal || '',
                techStacks: transformedTechStacks,
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
