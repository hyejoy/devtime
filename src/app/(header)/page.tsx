'use client';

import TimeDisplay from '@/app/components/timer/TimeDisplay';
import TimerButton from '@/app/components/timer/TimerButton';
import LoginDialog from '../components/dialog/login/LoginDialog';
import Button from '@/app/components/ui/Button';
import { useDialogStore } from '@/store/dialogStore';

export default function Page() {
  const { isOpen, openDialog, closeDialog } = useDialogStore();
  const handleClickStartBtn = () => {
    openDialog();
  };
  return (
    <>
      <main className="flex flex-col items-center justify-center">
        <section className="mt-[85px] mb-[50px]">
          <div className="text-primary-900 text-[72px] font-bold">WELCOME</div>
          <div className="text-primary-900 flex justify-center text-[14px] font-normal">
            DevTime을 사용하려면 로그인이 필요합니다.
          </div>
        </section>

        <div className={'flex h-auto justify-center'}>
          <TimeDisplay unit="HOURS" value={'00'} />
          <div className={'font-pretendard text-brand-primary box-border px-8 py-4 text-[160px]'}>
            :
          </div>
          <TimeDisplay unit="MINUTES" value={'00'} />
          <div className={'font-pretendard text-brand-primary box-border px-8 py-4 text-[160px]'}>
            :
          </div>
          <TimeDisplay unit="SECONDS" value={'00'} />
        </div>

        <div className={'mt-20 flex h-[100px] w-[1024px] items-center justify-center'}>
          <div className={'flex w-[680px] justify-end gap-14'}>
            <TimerButton timerType="start" active={true} onClick={handleClickStartBtn} />
            <TimerButton timerType="pause" active={false} />
            <TimerButton timerType="finish" active={false} />
          </div>
          <div className={'flex flex-1 justify-end'}></div>
        </div>
      </main>
      {isOpen && (
        <LoginDialog
          dialogType="need-login"
          alignButton="align-right"
          nextRoute={'/login'}
          buttonChildren={<Button variant="secondary">취소</Button>}
        ></LoginDialog>
      )}
    </>
  );
}
