'use client';

import React, { ComponentProps, forwardRef } from 'react';
import clsx from 'clsx';

interface Props extends ComponentProps<'input'> {
  isValid?: boolean;
  feedbackMessage?: string;
  /** 피드백 메시지를 위한 하단 공간을 항상 확보할지 여부 */
  hasFeedback?: boolean;
}

const TextFieldInput = forwardRef<HTMLInputElement, Props>(
  (
    { isValid = true, feedbackMessage, hasFeedback = false, placeholder, className, ...props },
    ref
  ) => {
    const isError = !isValid && Boolean(feedbackMessage);
    const feedbackColor = isValid ? 'text-green-500' : 'text-red-500';

    return (
      <div className="flex w-full flex-col select-none">
        <input
          ref={ref}
          placeholder={placeholder}
          className={clsx(
            'h-[44px] w-full flex-1 rounded-[5px] border bg-[#f9f9f9] px-4 py-[12px] text-[14px] leading-[20px] transition-all outline-none placeholder:text-gray-300',
            isError ? 'border-red-500' : 'border-transparent focus:border-blue-400',
            className
          )}
          {...props}
        />

        {/*  hasFeedback이 true일 때만 공간을 유지하고, 
             메시지가 있을 때만 실제로 보여줍니다. */}
        {hasFeedback && (
          <div
            className={clsx(
              'mt-1 mb-1 min-h-[1rem] text-[12px] leading-4 font-medium transition-opacity select-none',
              feedbackColor,
              feedbackMessage ? 'visible opacity-100' : 'invisible opacity-0'
            )}
          >
            {feedbackMessage || ' '}
          </div>
        )}
      </div>
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';

export default TextFieldInput;
