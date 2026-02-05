import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 1. 기존 extends 설정 통합 (Next.js, TS, Prettier)
  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript',
    'eslint:recommended',
    'plugin:react/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ),
  {
    // 2. 무시할 파일 설정
    ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
  {
    // 3. 기존 parserOptions 및 환경 설정 (Flat Config 방식)
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // 4. 플러그인 및 규칙 설정
    rules: {
      // 기존 규칙 추가
      'jsx-a11y/label-has-associated-control': 'off',
      'jsx-a11y/anchor-is-valid': 'off',

      // 기존 덮어쓰기 규칙
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'off',

      // Prettier 충돌 방지 및 설정
      'prettier/prettier': 'off', // 포맷팅 에러는 IDE/CLI에서 직접 확인
      'react/react-in-jsx-scope': 'off', // Next.js에서는 필수 아님
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];

export default eslintConfig;
