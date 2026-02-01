import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/config/env';

// GET, POST, PUT, DELETE 등 모든 요청을 처리하기 위해 각각 export 합니다.
async function handler(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // 1. 브라우저가 보낸 경로 추출 (예: /api/proxy/timers -> ['timers'])
    const path = params.path.join('/');
    const searchParams = req.nextUrl.search; // ?email=... 같은 쿼리 스트링 포함

    // 2. 실제 백엔드 주소와 합치기
    const targetUrl = `${API_BASE_URL}/${path}${searchParams}`;

    // 3. 브라우저가 보낸 모든 헤더와 쿠키 가져오기
    const headers = new Headers(req.headers);

    // 클라이언트가 보낸 쿠키(accessToken 등)가 있다면 백엔드 fetch 시 포함됩니다.
    // (credentials: 'include' 설정과 같은 효과를 내기 위해 headers를 그대로 전달)

    const fetchOptions: RequestInit = {
      method: req.method,
      headers: headers,
      // GET이나 HEAD가 아닐 때만 body를 포함합니다.
      body:
        req.method !== 'GET' && req.method !== 'HEAD'
          ? await req.text()
          : undefined,
    };

    const backendRes = await fetch(targetUrl, fetchOptions);

    // 4. 백엔드 응답을 그대로 클라이언트에 반환
    const data = await backendRes.json().catch(() => ({}));

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error('❌ Proxy Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
