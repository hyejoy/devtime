'use client';

import { API } from '@/constants/endpoints';
import { useTimerStore } from '@/store/timerStore';
import { LogOut } from 'lucide-react';

export default function Logout() {
  // 타이머 초기화 액션
  const timerReset = useTimerStore((state) => state.actions.timerReset);

  const handleLogout = async () => {
    try {
      // 1. Next.js API Route 호출 (쿠키 삭제 등 서버 세션 종료)
      const res = await fetch(`${API.AUTH.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.ok) {
        // console.log('로그아웃 성공!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('로그아웃 서버 응답 실패:', errorData);
      }
    } catch (err) {
      console.error('로그아웃 네트워크 에러:', err);
    } finally {
      // 2. 서버 응답 여부와 상관없이 클라이언트 데이터 강제 청소

      // ✅ Zustand 상태 초기화 (메모리 상의 데이터 삭제)
      timerReset();

      // ✅ 로컬스토리지 삭제
      window.localStorage.clear();

      // ✅ 세션스토리지 삭제
      // window.sessionStorage.clear();

      // 3. 페이지 이동
      window.location.href = '/login';
    }
  };

  return (
    <button
      className="flex w-30 cursor-pointer items-center gap-3 pt-4 leading-normal text-gray-600"
      type="button"
      onClick={handleLogout}
    >
      <LogOut className="h-4 w-[15px]" /> 로그아웃
    </button>
  );
}
