import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. Prettier와 충돌하는 ESLint 규칙을 끄기 위해 'prettier' 추가 권장
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',
      // 필요 시 Prettier 권장 규칙 추가
      'prettier/prettier': 'off', // ESLint에서 Prettier 에러를 잡지 않도록 설정 (포맷팅은 오직 Prettier가 담당)
    },
  },
];

export default eslintConfig;