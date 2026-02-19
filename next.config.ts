import { API_BASE_URL } from '@/config/env';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // 이미지 최적화를 위한 외부 도메인 설정 추가
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev-time-bucket.s3.ap-northeast-2.amazonaws.com',
        port: '',
        pathname: '/**', // 버킷 내의 모든 경로 허용
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/:path((?!auth|proxy).*)',
        destination: `${API_BASE_URL}:path*`,
      },
    ];
  },
};

export default nextConfig;
