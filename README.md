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
- **State / Data**: Server Component + Client Component + **Context API(Auth)**
- **Auth**: JWT, HttpOnly Cookie
- **API**: Next.js Route Handler (**Catch-all Proxy Route**)
- **Lint / Format**: ESLint, Prettier

---

## 📁 폴더 구조

```text
src
├─ app
│  ├─ (full) # 로그인 이후 보호된 페이지 그룹
│  │  ├─ ...
│  │  ├─ timer
│  │  ├─ layout.tsx # AuthContext 적용 영역
│  │  └─ page.tsx
│  │
│  ├─ api # Route Handler (BFF)
│  │  ├─ auth
│  │  └─ proxy
│  │     └─ [...slug] # 캐치 올(Catch-all) 프록시 라우트
│  │
│  └─ middleware.ts # 인증/인가 및 타이머 라우트 제어
│
├─ constants # 상수 관리
│  ├─ endpoints.ts # PROXY 상수 관리
│  └─ ...
└─ ...

```

---

## 🔐 인증 및 라우팅 구조

- **중앙 집중형 인증**: `middleware.ts`에서 모든 보호 페이지 접근을 제어하며, `/api/auth/session`을
  통해 세션 유효성을 확인합니다.
- **전역 인증 상태**: `(full)` 그룹의 `layout`에 `AuthContext`를 적용하여, 로그인 이후의 모든
  페이지에서 실시간으로 유저 상태를 공유합니다.
- **API Proxy**: 백엔드 엔드포인트 노출을 최소화하기 위해 `[...slug]` 형태의 캐치 올 라우트를
  구현하였으며, `PROXY` 상수를 활용해 엔드포인트를 안전하게 관리합니다.

---

## ✍️ 구현하면서 신경 쓴 점

- **페이지 책임 분리**
- Server Component: 초기 데이터 패칭
- Client Component: 타이머 인터랙션 처리

- **인증 로직 고도화**
- Middleware를 통한 단일 진입점 처리뿐만 아니라, `AuthContext`를 통한 클라이언트 사이드 상태 동기화

- **확장 및 유지보수성**
- `PROXY` 상수를 도입하여 API 주소 변경 시 대응이 용이하도록 설계
- Catch-all route를 통한 유연한 API 프록시 구조 구축
