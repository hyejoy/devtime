'use client';

import React, { ChangeEvent, HTMLInputTypeAttribute, forwardRef } from 'react';
import styles from './TextFieldInput.module.css';

type Props<T extends string> = {
  name: T;
  value: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  isValid?: boolean;
  feedbackMessage?: string;
  onChangeValue: (name: T, value: string) => void;
};

/** 1️⃣ 내부 구현 (제네릭 유지) */
function TextFieldInputInner<T extends string>(
  {
    name,
    value,
    placeholder,
    type = 'text',
    isValid,
    feedbackMessage,
    onChangeValue,
  }: Props<T>,
  ref: React.Ref<HTMLInputElement>
) {
  const messageInputType = isValid || !feedbackMessage ? '' : 'negative';
  const messageTextType = isValid ? '' : 'negative_text';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChangeValue(name, e.target.value);
  };

  return (
    <div className={styles.inputBox}>
      <input
        ref={ref}
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        type={type}
        className={`${styles.input} ${styles[messageInputType]}`}
      />
      <div className={`${styles.feedback} ${styles[messageTextType]}`}>
        {feedbackMessage}
      </div>
    </div>
  );
}

/** 2️⃣ forwardRef로 감싸고 JSX 컴포넌트 타입으로 캐스팅 */
const TextFieldInput = forwardRef(TextFieldInputInner) as <T extends string>(
  props: Props<T> & { ref?: React.Ref<HTMLInputElement> }
) => jsx.Element;

TextFieldInput.displayName = 'TextFieldInput';

export default TextFieldInput;
