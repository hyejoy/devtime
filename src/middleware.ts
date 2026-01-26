// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  console.log('pathname: ', pathname);

  const accessToken = req.cookies.get('accessToken')?.value;
  console.log('accessToken: ', accessToken);

  const isLoginPage = pathname.startsWith('/login');
  const isProtectedPage =
    pathname.startsWith('/timer') || pathname.startsWith('/profile');

  console.log('isProtectedPage: ', isProtectedPage);
  // ✅ 로그인 상태인데 로그인 페이지 접근
  if (isLoginPage && accessToken) {
    console.log('✅ 로그인 상태인데 로그인 페이지 접근');

    return NextResponse.redirect(new URL('/timer', req.url));
  }

  // ✅ 보호 페이지인데 로그인 안 됨
  if (isProtectedPage && !accessToken) {
    console.log(' ✅ 보호 페이지인데 로그인 안 됨');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // 그 외 전부 통과

  console.log('그 외 전부 통과');
  return NextResponse.next();
}
// TODO:케이스(블랙리스트)로 적용
// → https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher
export const config = {
  matcher: ['/timer/:path*', '/profile/:path*'],
};
