'use client';

import React, { forwardRef, InputHTMLAttributes } from 'react';
import styles from './TextFieldInput.module.css';
import classNames from 'classnames/bind';

// classnames 적용
const cx = classNames.bind(styles);
interface Props extends InputHTMLAttributes<HTMLInputElement> {
  isValid?: boolean;
  feedbackMessage?: string;
  placeholder?: string;
  className?: string;
}

const TextFieldInput = forwardRef<HTMLInputElement, Props>(
  ({ isValid, feedbackMessage, placeholder, className, ...rest }, ref) => {
    const InputBorer =
      !isValid && Boolean(feedbackMessage) ? 'negativeBorder' : '';
    const messageTextType = isValid ? 'positive' : 'negative';

    return (
      <div className={cx('inputBox')}>
        <input
          ref={ref}
          className={cx('input', InputBorer, className)}
          placeholder={placeholder}
          {...rest}
        />
        <div className={cx('feedback', messageTextType)}>{feedbackMessage}</div>
      </div>
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';

export default TextFieldInput;
