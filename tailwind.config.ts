import type { Config } from 'tailwindcss';

const config: Config = {
  // src 폴더 내부의 모든 폴더를 감시하도록 설정
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}', // src 내부의 모든 파일을 뒤져라!
    './app/**/*.{js,ts,jsx,tsx,mdx}', // 혹시 src 밖에 app이 있을 경우 대비
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary-30': 'var(--color-brand-primary-30)',
        'primary-900': 'var(--color-primary-900)',
      },
    },
  },
  plugins: [],
};
export default config;
