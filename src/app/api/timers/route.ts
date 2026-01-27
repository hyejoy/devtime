import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { NextRequest, NextResponse } from 'next/server';

/** 타이머 조회 */
export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  console.log('🍪 src/app/api/timers GET 실행! cookie:', cookie);
  const { pathname } = req.nextUrl;
  // accessToken 추출
  const accessToken = cookie
    .split('; ')
    .find((c) => c.startsWith('accessToken='))
    ?.split('=')[1];

  console.log('🎯 accessToken:', accessToken);

  // === 여기서 여러 방식으로 테스트 ===
  const res = await fetch(`${API_BASE_URL}${API.TIMER.TIMERS}`, {
    headers: {
      Authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  });

  console.log('🍀 API response status:', res.status);

  // access 토큰만료
  if (res.status === 401) {
    return NextResponse.redirect(
      new URL(`/api/auth/refresh?redirect=${pathname}`, req.url)
    );
  }

  const data = await res.json();
  console.log('🐤Fetch data :', data);

  return NextResponse.json(data, {
    status: res.status,
  });
}

/** 타이머 생성 (POST) */
export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';

  console.log('🍪 src/app/api/timers POST 실행! cookie:', cookie);

  const accessToken = cookie
    .split('; ')
    .find((c) => c.startsWith('accessToken='))
    ?.split('=')[1];

  if (!accessToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json(); // Postman body 여기서 받음

  const res = await fetch(`${API_BASE_URL}${API.TIMER.TIMERS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await res.json(), {
    status: res.status,
  });
}
