import { ReactNode } from 'react';

export default function layout({ children }: { children: ReactNode }) {
  return (
    <>
      <h1>layout Component</h1>
      {children}
    </>
  );
}
