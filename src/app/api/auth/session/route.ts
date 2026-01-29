import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;
  const isProd = process.env.NODE_ENV === 'development';

  // 쿠키 옵션 공통 설정
  const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax' as const,
    path: '/',
  };

  // 1. 둘 다 없는 경우 -> 인증 실패 반환
  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { ok: false, message: 'No tokens found' },
      { status: 401 }
    );
  }

  // 2. Access 토큰은 없는데 Refresh 토큰은 있는 경우 -> 토큰 재발급 시도
  if (!accessToken && refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE_URL}${API.AUTH.REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await refreshRes.json();

      if (!refreshRes.ok) {
        // 재발급 실패 시 기존 쿠키 싹 제거
        const errorRes = NextResponse.json(
          { ok: false, message: 'Refresh failed' },
          { status: 401 }
        );
        errorRes.cookies.set('accessToken', '', {
          ...cookieOptions,
          maxAge: 0,
        });
        errorRes.cookies.set('refreshToken', '', {
          ...cookieOptions,
          maxAge: 0,
        });
        return errorRes;
      }

      // 재발급 성공 -> 새로운 쿠키 굽기
      const res = NextResponse.json({ ok: true });

      // 아까 결정한 만료 시간 적용 (Access: 1시간, Refresh: 10일)
      res.cookies.set('accessToken', data.accessToken, {
        ...cookieOptions,
        maxAge: 60 * 60,
      });
      res.cookies.set('refreshToken', data.refreshToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 24 * 10,
      });

      return res;
    } catch (error) {
      return NextResponse.json(
        { ok: false, message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }

  // 3. Access 토큰이 살아있는 경우 -> 유효한 세션
  return NextResponse.json({ ok: true });
}
