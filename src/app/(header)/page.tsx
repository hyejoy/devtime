'use client';

import clsx from 'clsx';
import TimeDisplay from '@/app/components/timer/TimeDisplay';
import TimerButton from '@/app/components/timer/TimerButton';

export default function Page() {
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

        <div className={'mt-20 flex h-[100px] w-[55%] items-center justify-center'}>
          <div className={'flex items-center gap-14'}>
            <TimerButton timerType="start" active={true} />
            <TimerButton timerType="pause" active={false} />
            <TimerButton timerType="finish" active={false} />
          </div>
        </div>
      </main>
    </>
  );
}
