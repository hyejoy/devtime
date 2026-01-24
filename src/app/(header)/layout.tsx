import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <>
      <h1>Header Layout</h1>
      {children}
    </>
  );
}
