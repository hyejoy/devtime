// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { IS_PROD } from '@/config/env';

export async function POST(req: NextRequest) {
  const body = await req.json();

  // const backendRes = await fetch(`${API_BASE_URL}${API.AUTH.LOGIN}`, {
  const backendRes = await fetch(`${API_BASE_URL}${API.AUTH.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  console.log('🩵 req', body);
  console.log('🧡 res', data);

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const {
    success,
    message,
    accessToken,
    refreshToken,
    isFirstLogin,
    isDuplicateLogin,
  } = data;

  // 1. 응답 생성 (클라이언트에 전달할 정보만 담기)
  const res = NextResponse.json({
    success,
    message,
    isFirstLogin,
    isDuplicateLogin,
  });

  // 2. 만료 시간 설정
  // 예: AccessToken 1시간(3600초), RefreshToken 10일
  const ACCESS_TOKEN_MAX_AGE = 60 * 60;
  const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 10;

  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
  };

  // 3. 쿠키 굽기
  res.cookies.set('accessToken', accessToken, {
    ...cookieOptions,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });

  res.cookies.set('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });

  return res;
}
