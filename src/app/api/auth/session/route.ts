// ... 상단 import 동일

import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { clearAuthCookies, setAuthCookies } from '@/utils/cookie';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // 1. 둘 다 없는 경우
  if (!accessToken && !refreshToken) {
    return NextResponse.json({ ok: false, message: 'No tokens found' }, { status: 401 });
  }

  // 2. Access 토큰은 없는데 Refresh 토큰만 살아있는 경우 -> 재발급 로직
  if (!accessToken && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}${API.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await refreshRes.json();

      if (!refreshRes.ok) {
        const errorRes = NextResponse.json(
          { ok: false, message: 'Refresh failed' },
          { status: 401 }
        );
        clearAuthCookies(errorRes); // 쿠키 삭제
        return errorRes;
      }

      // ✅ 성공 시: 백엔드에서 준 새 토큰들을 변수에 담음
      // 백엔드 응답 필드명이 각각 accessToken, refreshToken이라고 가정
      const { accessToken: newAccess, refreshToken: newRefresh } = data;

      const res = NextResponse.json({ ok: true });

      // ✅ 유틸리티 함수 사용: (응답객체, 새 엑세스, 새 리프레시)
      // 만약 백엔드에서 리프레시를 새로 안 주면 기존 refreshToken을 그대로 사용
      setAuthCookies(res, newAccess, newRefresh || refreshToken);

      return res;
    } catch (error) {
      return NextResponse.json({ ok: false, message: 'Internal Server Error' }, { status: 500 });
    }
  }

  // 3. Access 토큰이 이미 살아있는 경우
  return NextResponse.json({ ok: true });
}
