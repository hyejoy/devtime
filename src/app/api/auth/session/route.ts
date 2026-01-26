// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';

export async function GET(req: NextRequest) {
  const accessToken = req.cookies.get('accessToken')?.value;
  const refreshToken = req.cookies.get('refreshToken')?.value;
  const isProd = process.env.NODE_ENV === 'production';

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

  // access, refresh 둘 다 없음
  if (!accessToken && !refreshToken) {
    const res = NextResponse.json(
      { errorCode: 'UNAUTHENTICATED' },
      { status: 401 }
    );
    clearAuthCookies(res);
    return res;
  }

  // access 없음 + refresh 있음 → 재발급
  if (!accessToken && refreshToken) {
    const refreshRes = await fetch(`${API_BASE_URL}${API.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await refreshRes.json();

    if (!refreshRes.ok) {
      const res = NextResponse.json(data, { status: refreshRes.status });
      clearAuthCookies(res);
      return res;
    }

    const {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
      refreshTokenExpiresIn,
    } = data;

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

  // access 있음 → 정상
  return NextResponse.json({ ok: true });
}
