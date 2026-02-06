import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  const isLoginPage = ['/', '/login'].some(
    (path) => pathname === path || pathname.startsWith('/login')
  );
  const isProtectedPage =
    pathname.startsWith('/timer') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/dashboard');

  const hasAccess = Boolean(accessToken);
  const hasRefresh = Boolean(refreshToken);

  // 1. 보호된 페이지 접근 시
  if (isProtectedPage) {
    // Access 토큰은 없는데 Refresh 토큰만 있는 경우 -> 토큰 갱신하러 가기
    if (!hasAccess && hasRefresh) {
      console.log('🔄 Access 토큰 만료, Refresh 토큰으로 갱신 시도');
      return NextResponse.redirect(new URL(`/api/auth/refresh?redirect=${pathname}`, req.url));
    }

    // 둘 다 없는 경우 -> 로그인으로
    if (!hasAccess && !hasRefresh) {
      console.log('🚫 토큰 없음, 메인 페이지로 이동');
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // 2. 이미 로그인된 상태에서 로그인 페이지 접근 시 -> 홈(타이머)으로
  if (isLoginPage && (hasAccess || hasRefresh)) {
    console.log('이미 로그인됨, 타이머 페이지로 리다이렉트');
    return NextResponse.redirect(new URL('/timer', req.url));
  }

  return NextResponse.next();
}

// TODO:케이스(블랙리스트)로 적용
// → https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  matcher: [
    '/', // 루트 경로 추가
    '/login',
    '/timer/:path*',
    '/profile/:path*',
    '/dashboard/:path*',
  ],
};
