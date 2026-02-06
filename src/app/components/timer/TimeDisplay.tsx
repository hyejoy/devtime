import clsx from 'clsx';

const TimeDisplay = ({ unit, value }: { unit: string; value: string }) => {
  return (
    <div className="bg-timer-block border-brand-primary box-border flex h-[298px] w-[264px] flex-col items-center rounded-2xl border px-[7px] pt-2">
      <div className="font-digital flex h-auto min-w-40 items-center justify-end gap-4">
        <div className="flex h-[200px] w-[250px] justify-center px-[7px] py-[8px]">
          <div
            className={
              'text-brand-primary text- flex h-auto w-16 flex-1 items-center justify-center rounded-b-lg text-[12rem]'
            }
          >
            {value[0]}
          </div>
          <div
            className={
              'text-brand-primary text- flex h-auto w-16 flex-1 items-center justify-center rounded-b-lg text-[12rem]'
            }
          >
            {value[1]}
          </div>
        </div>
      </div>
      <div
        className={'text-brand-primary pt-[48px] text-[14px] leading-1 font-semibold opacity-[0.7]'}
      >
        {unit}
      </div>
    </div>
  );
};

TimeDisplay.displayName = 'TimeDisplay';
export default TimeDisplay;
