import { requestRefreshToken } from '@/services/login';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectPath = searchParams.get('redirect') || '/timer';
  const refreshToken = req.cookies.get('refreshToken')?.value;
  const isProd = process.env.NODE_ENV === 'development';

  // 쿠키를 삭제하고 로그인 페이지로 보내는 공통 함수
  const handleAuthFailure = () => {
    const res = NextResponse.redirect(new URL('/login', req.url));
    res.cookies.set('accessToken', '', { maxAge: 0 });
    res.cookies.set('refreshToken', '', { maxAge: 0 });
    return res;
  };

  // 1. 리프레시 토큰 자체가 없는 경우
  if (!refreshToken) {
    return handleAuthFailure();
  }

  try {
    const refreshRes = await requestRefreshToken(refreshToken);
    const refreshData = await refreshRes.json();

    // 2. 백엔드에서 갱신 거부 (토큰 만료 등)
    if (!refreshRes.ok) {
      console.error('❌ 토큰 갱신 실패:', refreshData.message);
      return handleAuthFailure();
    }

    // 3. 성공 시 새로운 토큰 설정 및 원래 페이지로 이동
    const res = NextResponse.redirect(new URL(redirectPath, req.url));

    // 만료 시간 설정
    const ACCESS_TOKEN_MAX_AGE = 60 * 60; // 1시간
    const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 10; // 10일

    const cookieOptions = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
    };

    res.cookies.set('accessToken', refreshData.accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_TOKEN_MAX_AGE,
    });

    res.cookies.set('refreshToken', refreshData.refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });

    console.log('토큰 갱신 성공 > 원래 페이지로 이동:', redirectPath);
    return res;
  } catch (error) {
    console.error('리프레시 라우트 에러:', error);
    return handleAuthFailure();
  }
}
