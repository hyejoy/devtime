// app/api/auth/refresh/route.ts 수정안
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const redirectPath = searchParams.get('redirect') || '/timer'; // 갱신 후 돌아갈 경로

  const refreshToken = req.cookies.get('refreshToken')?.value;
  const isProd = process.env.NODE_ENV === 'production';

  if (!refreshToken) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    // 쿠키 제거 로직...
    return res;
  }

  const refreshRes = await requestRefreshToken(refreshToken); // 백엔드에 갱신 요청
  const refreshData = await refreshRes.json();

  if (!refreshRes.ok) {
    const res = NextResponse.redirect(new URL('/login', req.url));
    // 실패 시 로그아웃 처리...
    return res;
  }

  // 성공 시 새로운 토큰을 쿠키에 굽고 원래 페이지로 이동
  const res = NextResponse.redirect(new URL(redirectPath, req.url));

  res.cookies.set('accessToken', refreshData.accessToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: refreshData.accessTokenExpiresIn,
    path: '/',
  });

  res.cookies.set('refreshToken', refreshData.refreshToken, {
    httpOnly: true,
    secure: isProd,
    maxAge: refreshData.refreshTokenExpiresIn,
    path: '/',
  });

  return res;
}
