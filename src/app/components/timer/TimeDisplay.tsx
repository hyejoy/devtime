import clsx from 'clsx';

const TimeDisplay = ({ unit, value }: { unit: string; value: string }) => {
  return (
    <div className="bg-timer-block border-brand-primary box-border flex h-auto w-auto flex-col items-center rounded-2xl border px-[7px] pt-2">
      <div className={'font-digital flex h-auto min-w-40 items-center justify-end gap-4'}>
        <div
          className={
            'text-brand-primary flex h-40 w-16 items-center justify-end rounded-b-lg text-[10rem]'
          }
        >
          {value[0]}
        </div>
        <div
          className={
            'text-brand-primary flex h-40 w-16 items-center justify-end rounded-b-lg text-[10rem]'
          }
        >
          {value[1]}
        </div>
      </div>
      <div className={'text-brand-primary my-6 text-[14px] leading-1 font-semibold opacity-[0.7]'}>
        {unit}
      </div>
    </div>
  );
};

TimeDisplay.displayName = 'TimeDisplay';
export default TimeDisplay;
