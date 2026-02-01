// src/config/env.ts

// 1. 현재 환경 판별 (Next.js가 실행 시점에 자동으로 결정)
export const IS_PROD = process.env.NODE_ENV === 'production';
export const IS_DEV = process.env.NODE_ENV === 'development';

// 2. 실제 백엔드 주소 설정
// 로컬에서는 임시 주소를, 배포 후에는 Vercel의 환경 변수를 사용합니다.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://devtime.prokit.app/api';

// 3. API 호출 시 사용할 기본 경로
// 브라우저는 항상 /api/proxy로 요청을 보냅니다.
export const PROXY_BASE = '/api/proxy';
