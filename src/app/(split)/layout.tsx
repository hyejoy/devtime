import { ReactNode } from 'react';
import styles from './layout.module.css';
import Logo from '../components/ui/Logo';
// # 헤더 없고 회원가입처럼 반반 나뉜 페이지
export default function layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <div className="bg-brand-primary flex flex-1 flex-col items-center justify-center gap-[36px]">
        <Logo direction="vertical" width="264" height="200" color="white" />
        <div className="text-[20px] leading-[24px] font-bold text-white">개발자를 위한 타이머</div>
      </div>

      <div className="hide-scrollbar flex flex-1 flex-col items-center justify-center overflow-y-scroll bg-white">
        {children}
      </div>
    </div>
  );
}
