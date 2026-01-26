// app/api/auth/session/route.ts
import { requestRefreshToken } from '@/services/login';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;

  const isProd = process.env.NODE_ENV === 'production';

  /** 인증 쿠키 제거 */
  const clearAuthCookies = (res: NextResponse) => {
    const common = {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    };

    res.cookies.set('accessToken', '', common);
    res.cookies.set('refreshToken', '', common);
  };

  /** access, refresh 모두 없음 */
  if (!accessToken && !refreshToken) {
    const res = NextResponse.json(
      { errorCode: 'UNAUTHENTICATED' },
      { status: 401 }
    );
    clearAuthCookies(res);
    return res;
  }

  /** access 없음 + refresh 있음 → refresh 시도 */
  if (!accessToken && refreshToken) {
    const refreshRes = await requestRefreshToken(refreshToken);
    const refreshData = await refreshRes.json();

    // refresh 실패
    if (!refreshRes.ok) {
      const res = NextResponse.json(refreshData, {
        status: refreshRes.status,
      });
      clearAuthCookies(res);
      return res;
    }

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    } = refreshData;

    const res = NextResponse.json({ ok: true });

    res.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: accessTokenExpiresIn,
    });

    res.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: refreshTokenExpiresIn,
    });

    return res;
  }

  /** access 있음 → 정상 */
  return NextResponse.json({ ok: true });
}
