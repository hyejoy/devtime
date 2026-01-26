// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';

export async function POST(req: NextRequest) {
  const body = await req.json();
  console.log('body: ', body);

  const isProd = process.env.NODE_ENV === 'production';

  const backendRes = await fetch(`${API_BASE_URL}${API.AUTH.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  console.log('data: ', data);

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const {
    accessToken,
    refreshToken,
    accessTokenExpiresIn,
    refreshTokenExpiresIn,
  } = data;

  const res = NextResponse.json({ ok: true });

  res.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: accessTokenExpiresIn,
  });

  res.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenExpiresIn,
  });

  return res;
}
