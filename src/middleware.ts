// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  const isLoginPage = pathname.startsWith('/login');
  const isProtectedPage =
    pathname.startsWith('/timer') || pathname.startsWith('/profile');

  console.log('접근경로: ', pathname);

  console.log('accessToken: ', accessToken);

  console.log('보호페이지 입니까? ', isProtectedPage);

  if (isProtectedPage && !accessToken) {
    if (refreshToken) {
      // 1. Access 토큰이 없지만 Refresh 토큰이 있다면 갱신 라우트 핸들러로 리다이렉트
      // 갱신 후 다시 원래 가려던 페이지(pathname)로 돌아올 수 있게 쿼리 파라미터 활용 가능
      console.log('✅ Refresh 토큰만 있다면 갱신 라우트 핸들러로 리다이렉트');
      return NextResponse.redirect(
        new URL(`/api/auth/refresh?redirect=${pathname}`, req.url)
      );
    } else {
      console.log('✅ refresh, access 토큰 둘다 없음');
      // 2. 둘 다 없다면 로그인 페이지로 리다이렉트
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

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
