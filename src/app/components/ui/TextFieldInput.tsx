'use client';

import { ChangeEvent, HTMLInputTypeAttribute, forwardRef } from 'react';
import styles from './TextFieldInput.module.css';
export type FeedbackMessageType = boolean | null;

type Props = {
  name: string;
  value: string;
  onChangeValue: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  feedbackMessage?: string;
  valiConfirm?: boolean;
};

const TextFieldInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      name,
      value,
      onChangeValue,
      placeholder,
      type = 'text',
      feedbackMessage,
      valiConfirm,
    },
    ref
  ) => {
    const messageInputType = valiConfirm || !feedbackMessage ? '' : 'negative';
    const messageTextType = valiConfirm ? '' : 'negative_text';

    return (
      <>
        <div className={styles.inputBox}>
          <input
            ref={ref}
            name={name}
            value={value}
            onChange={(e) => onChangeValue(e)}
            placeholder={placeholder}
            type={type}
            className={`${styles.input} ${styles[messageInputType]}`}
          />
          <div className={`${styles.feedback} ${styles[messageTextType]}`}>
            {feedbackMessage}
          </div>
        </div>
      </>
    );
  }
);

TextFieldInput.displayName = 'TextFieldInput';
export default TextFieldInput;
