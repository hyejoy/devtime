import { API_BASE_URL } from '@/config/env';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// GET, POST, PUT, DELETE 해당 헨들러 하나로 처리
async function handleRequest(
  req: NextRequest,
  { params }: { params: Promise<{ url: string[] }> }
) {
  const { url } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const targetPath = url.join('/');
  const query = req.nextUrl.search;

  const externalApiUrl = `${API_BASE_URL}/api/${targetPath}${query}`;
  console.log('Next.js → Server 요청 경로 : ', externalApiUrl);

  // 요청 본문(body)_ GET/DELETE 제외
  let body = null;
  if (!['GET', 'HEAD'].includes(req.method)) {
    try {
      body = await req.text();
    } catch (e) {
      body = null;
    }
  }
  try {
    const res = await fetch(externalApiUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
      body,
      cache: 'no-store',
    });

    // 401 발생시 리프레시 로직으로 유도
    if (res.status === 401) {
      const { pathname } = req.nextUrl;
      // 토큰 갱신 핸들러로 리다이렉트 (돌아올 경로를 redirect 쿼리에 담아서!)
      return NextResponse.redirect(
        new URL(`/api/auth/refresh?redirect=${pathname}`, req.url)
      );
    }

    // BE가 응답은 했으나 에러인 경우 (400, 404, 500 등)
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({})); // JSON이 아닐 경우 대비
      return NextResponse.json(
        {
          error: errorBody,
        },
        { status: res.status } // BE가 준 statusCode
      );
    }

    // 2. 성공 시
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy Error:', error); // 디버깅용
    return NextResponse.json(
      {
        message:
          '현재 백엔드 서버와 통신할 수 없습니다. (Internal Server Error)',
      },
      { status: 500 }
    );
  }
}

// 모든 메서드를 동일한 함수로 연결
export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
