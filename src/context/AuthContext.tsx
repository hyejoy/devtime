'use client';

import { API } from '@/constants/endpoints';
import { ReactNode, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation'; // useRouter 추가
import { profileService } from '@/services/profileService';
import { useIsLogin, useProfileActions } from '@/store/profileStore';
import { Profile } from '@/types/profile';
import { useTimerStore } from '@/store/timerStore';
import { timerService } from '@/services/timerService';

const EXCLUDING_PATH = ['/', '/login', '/signup'];

export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { initProfile, setLogin } = useProfileActions();
  const { timerStatus, timerId: currentTimerId, actions } = useTimerStore();
  const { getSplitTimesForServer } = actions;
  const isLogin = useIsLogin();

  /** ✅ 세션 체크 및 프로필 업데이트 로직 분리 (재사용을 위해 useCallback 사용) */
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API.AUTH.SESSION}`);

      if (res.ok) {
        // 세션이 유효할 때, 로그인 상태가 아니거나 정보 갱신이 필요하면 실행
        const resData = await profileService.get();

        const formattedData: Profile = {
          email: resData.email,
          nickname: resData.nickname,
          profile: {
            career: (resData.profile?.career || '') as any,
            purpose: (resData.profile?.purpose || '') as any,
            goal: (resData.profile?.goal || '') as any,
            techStacks: resData.profile?.techStacks || [],
            profileImage: resData.profile?.profileImage || '',
          },
        };

        initProfile(formattedData);
        setLogin(true);
        localStorage.setItem('user-nickname', resData.nickname);
      } else {
        // 세션 만료 시
        setLogin(false);
        await fetch(`${API.AUTH.LOGOUT}`, {
          method: 'POST',
          credentials: 'include',
        });
        router.push('/login'); // window.location.href 대신 router 사용 권장
      }
    } catch (err) {
      console.error('세션체크 중 에러 발생', err);
    }
  }, [initProfile, setLogin, router]);

  /** 1️⃣ 페이지 이동 시 세션 체크 */
  useEffect(() => {
    const isExclude = EXCLUDING_PATH.find((path) => path === pathname);
    if (isExclude) return;

    checkSession();
  }, [pathname, checkSession]);

  /** 타이머가 동작 중일 때의 세션 관리 */
  useEffect(() => {
    const isExclude = EXCLUDING_PATH.find((path) => path === pathname);
    if (isExclude || !isLogin) return;

    const TEN_MINUTES = 10 * 60 * 1000;

    const syncData = async () => {
      if (timerStatus !== 'READY') {
        // 1. 타이머가 돌고 있다면? -> 타이머 업데이트가 곧 세션 연장
        try {
          console.log('🔄 타이머 동기화 중 (자동 세션 연장 겸용)');
          // 현재 타이머 ID와 쪼개진 시간(splitTimes) 등을 가져와서 전송
          await timerService.update(currentTimerId, {
            splitTimes: getSplitTimesForServer()?.splitTimes || [],
          });

          // 업데이트 성공 시 세션 체크 API를 추가로 호출할 필요 없이
          // 묵시적으로 세션이 연장되도록 서버가 설정되어 있어야 함.
          // 만약 서버가 타이머 API로 세션 연장을 안 해준다면 아래 코드 추가:
          await fetch(`${API.AUTH.SESSION}`);
        } catch (e) {
          console.error('동기화 실패', e);
        }
      } else {
        // 2. 타이머가 안 돌고 있다면? -> 기존처럼 세션 체크만 진행
        checkSession();
      }
    };

    const sessionInterval = setInterval(syncData, TEN_MINUTES);
    return () => clearInterval(sessionInterval);
  }, [pathname, isLogin, timerStatus, checkSession]);

  return <>{children}</>;
}
