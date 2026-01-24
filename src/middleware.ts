import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const pathname = req.nextUrl.pathname;
  const isLoginPage = pathname === '/login';

  /**  인증 / 인가 처리 (Middleware) */
  // 로그인 안 했는데 보호 페이지 접근
  if (!accessToken && pathname.startsWith('/timer')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 로그인 했는데 로그인 페이지 접근
  if (accessToken && isLoginPage) {
    return NextResponse.redirect(new URL('/timer', req.url));
  }

  return NextResponse.next();
}

// TODO:케이스(블랙리스트)로 적용
// → https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  // 미들웨어 어디에 적용할지 정하는 필터
  matcher: [
    '/login',
    '/timer/:path*',
    '/dashboard/:path*',
    '/mypage/:path*',
    '/profile/:path*',
    '/ranking/:path*',
  ],

