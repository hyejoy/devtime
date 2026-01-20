'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styles from './TextFieldInput.module.css';
import classNames from 'classnames/bind';

// classnames 적용
const cx = classNames.bind(styles);
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean;
  feedbackMessage?: string;
}

const TextFieldInput = forwardRef<HTMLInputElement, Props>(
  ({ isValid, feedbackMessage, className, ...rest }, ref) => {
    const messageInputType = isValid || !feedbackMessage ? '' : 'negative';
    const messageTextType = isValid ? '' : 'negative_text';

    return (
      <div className={cx('inputBox')}>
        <input
          ref={ref}
          className={cx('input', messageInputType, className)}
          {...rest}
        />
        {feedbackMessage && (
          <div className={cx('feedback', messageTextType)}>
            {feedbackMessage}
          </div>
        )}
      </div>
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';

export default TextFieldInput;
