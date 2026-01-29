// app/api/auth/login/route.ts
import { API_BASE_URL } from '@/config/env';
import { API } from '@/constants/endpoints';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    console.log('🌐 [cookieHeader] Raw Cookies:', cookieHeader);
    // 만약 여기서 아무것도 안 찍힌다면 브라우저가 쿠키 전송을 거부한 것입니다.
    const accessToken = req.cookies.get('accessToken')?.value;
    // 1. 백엔드에 토큰을 실어서 로그아웃 요청
    const backendRes = await fetch(`${API_BASE_URL}${API.AUTH.LOGOUT}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    const data = await backendRes.json();
    console.log('🧡 Backend Logout Response:', data);

    // 2. 응답 객체 생성
    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
    // 3. 브라우저 쿠키 삭제 (Max-Age를 0으로 설정)
    // 보안 옵션(HttpOnly, Secure 등)은 설정할 때와 동일하게 맞춰주는 것이 좋습니다.
    const cookieOptions = {
      path: '/',
      maxAge: 0,
      expires: new Date(0), // 1970년으로 설정하여 즉시 폐기
      httpOnly: true,
      secure: process.env.NODE_ENV === 'development',
      sameSite: 'lax' as const,
    };

    response.cookies.set('accessToken', '', cookieOptions);
    response.cookies.set('refreshToken', '', cookieOptions);

    return response;
  } catch (error) {
    console.log('err?', error);

    return NextResponse.json(
      { error: 'Internal Server Error during logout' },
      { status: 500 }
    );
  }
}
