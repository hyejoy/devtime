import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <h1>Onboarding Profile layout Component</h1>
      {children}
    </>
  );
}
