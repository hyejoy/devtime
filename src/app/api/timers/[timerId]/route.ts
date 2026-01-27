import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // 쿠키 접근을 위해 추가

export async function PUT(req: NextRequest, { params }: { params: any }) {
  try {
    const { timerId } = await params;
    const body = await req.json();

    // 1. 브라우저가 보낸 쿠키에서 accessToken 꺼내기
    const accessToken = req.cookies.get('accessToken')?.value;

    // 2. 외부 API 호출 시 Authorization 헤더에 토큰 추가
    const res = await fetch(
      `${API_BASE_URL}${API.TIMER.PUT_TIMERS}${timerId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Backend Error:', errorText);
      return NextResponse.json({ error: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Route Handler Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
