# DevTime – Frontend Challenge

개발 학습 시간을 기록하고 관리하기 위한 타이머 기반 웹 애플리케이션  
Next.js(App Router) + TypeScript 기반으로 구현한 개인 프로젝트

---

## 🧩 프로젝트 개요

- 개발 공부 시간을 측정하고 기록하는 타이머 서비스
- 로그인/회원가입 → 타이머 실행 → 학습 기록 관리 흐름 구현
- JWT + HttpOnly Cookie 기반 인증 구조 설계
- API Route / Middleware를 활용한 인증 중앙 처리

---

## 🛠 기술 스택

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules, Design Token(colors.css)
- **State / Data**: Server Component + Client Component 혼합
- **Auth**: JWT, HttpOnly Cookie
- **API**: Next.js Route Handler
- **Lint / Format**: ESLint, Prettier

---

## 📁 폴더 구조

```text
src
├─ app
│ ├─ (full) # 로그인 이후 보호된 페이지 그룹
│ │ ├─ dashboard
│ │ ├─ mypage
│ │ ├─ profile_edit
│ │ ├─ ranking
│ │ └─ timer
│ │ ├─ layout.tsx
│ │ ├─ layout.module.css
│ │ └─ page.tsx
│ │
│ ├─ (split) # 비로그인/초기 플로우
│ │ ├─ profile_setup
│ │ └─ signup
│ │
│ ├─ (header) # 공통 헤더 레이아웃
│ │
│ ├─ api # Route Handler (BFF)
│ │ ├─ auth
│ │ │ ├─ login
│ │ │ ├─ refresh
│ │ │ └─ session
│ │ └─ timers
│ │ ├─ [timerId]
│ │ │ └─ stop
│ │ └─ route.ts
│ │
│ ├─ layout.tsx # Root Layout
│ └─ globals.css
│
├─ components # 공통 UI 컴포넌트
│
├─ services # API 호출 로직
│ ├─ login.ts
│ ├─ signup.ts
│ └─ timer.ts
│
├─ lib
│ └─ fetcher.ts # 공통 fetch wrapper
│
├─ constants # 상수 관리
│ ├─ endpoints.ts
│ ├─ regex.ts
│ ├─ signupMessage.ts
│ └─ termsOfService.ts
│
├─ styles
│ └─ tokens
│ └─ colors.css # 디자인 토큰
│
├─ types # API / 도메인 타입 정의
│ ├─ api.ts
│ ├─ login.ts
│ ├─ signup.ts
│ └─ timer.ts
│
└─ middleware.ts # 인증/인가 미들웨어
```

---

## 🔐 인증 구조

- 로그인 시 서버에서 **JWT 발급 → HttpOnly Cookie 저장**
- 클라이언트는 토큰을 직접 다루지 않음
- 모든 보호 페이지 접근 시 `middleware.ts`에서 인증 여부 판단
- `/api/auth/session`을 통해 세션 유효성 확인 및 리다이렉트 처리

---

## ✍️ 구현하면서 신경 쓴 점

- **페이지 책임 분리**
  - Server Component: 초기 데이터 패칭
  - Client Component: 타이머 인터랙션 처리
- **인증 로직 중앙화**
  - 각 페이지에서 토큰 검사 X
  - middleware에서 단일 진입점 처리
- **확장 가능한 구조**
  - services / constants / types 분리
  - API 변경 시 영향 범위 최소화
