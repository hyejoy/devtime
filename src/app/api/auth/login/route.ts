// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { IS_PROD } from '@/config/env';
import { setAuthCookies } from '@/utils/cookie';

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

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const { success, message, accessToken, refreshToken, isFirstLogin, isDuplicateLogin } = data;

  // 1. 응답 생성 (클라이언트에 전달할 정보만 담기)
  const res = NextResponse.json({
    success,
    message,
    isFirstLogin,
    isDuplicateLogin,
  });

  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax' as const,
  };

  setAuthCookies(res, accessToken, refreshToken);

  return res;
}
