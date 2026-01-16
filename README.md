# DevTime

Study timer application built with Next.js and TypeScript.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- ESLint / Prettier

```bash
app/
  (public)/
    page.tsx              // 서비스 소개 or 진입
  (auth)/
    login/page.tsx
    signup/page.tsx
  (private)/
    layout.tsx
    timer/page.tsx        // 메인 기능
    dashboard/page.tsx
    dashboard/[userId]/page.tsx
    ranking/page.tsx
    my/page.tsx
    my/edit/page.tsx      // 회원정보 수정
```
