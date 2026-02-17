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

  // 기존 인증 쿠키 설정
  // isFirstLogin 쿠키  (미들웨어 확인용)
  // httpOnly: false로 설정하면 클라이언트에서도 읽을 수 있고,
  // httpOnly: true로 설정하면 미들웨어(서버)에서만 확인 가능합니다.
  // 보안을 위해 true를 권장하며, 미들웨어는 서버 사이드라 true여도 읽을 수 있습니다.
  setAuthCookies(res, accessToken, refreshToken);

  res.cookies.set('isFirstLogin', String(isFirstLogin), {
    path: '/',
    httpOnly: true, // 보안 강화
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: 60 * 10, // 10분만 유지 (프로필 설정 완료 시점까지만 필요하므로)
  });

  setAuthCookies(res, accessToken, refreshToken);

  return res;
}
