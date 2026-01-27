import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { NextRequest, NextResponse } from 'next/server';

/** 타이머 종료 (POST) /api/timers/[timerId]/stop */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ timerId: string }> } // params 타입 정의
) {
  try {
    const { timerId } = await params; // 1. 경로에서 timerId 추출
    const cookie = req.headers.get('cookie') ?? '';

    // 2. Access Token 추출 (더 안전한 로직)
    const accessToken = cookie
      .split('; ')
      .find((c) => c.startsWith('accessToken='))
      ?.split('=')[1];

    if (!accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json(); // 3. 클라이언트가 보낸 데이터 (splitTimes, review, tasks)

    console.log('bodybody~~~~~~', body);

    // 4. 백엔드 실제 엔드포인트로 요청
    // URL 예시: https://api.example.com/api/timers/uuid-123/stop
    const res = await fetch(
      `${API_BASE_URL}${API.TIMER.TIMERS}/${timerId}/stop`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );
    // 1. 데이터를 변수에 딱 한 번만 담습니다.
    const data = await res.json();

    // 2. 로그를 찍을 때도 이 변수를 사용합니다.
    if (res.status >= 400) {
      console.error('❌ 백엔드 에러 상세:', data);
    }

    // 3. 응답을 보낼 때도 이미 담아둔 data 변수를 보냅니다.
    return NextResponse.json(data, {
      status: res.status,
    });
  } catch (error: any) {
    console.error('Route Handler Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
