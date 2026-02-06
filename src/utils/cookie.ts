import { NextResponse } from 'next/server';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/** 쿠키 삭제 함수 */
export const clearAuthCookies = (res: NextResponse) => {
  res.cookies.set('accessToken', '', { ...COOKIE_OPTIONS, maxAge: 0 });
  res.cookies.set('refreshToken', '', { ...COOKIE_OPTIONS, maxAge: 0 });
};

/** 쿠키 설정 함수 (로그인 시) */
export const setAuthCookies = (res: NextResponse, accessToken: string, refreshToken: string) => {
  res.cookies.set('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 }); // 1시간
  res.cookies.set('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 10 }); // 10일
};
