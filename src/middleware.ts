import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const url = req.nextUrl.clone(); // URL 객체 복제

  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  // 쿠키값이 'true'일 때만 첫 로그인으로 간주
  const isFirstLogin = req.cookies.get('isFirstLogin')?.value === 'true';
  // 이미 첫 로그인이 아닌 사용자가 프로필 설정 페이지에 접근하려고 할 때
  if (pathname === '/profile/setup') {
    // 로그인이 안 되어 있다면 메인으로
    if (!accessToken && !refreshToken) {
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
    // 이미 프로필 설정을 완료한 유저(isFirstLogin이 false)라면 타이머로 튕겨내기
    if (!isFirstLogin) {
      console.log('⚠️ 첫 로그인이 아닌 유저입니다. 타이머로 이동합니다.');
      url.pathname = '/timer';
      return NextResponse.redirect(url);
    }
  }
  const isLoginPage = pathname === '/' || pathname.startsWith('/login');
  const isProtectedPage =
    pathname.startsWith('/timer') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/dashboard');

  const hasAccess = Boolean(accessToken);
  const hasRefresh = Boolean(refreshToken);

  // 1. 보호된 페이지 접근 시
  if (isProtectedPage) {
    // 토큰이 아예 없는 경우
    if (!hasAccess && !hasRefresh) {
      url.pathname = '/'; // 절대 경로 대신 pathname 수정 방식 권장
      return NextResponse.redirect(url);
    }

    // Access 토큰은 없는데 Refresh만 있는 경우 (자동 갱신 API로 전송)
    if (!hasAccess && hasRefresh) {
      // API 라우트로 보낼 때 현재 보던 페이지 정보를 쿼리로 전달
      const refreshUrl = new URL('/api/auth/refresh', req.url);
      refreshUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(refreshUrl);
    }
  }

  // 2. 로그인된 사용자가 로그인/루트 페이지 접근 시
  if (isLoginPage && (hasAccess || hasRefresh)) {
    if (isFirstLogin) {
      url.pathname = '/profile/setup';
      return NextResponse.redirect(url);
    }

    // 이미 로그인된 유저가 루트(/)나 /login에 오면 /timer로 보냄
    url.pathname = '/timer';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 아래 경로를 제외한 모든 경로에서 미들웨어 실행:
     * - api (API 라우트)
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
