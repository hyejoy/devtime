import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? '';
  console.log('🍪 raw cookie:', cookie);

  // accessToken 추출
  const accessToken = cookie
    .split('; ')
    .find((c) => c.startsWith('accessToken='))
    ?.split('=')[1];

  console.log('🎯 accessToken:', accessToken);

  // === 여기서 여러 방식으로 테스트 ===
  const res = await fetch(`${API_BASE_URL}${API.TIMER.GET_ACTIVE_TIMER}`, {
    headers: {
      // 1️⃣ Bearer 방식
      Authorization: accessToken ? `Bearer ${accessToken}` : '',

      // 2️⃣ 토큰만 그대로 보내는 방식 (Bearer 없이)
      'x-access-token': accessToken ?? '',

      // 3️⃣ 쿠키 그대로 전달 (혹시 서버가 Cookie 읽는 경우)
      cookie,

      // 4️⃣ 일부 서버가 기대하는 커스텀 헤더
      'access-token': accessToken ?? '',
    },
  });

  console.log('🍀 API response status:', res.status);

  const data = await res.json();

  return NextResponse.json(data, {
    status: res.status,
  });
}
