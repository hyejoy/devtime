'use client';

import React, { ComponentProps, forwardRef } from 'react';

interface Props extends ComponentProps<'input'> {
  isValid?: boolean;
  feedbackMessage?: string;
  hasFeedback?: boolean;
}

const TextFieldInput = forwardRef<HTMLInputElement, Props>(
  ({ isValid, feedbackMessage, hasFeedback = false, className, ...props }, ref) => {
    // 에러 발생 시(유효하지 않고 메시지가 있을 때) 테두리 색상 결정
    const isError = !isValid && Boolean(feedbackMessage);

    // 상태에 따른 피드백 텍스트 색상 결정
    const feedbackTextColor = isValid
      ? 'text-[var(--color-feedback-positive)]'
      : 'text-[var(--color-feedback-negative)]';

    return (
      <div className="flex w-full flex-col select-none">
        <input
          ref={ref}
          className={`box-border h-[44px] min-w-0 flex-1 rounded-[5px] border bg-[var(--input-text-field-bg)] px-4 py-3 text-[14px] leading-[20px] text-[var(--input-text-field-text)] transition-colors outline-none placeholder:text-[var(--color-gray-300)] ${isError ? 'border-[var(--color-feedback-negative)]' : 'border-transparent'} ${className} `}
          {...props}
        />
        {hasFeedback && (
          <div
            className={`mt-[0.3rem] mb-[0.3rem] min-h-[1rem] text-[12px] leading-[1rem] font-medium select-none ${feedbackTextColor}`}
          >
            {feedbackMessage}
          </div>
        )}
      </div>
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';

export default TextFieldInput;
