'use client';

import React, { ComponentProps, forwardRef, InputHTMLAttributes } from 'react';
import styles from './TextFieldInput.module.css';
import classNames from 'classnames/bind';

export type FeedbackMessageType = boolean | null;

// classnames 적용
const cx = classNames.bind(styles);

interface Props extends ComponentProps<'input'> {
  isValid?: boolean;
  feedbackMessage?: string;
  valiConfirm?: boolean;
}

const TextFieldInput = forwardRef<HTMLInputElement, Props>(
  ({ isValid, feedbackMessage, placeholder, className, ...props }, ref) => {
    const InputBorer =
      !isValid && Boolean(feedbackMessage) ? 'negativeBorder' : '';
    const messageTextType = isValid ? 'positive' : 'negative';

    return (
      <div className={cx('inputBox')}>
        <input
          ref={ref}
          className={cx('input', InputBorer, className)}
          placeholder={placeholder}
          {...props}
        />
        <div className={cx('feedback', messageTextType)}>{feedbackMessage}</div>
      </div>
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';
export default TextFieldInput;
