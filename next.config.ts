import { API_BASE_URL } from '@/config/env';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: false, // strict mode 비활성화
  async rewrites() {
    return [
      {
        source: '/api/:path((?!auth|proxy).*)', // auth, proxy 제외한 api 요청만 프록시(클라이언트가 던지는 주소)
        destination: `${API_BASE_URL}:path*`,
      },
    ];
  },
};

export default nextConfig;
