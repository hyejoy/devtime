# DevTime – Frontend Challenge

개발 학습 시간을 기록하고 관리하기 위한 타이머 기반 웹 애플리케이션입니다.  
Next.js(App Router)와 TypeScript를 기반으로 안정적인 상태 관리와 사용자 경험을 고려하여
개발되었습니다.

## ⏰ 프로젝트 개요

- **타이머 기반 학습 관리**: 개발 공부 시간을 측정하고 일별/주별 기록을 관리합니다.
- **맞춤형 프로필 설정**: 개발 경력, 공부 목적(기타 입력 기능 포함) 등 사용자별 맞춤 정보를
  수집합니다.
- **보안 강화**: JWT + HttpOnly Cookie 기반의 인증 구조 및 Middleware 접근 제어를 구현했습니다.
- **유연한 API 연동**: Catch-all Proxy Route를 활용하여 백엔드 엔드포인트를 보호하고 효율적으로
  통신합니다.

## 🔑 테스트 계정

서비스를 빠르게 둘러보실 수 있도록 테스트 계정을 제공합니다.

- **아이디**: `test@prokit.dev`
- **비밀번호**: `TestAccount2024!`

> **Note**: 테스트 계정은 공유용이므로 정보 수정 시 다른 사용자에게 영향을 줄 수 있습니다. 가능하면 새로운 계정을 생성하여 테스트하시는 것을 권장합니다.

## 🛠 기술 스택

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **State Management**: Zustand (with Immer) - 복잡한 프로필 객체 상태를 불변성을 유지하며 관리
- **Styling**: Tailwind CSS, CSS Modules
- **Auth**: JWT, HttpOnly Cookie
- **API**: Next.js Route Handler (Catch-all Proxy Route)
- **Icons**: Lucide React

## 📁 주요 폴더 구조

```plaintext
public
├─ fonts # Pretendard, Digital-7 등 폰트 에셋 관리
└─ images # bg, profile, timer 등 도메인별 이미지 관리

src
├─ app # App Router 기반 페이지 구성
│  ├─ (full) # 로그인/프로필 설정 등 레이아웃 그룹
│  ├─ api # Route Handler (Proxy & Auth)
│  └─ components # 도메인/공통 UI 컴포넌트
│     ├─ profileSetup # 프로필 설정 관련 컴포넌트
│     └─ ui # SelectBox, TextFieldInput 등 공통 UI
├─ constants # SelectBox 옵션, 메시지, 정규식 등 상수 관리
├─ services # API 호출 로직 분리 (profileService, signupService)
├─ store # Zustand 기반 전역 상태 관리 (profileStore, dialogStore)
├─ types # TypeScript 인터페이스 및 유니온 타입 정의
└─ middleware.ts # 인증 및 라우팅 접근 제어
```

## ✨ 핵심 구현 사항

### 1. 지능형 프로필 설정 폼

- **유연한 타입 시스템**: 공부 목적 선택 시 '기타' 항목을 통해 사용자 직접 입력을 지원합니다.
- **동적 UI 렌더링**: 사용자가 선택한 값에 따라 입력 필드가 동적으로 나타나며, TypeScript의 Type
  Guard를 활용하여 객체와 문자열 타입을 안전하게 처리합니다.
- **UX 최적화**: 폼 요소 간의 간격(Gap)을 그룹화하여 시각적으로 연관된 정보(공부 목적 - 상세 입력)를
  인지하기 쉽게 배치했습니다.

### 2. Zustand 기반 전역 상태 관리

- **Immer 연동**: 중첩된 프로필 객체 구조를 Immer를 통해 직관적이고 안전하게 업데이트합니다.
- **중앙 집중식 액션**: 프로필 초기화, 수정, 초기값 복구(Revert) 로직을 스토어 내부에 캡슐화하여
  컴포넌트의 복잡도를 낮추었습니다.

### 3. API Proxy 및 인증 보안

- **Proxy Route Handler**: 클라이언트에서 직접적인 백엔드 호출을 숨기고 `/api/proxy`를 통해 통신하여
  보안성을 높였습니다.
- **Middleware 보호**: 보호된 라우트에 대한 접근 권한을 중앙에서 제어하여 비인가 사용자의 접근을
  차단합니다.

## ✍️ 개발 시 주안점

- **타입 안정성**: API 응답 타입과 클라이언트 UI 전용 타입을 분리하여 유니온 타입(string | object)
  처리 시 발생할 수 있는 런타임 에러를 사전에 방지했습니다.
- **컴포넌트 재사용성**: SelectBox, TextFieldInput, Button 등 공통 UI 컴포넌트를 설계하여 일관된
  디자인 시스템을 유지했습니다.
- **관심사 분리**: API 통신(services), 상태 관리(store), UI(components)의 책임을 명확히 분리하여
  유지보수성을 확보했습니다.
