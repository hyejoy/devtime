'use client';
import CheckBox from '@/app/components/ui/CheckBox';
import { ChangeEvent } from 'react';
import { TERMS_OF_SERVICE } from '@/constants/termsOfService';
import clsx from 'clsx';
type Props = {
  isChecked: boolean;
  isSubmitted: boolean;
  onChangeChecked: (checked: boolean) => void;
};

export default function SignupTerms({ isChecked, isSubmitted, onChangeChecked }: Props) {
  const onToggleCheck = (e: ChangeEvent<HTMLInputElement>) => {
    const chekced = e.currentTarget.checked;
    onChangeChecked(chekced);
  };

  return (
    <>
      <div
        className={clsx(
          'mt-[32px] mb-[0.4rem] flex w-full justify-between',
          'align-baseline text-[14px] leading-4 font-medium text-gray-600'
        )}
      >
        <div>이용약관</div>
        <CheckBox
          id="signup-term-checkbox"
          isChecked={isChecked}
          isSubmitted={isSubmitted}
          label="동의함"
          onToggleCheck={onToggleCheck}
        />
      </div>
      <div>
        <p
          className={clsx(
            'box-border max-h-[5.7rem] w-full rounded-[5px] bg-gray-50 px-4 py-3',
            'hide-scrollbar mb-12 overflow-scroll text-[12px] leading-4 font-normal',
            'whitespace-pre-line text-gray-600'
          )}
        >
          {TERMS_OF_SERVICE}
        </p>
      </div>
    </>
  );
}
